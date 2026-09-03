import type { Prisma } from "../../generated/prisma/client.js";

interface TicketFilterInput {
  search?: string;
  status?: "NEW" | "OPEN" | "PENDING" | "RESOLVED" | "CLOSED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  category?: string;
  assigneeId?: string;
  userId: string;
  userRole: "AGENT" | "SUPERVISOR";
}

export function buildTicketWhere(
  input: TicketFilterInput
): Prisma.TicketWhereInput {
  const {
    search,
    status,
    priority,
    category,
    assigneeId,
    userId,
    userRole,
  } = input;

  const where: Prisma.TicketWhereInput = {
    archivedAt: null,
  };

  // Role-based visibility
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

  // Filters
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

  // Search
  // Search
if (search) {
  where.AND = [
    {
      OR: [
        {
          subject: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          requesterName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          requesterEmail: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    },
  ];
}

  return where;
}