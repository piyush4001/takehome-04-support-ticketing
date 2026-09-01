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