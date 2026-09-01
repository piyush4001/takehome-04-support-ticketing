import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app.error.js";
import { canAccessTicket } from "./ticket.authorization.js";

export async function addCollaborator(
  ticketId: string,
  collaboratorId: string,
  actorId: string,
  actorRole: "AGENT" | "SUPERVISOR"
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

  canAccessTicket(
    ticket,
    actorId,
    actorRole
  );

  const collaborator = await prisma.user.findUnique({
    where: {
      id: collaboratorId,
    },
  });

  if (!collaborator) {
    throw new AppError(
      404,
      "Collaborator user not found"
    );
  }

  if (collaborator.role !== "AGENT") {
    throw new AppError(
      400,
      "Only agents can be collaborators"
    );
  }

  const alreadyCollaborator =
    ticket.collaborators.some(
      (item) => item.userId === collaboratorId
    );

  if (alreadyCollaborator) {
    throw new AppError(
      409,
      "User is already a collaborator"
    );
  }

  if (ticket.primaryAssigneeId === collaboratorId) {
    throw new AppError(
      409,
      "Primary assignee is already assigned to this ticket"
    );
  }

  return prisma.$transaction(async (tx) => {
    const created =
      await tx.ticketCollaborator.create({
        data: {
          ticketId,
          userId: collaboratorId,
        },

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
      });

    await tx.ticketEvent.create({
      data: {
        ticketId,
        actorId,
        type: "COLLABORATOR_ADDED",
        newValue: collaboratorId,
      },
    });

    return created;
  });
}

export async function removeCollaborator(
  ticketId: string,
  collaboratorId: string,
  actorId: string,
  actorRole: "AGENT" | "SUPERVISOR"
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

  canAccessTicket(
    ticket,
    actorId,
    actorRole
  );

  const collaborator =
    ticket.collaborators.some(
      (item) => item.userId === collaboratorId
    );

  if (!collaborator) {
    throw new AppError(
      404,
      "Collaborator not found on this ticket"
    );
  }

  return prisma.$transaction(async (tx) => {
    await tx.ticketCollaborator.delete({
      where: {
        ticketId_userId: {
          ticketId,
          userId: collaboratorId,
        },
      },
    });

    await tx.ticketEvent.create({
      data: {
        ticketId,
        actorId,
        type: "COLLABORATOR_REMOVED",
        oldValue: collaboratorId,
      },
    });
  });
}