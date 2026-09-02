import type { Ticket } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app.error.js";
export const SLA_AT_RISK_WINDOW_SECONDS = 30 * 60;

export async function getCurrentBreachSequence(
  ticketId: string
): Promise<number> {
  const statusEvents =
    await prisma.ticketEvent.findMany({
      where: {
        ticketId,
        type: "STATUS_CHANGED",
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        oldValue: true,
        newValue: true,
      },
    });

  let sequence = 1;

  for (const event of statusEvents) {
    if (
      event.oldValue === "CLOSED" &&
      event.newValue === "OPEN"
    ) {
      sequence += 1;
    }
  }

  return sequence;
}

export function calculateResponseElapsedSeconds(
  ticket: Pick<
    Ticket,
    | "responseElapsedSeconds"
    | "slaRunningSince"
    | "firstRespondedAt"
  >,
  now = new Date()
): number {
  if (
    ticket.firstRespondedAt ||
    !ticket.slaRunningSince
  ) {
    return ticket.responseElapsedSeconds;
  }

  const runningSeconds = Math.max(
    0,
    Math.floor(
      (now.getTime() -
        ticket.slaRunningSince.getTime()) /
        1000
    )
  );

  return (
    ticket.responseElapsedSeconds +
    runningSeconds
  );
}

export function getSlaState(
  elapsedSeconds: number,
  targetSeconds: number
): "ON_TRACK" | "AT_RISK" | "BREACHED" {
  if (elapsedSeconds >= targetSeconds) {
    return "BREACHED";
  }

  if (
    elapsedSeconds >=
    targetSeconds - SLA_AT_RISK_WINDOW_SECONDS
  ) {
    return "AT_RISK";
  }

  return "ON_TRACK";
}

export async function evaluateSlaForTicket(
  ticketId: string,
  now = new Date()
) {
  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
  });

  if (!ticket || ticket.archivedAt) {
    return null;
  }

  // Once the first response has been sent,
  // the response SLA is complete.
  if (ticket.firstRespondedAt) {
    return null;
  }

  if (!ticket.slaRunningSince) {
    return null;
  }

  const elapsedSeconds =
    calculateResponseElapsedSeconds(ticket, now);

  const state = getSlaState(
    elapsedSeconds,
    ticket.responseTargetSeconds
  );

  if (state === "ON_TRACK") {
    return null;
  }
  const breachSequence = await getCurrentBreachSequence(ticketId);

  const existingAlert =
    await prisma.sLAAlert.findUnique({
      where: {
        ticketId_breachSequence_type: {
          ticketId,
          breachSequence,
          type: state,
        },
      },
    });

  if (existingAlert) {
    return existingAlert;
  }

  return prisma.sLAAlert.create({
    data: {
      ticketId,
      type: state,
      breachSequence,
    },
  });
}
export async function acknowledgeSlaAlert(
  alertId: string,
  userId: string,
  userRole: "AGENT" | "SUPERVISOR"
) {
  const alert = await prisma.sLAAlert.findUnique({
    where: {
      id: alertId,
    },
    include: {
      ticket: {
        select: {
          id: true,
          archivedAt: true,
          primaryAssigneeId: true,
        },
      },
    },
  });

  if (!alert) {
    throw new AppError(404, "SLA alert not found");
  }

  if (alert.ticket.archivedAt) {
    throw new AppError(404, "SLA alert not found");
  }

  if (alert.acknowledgedAt) {
    throw new AppError(
      400,
      "SLA alert has already been acknowledged"
    );
  }

  if (
    userRole === "AGENT" &&
    alert.ticket.primaryAssigneeId !== userId
  ) {
    throw new AppError(
      403,
      "You can only acknowledge alerts for your assigned tickets"
    );
  }

  return prisma.sLAAlert.update({
    where: {
      id: alertId,
    },
    data: {
      acknowledgedAt: new Date(),
      acknowledgedById: userId,
    },
  });
}