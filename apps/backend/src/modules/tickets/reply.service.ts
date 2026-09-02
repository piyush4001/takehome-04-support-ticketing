import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app.error.js";
import { canAccessTicket } from "./ticket.authorization.js";
import type { CreateReplyInput } from "./ticket.validation.js";

export async function createReply(
  ticketId: string,
  input: CreateReplyInput,
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

  canAccessTicket(
    ticket,
    userId,
    userRole
  );

  return prisma.$transaction(async (tx) => {
    const reply = await tx.reply.create({
      data: {
        ticketId,
        authorId: userId,
        body: input.body,
        type: input.type,
      },
    });

    const now = new Date();

    const isFirstAgentResponse =
      userRole === "AGENT" &&
      input.type === "CUSTOMER_REPLY" &&
      !ticket.firstRespondedAt;

    const updateData: {
      firstRespondedAt?: Date;
      responseElapsedSeconds?: number;
      slaRunningSince?: Date | null;
    } = {};

    // A customer-visible agent reply is the first response.
    if (isFirstAgentResponse) {
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

      updateData.firstRespondedAt = now;

      updateData.responseElapsedSeconds =
        ticket.responseElapsedSeconds +
        elapsedSinceRunning;

      updateData.slaRunningSince = null;
    }

    if (Object.keys(updateData).length > 0) {
      await tx.ticket.update({
        where: {
          id: ticketId,
        },
        data: updateData,
      });
    }

    // The first agent response resolves any active SLA alerts.
    if (isFirstAgentResponse) {
      await tx.sLAAlert.updateMany({
        where: {
          ticketId,
          resolvedAt: null,
        },
        data: {
          resolvedAt: now,
        },
      });
    }

    await tx.ticketEvent.create({
      data: {
        ticketId,
        actorId: userId,
        type: "REPLY_ADDED",
        newValue: reply.id,
        metadata: {
          visibility: input.type,
        },
      },
    });

    return reply;
  });
}