import { prisma } from "../../lib/prisma.js";
import type { CreateTicketInput } from "./ticket.validation.js";
import type { ListTicketsInput } from "./ticket.validation.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { AppError } from "../../utils/app.error.js";
import type { TicketStatus } from "../../generated/prisma/enums.js";
import {
  canAccessTicket,
} from "./ticket.authorization.js";
import type {
  UpdateTicketInput,
} from "./ticket.validation.js";

import {
  validateStatusTransition,
} from "./ticket.lifecycle.js";
import { buildTicketWhere } from "./ticket.filters.js";
const SLA_TARGETS: Record<
  CreateTicketInput["priority"],
  number
> = {
  LOW: 24 * 60 * 60,
  MEDIUM: 12 * 60 * 60,
  HIGH: 4 * 60 * 60,
  URGENT: 60 * 60,
};
export async function createTicket(
  input: CreateTicketInput,
  actorId: string
) {
  let assigneeId = input.primaryAssigneeId;

  if (!assigneeId) {
    assigneeId = actorId;
  }

  const assignee = await prisma.user.findUnique({
    where: {
      id: assigneeId,
    },
  });

  if (!assignee) {
    throw new Error("Assigned user not found");
  }

  if (assignee.role !== "AGENT") {
    throw new Error("Ticket must be assigned to an agent");
  }

  const responseTargetSeconds =
    SLA_TARGETS[input.priority];

  const ticket = await prisma.$transaction(
    async (tx) => {
      const createdTicket = await tx.ticket.create({
        data: {
          subject: input.subject,
          description: input.description,
          requesterName: input.requesterName,
          requesterEmail: input.requesterEmail,
          priority: input.priority,
          category: input.category,
          status: "NEW",

          primaryAssigneeId: assigneeId,

          responseTargetSeconds,
          responseElapsedSeconds: 0,
          slaRunningSince: new Date(),
        },
      });

      await tx.ticketEvent.create({
        data: {
          ticketId: createdTicket.id,
          actorId,
          type: "TICKET_CREATED",
          newValue: createdTicket.status,
        },
      });

      return createdTicket;
    }
  );

  return ticket;
}

