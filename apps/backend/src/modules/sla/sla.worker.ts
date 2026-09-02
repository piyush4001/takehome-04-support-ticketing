import { prisma } from "../../lib/prisma.js";
import { evaluateSlaForTicket } from "./sla.service.js";

const SLA_CHECK_INTERVAL_MS = 60 * 1000;

let intervalId: NodeJS.Timeout | null = null;

export function startSlaWorker() {
  if (intervalId) {
    return;
  }

  const run = async () => {
    try {
      const tickets = await prisma.ticket.findMany({
        where: {
          archivedAt: null,
          firstRespondedAt: null,
          slaRunningSince: {
            not: null,
          },
          status: {
            in: ["NEW", "OPEN"],
          },
        },
        select: {
          id: true,
        },
      });

      for (const ticket of tickets) {
        await evaluateSlaForTicket(ticket.id);
      }
    } catch (error) {
      console.error(
        "SLA worker error:",
        error
      );
    }
  };

  void run();

  intervalId = setInterval(
    () => {
      void run();
    },
    SLA_CHECK_INTERVAL_MS
  );
}