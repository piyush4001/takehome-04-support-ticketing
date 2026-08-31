import type { Ticket } from "../../generated/prisma/client.js";
import { AppError } from "../../utils/app.error.js";

export function canAccessTicket(
  ticket: Ticket & {
    collaborators: {
      userId: string;
    }[];
  },
  userId: string,
  userRole: "AGENT" | "SUPERVISOR"
) {
  if (userRole === "SUPERVISOR") {
    return;
  }

  if (ticket.primaryAssigneeId === userId) {
    return;
  }

  const isCollaborator = ticket.collaborators.some(
    (collaborator) => collaborator.userId === userId
  );

  if (isCollaborator) {
    return;
  }

  throw new AppError(
    403,
    "You do not have permission to access this ticket"
  );
}