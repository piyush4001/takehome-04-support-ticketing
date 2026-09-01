import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app.error.js";
import {
  validateStatusTransition,
} from "./ticket.lifecycle.js";

export interface BulkResult {
  ticketId: string;
  success: boolean;
  error?: string;
}

export async function bulkReassignTickets(
  ticketIds: string[],
  assigneeId: string,
  actorId: string,
  actorRole: "AGENT" | "SUPERVISOR"
): Promise<BulkResult[]> {
  if (actorRole !== "SUPERVISOR") {
    return ticketIds.map((ticketId) => ({
      ticketId,
      success: false,
      error:
        "Only supervisors can bulk reassign tickets",
    }));
  }

  const assignee = await prisma.user.findUnique({
    where: {
      id: assigneeId,
    },
  });

  if (!assignee) {
    throw new AppError(404, "Assignee not found");
  }

  if (assignee.role !== "AGENT") {
    throw new AppError(
      400,
      "Tickets can only be assigned to agents"
    );
  }

  const results: BulkResult[] = [];

  for (const ticketId of ticketIds) {
    try {
      const ticket = await prisma.ticket.findUnique({
        where: {
          id: ticketId,
        },
      });

      if (!ticket || ticket.archivedAt) {
        results.push({
          ticketId,
          success: false,
          error: "Ticket not found",
        });

        continue;
      }

      if (ticket.primaryAssigneeId === assigneeId) {
        results.push({
          ticketId,
          success: false,
          error:
            "Ticket is already assigned to this agent",
        });

        continue;
      }

      await prisma.$transaction(async (tx) => {
        await tx.ticket.update({
          where: {
            id: ticketId,
          },
          data: {
            primaryAssigneeId: assigneeId,
          },
        });

        await tx.ticketEvent.create({
          data: {
            ticketId,
            actorId,
            type: "ASSIGNMENT_CHANGED",
            oldValue: ticket.primaryAssigneeId,
            newValue: assigneeId,
          },
        });
      });

      results.push({
        ticketId,
        success: true,
      });
    } catch (error) {
      results.push({
        ticketId,
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to reassign ticket",
      });
    }
  }

  return results;
}

export async function bulkCloseTickets(
  ticketIds: string[],
  actorId: string,
  actorRole: "AGENT" | "SUPERVISOR"
): Promise<BulkResult[]> {
  const results: BulkResult[] = [];

  for (const ticketId of ticketIds) {
    try {
      const ticket = await prisma.ticket.findUnique({
        where: {
          id: ticketId,
        },
      });

      if (!ticket || ticket.archivedAt) {
        results.push({
          ticketId,
          success: false,
          error: "Ticket not found",
        });

        continue;
      }

      /*
       * Supervisors can close any active ticket.
       * Agents can close only tickets they currently own.
       */
      if (
        actorRole !== "SUPERVISOR" &&
        ticket.primaryAssigneeId !== actorId
      ) {
        results.push({
          ticketId,
          success: false,
          error:
            "You do not have permission to close this ticket",
        });

        continue;
      }

      /*
       * Reuse the central lifecycle rules.
       */
      try {
        validateStatusTransition(
          ticket.status,
          "CLOSED"
        );
      } catch (error) {
        results.push({
          ticketId,
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Invalid status transition",
        });

        continue;
      }

      const now = new Date();

      await prisma.$transaction(async (tx) => {
        await tx.ticket.update({
          where: {
            id: ticketId,
          },
          data: {
            status: "CLOSED",
            closedAt: now,
          },
        });

        await tx.ticketEvent.create({
          data: {
            ticketId,
            actorId,
            type: "STATUS_CHANGED",
            oldValue: ticket.status,
            newValue: "CLOSED",
          },
        });
      });

      results.push({
        ticketId,
        success: true,
      });
    } catch (error) {
      results.push({
        ticketId,
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to close ticket",
      });
    }
  }

  return results;
}