export async function listTickets(
  input: ListTicketsInput,
  userId: string,
  userRole: "AGENT" | "SUPERVISOR"
) {
const {
  search,
  status,
  priority,
  category,
  assigneeId,
  archived,
  page,
  pageSize,
  sortBy,
  sortOrder,
} = input;

  const where = buildTicketWhere({
  search,
  status,
  priority,
  category,
  assigneeId,
  userId,
  userRole,
});
where.archivedAt = archived
  ? { not: null }
  : null;
  // --------------------------------------------------
  // Role-based visibility
  // --------------------------------------------------

  if (userRole === "AGENT") {
    where.OR = [
      {
        primaryAssigneeId: userId,
      },
      {
        collaborators: {
          some: {
            userId,
          },
        },
      },
    ];
  }

  // --------------------------------------------------
  // Filters
  // --------------------------------------------------

  if (status) {
    where.status = status;
  }

  if (priority) {
    where.priority = priority;
  }

  if (category) {
    where.category = {
      equals: category,
      mode: "insensitive",
    };
  }

  if (assigneeId) {
    where.primaryAssigneeId = assigneeId;
  }
  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  const skip = (page - 1) * pageSize;

  const [tickets, total] = await prisma.$transaction([
    prisma.ticket.findMany({
      where,
      skip,
      take: pageSize,

      orderBy: {
        [sortBy]: sortOrder,
      },

      include: {
        primaryAssignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    }),

    prisma.ticket.count({
      where,
    }),
  ]);

  return {
    tickets,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getTicketById(
  ticketId: string,
  userId: string,
  userRole: "AGENT" | "SUPERVISOR"
) {
  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },

    include: {
      primaryAssignee: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },

      collaborators: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },

      replies: {
        orderBy: {
          createdAt: "asc",
        },

        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },

      events: {
        orderBy: {
          createdAt: "asc",
        },

        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },

      slaAlerts: {
        orderBy: {
          createdAt: "desc",
        },

        include: {
          acknowledgedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!ticket) {
    throw new AppError(404, "Ticket not found");
  }

  // Archived tickets are not part of the normal queue.
  if (ticket.archivedAt) {
    throw new AppError(404, "Ticket not found");
  }

  // Supervisors can access any active ticket.
  if (userRole === "SUPERVISOR") {
    return ticket;
  }

  // Agents can access tickets they own.
  if (ticket.primaryAssigneeId === userId) {
    return ticket;
  }

  // Agents can also access tickets where they are collaborators.
  const isCollaborator = ticket.collaborators.some(
    (collaborator) => collaborator.userId === userId
  );

  if (isCollaborator) {
    return ticket;
  }

  throw new AppError(
  403,
  "You do not have permission to access this ticket"
);
}
export async function updateTicket(
  ticketId: string,
  input: UpdateTicketInput,
  userId: string,
  userRole: "AGENT" | "SUPERVISOR"
) {
  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
    include: {
      collaborators: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!ticket || ticket.archivedAt) {
    throw new AppError(404, "Ticket not found");
  }

  canAccessTicket(ticket, userId, userRole);

  const changes: Record<
    string,
    {
      oldValue: unknown;
      newValue: unknown;
    }
  > = {};

  for (const [field, newValue] of Object.entries(input)) {
    const oldValue = ticket[field as keyof typeof ticket];

    if (oldValue !== newValue) {
      changes[field] = {
        oldValue,
        newValue,
      };
    }
  }

  if (Object.keys(changes).length === 0) {
    return ticket;
  }

  return prisma.$transaction(async (tx) => {
    const updatedTicket = await tx.ticket.update({
      where: {
        id: ticketId,
      },
      data: input,
    });

    await tx.ticketEvent.create({
      data: {
        ticketId,
        actorId: userId,
        type: "TICKET_UPDATED",
        metadata: changes as unknown as Prisma.InputJsonValue,
      },
    });

    return updatedTicket;
  });
}

export async function updateTicketStatus(
  ticketId: string,
  nextStatus: TicketStatus,
  userId: string,
  userRole: "AGENT" | "SUPERVISOR"
) {
  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
    include: {
      collaborators: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!ticket || ticket.archivedAt) {
    throw new AppError(404, "Ticket not found");
  }

  canAccessTicket(ticket, userId, userRole);

  validateStatusTransition(
    ticket.status,
    nextStatus
  );

  if (
    ticket.status === "CLOSED" &&
    nextStatus === "OPEN"
  ) {
    if (!ticket.closedAt) {
      throw new AppError(
        400,
        "Closed ticket cannot be reopened because its closing time is missing"
      );
    }

    const reopeningWindowMs =
      7 * 24 * 60 * 60 * 1000;

    const reopenDeadline =
      ticket.closedAt.getTime() +
      reopeningWindowMs;

    if (Date.now() > reopenDeadline) {
      throw new AppError(
        400,
        "This ticket can no longer be reopened"
      );
    }

    
  }

  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const elapsedSinceRunning =
  ticket.slaRunningSince
    ? Math.max(
        0,
        Math.floor(
          (now.getTime() -
            ticket.slaRunningSince.getTime()) /
            1000
        )
      )
    : 0;

const currentElapsedSeconds =
  ticket.responseElapsedSeconds +
  elapsedSinceRunning;
    const updateData: Prisma.TicketUpdateInput = {
      status: nextStatus,
    };

    if (nextStatus === "RESOLVED") {
      updateData.resolvedAt = now;
    }

    if (nextStatus === "CLOSED") {
      updateData.closedAt = now;
    }

   if (
  ticket.status === "CLOSED" &&
  nextStatus === "OPEN"
) {
  updateData.closedAt = null;
  updateData.resolvedAt = null;
  updateData.firstRespondedAt = null;
  updateData.responseElapsedSeconds = 0;
  updateData.slaRunningSince = now;
}
    if (nextStatus === "PENDING") {
  updateData.responseElapsedSeconds =
    currentElapsedSeconds;

  updateData.slaRunningSince = null;
}

    if (
      ticket.status === "PENDING" &&
      nextStatus === "OPEN"
    ) {
      updateData.slaRunningSince = now;
    }

    const updatedTicket = await tx.ticket.update({
      where: {
        id: ticketId,
      },
      data: updateData,
    });

    await tx.ticketEvent.create({
      data: {
        ticketId,
        actorId: userId,
        type: "STATUS_CHANGED",
        oldValue: ticket.status,
        newValue: nextStatus,
      },
    });

    return updatedTicket;
  });
}

export async function archiveTicket(
  ticketId: string,
  userId: string,
  userRole: "AGENT" | "SUPERVISOR"
) {
  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
    include: {
      collaborators: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!ticket || ticket.archivedAt) {
    throw new AppError(404, "Ticket not found");
  }

  canAccessTicket(ticket, userId, userRole);

  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const archivedTicket = await tx.ticket.update({
      where: {
        id: ticketId,
      },
      data: {
        archivedAt: now,
      },
    });

    await tx.ticketEvent.create({
      data: {
        ticketId,
        actorId: userId,
        type: "ARCHIVED",
        oldValue: ticket.status,
        newValue: "ARCHIVED",
      },
    });

    return archivedTicket;
  });
}

export async function restoreTicket(
  ticketId: string,
  userId: string,
  userRole: "AGENT" | "SUPERVISOR"
) {
  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
    include: {
      collaborators: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!ticket || !ticket.archivedAt) {
    throw new AppError(404, "Archived ticket not found");
  }

  canAccessTicket(ticket, userId, userRole);

  return prisma.$transaction(async (tx) => {
    const restoredTicket = await tx.ticket.update({
      where: {
        id: ticketId,
      },
      data: {
        archivedAt: null,
      },
    });

    await tx.ticketEvent.create({
      data: {
        ticketId,
        actorId: userId,
        type: "RESTORED",
        oldValue: "ARCHIVED",
        newValue: ticket.status,
      },
    });

    return restoredTicket;
  });
}