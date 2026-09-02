import { prisma } from "../../lib/prisma.js";

export async function getDashboard() {
  const now = new Date();

  // Start of the current week (Monday)
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = day === 0 ? 6 : day - 1;

  startOfWeek.setDate(startOfWeek.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  // Start of the 8-week reporting period
  const eightWeeksAgo = new Date(startOfWeek);
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 7 * 7);

  const [
    openTickets,
    pendingTickets,
    resolvedThisWeek,
    breachingTickets,
    statusBreakdown,
    agentBreakdown,
    resolvedEvents,
  ] = await Promise.all([
    prisma.ticket.count({
      where: {
        archivedAt: null,
        status: "OPEN",
      },
    }),

    prisma.ticket.count({
      where: {
        archivedAt: null,
        status: "PENDING",
      },
    }),

    prisma.ticket.count({
      where: {
        archivedAt: null,
        status: "RESOLVED",
        resolvedAt: {
          gte: startOfWeek,
        },
      },
    }),

    prisma.sLAAlert.count({
      where: {
        type: "BREACHED",
        acknowledgedAt: null,
        resolvedAt: null,
        ticket: {
          archivedAt: null,
        },
      },
    }),

    prisma.ticket.groupBy({
      by: ["status"],
      where: {
        archivedAt: null,
      },
      _count: {
        _all: true,
      },
    }),

    prisma.ticket.groupBy({
      by: ["primaryAssigneeId"],
      where: {
        archivedAt: null,
      },
      _count: {
        _all: true,
      },
    }),

    prisma.ticket.findMany({
      where: {
        archivedAt: null,
        status: "RESOLVED",
        resolvedAt: {
          gte: eightWeeksAgo,
        },
      },
      select: {
        resolvedAt: true,
      },
    }),
  ]);

  const agentIds = agentBreakdown.map(
    (agent) => agent.primaryAssigneeId
  );

  const agents = await prisma.user.findMany({
    where: {
      id: {
        in: agentIds,
      },
      role: "AGENT",
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  const agentMap = new Map(
    agents.map((agent) => [agent.id, agent])
  );

  const resolvedPerWeek = Array.from(
    { length: 8 },
    (_, index) => {
      const weekStart = new Date(eightWeeksAgo);
      weekStart.setDate(
        weekStart.getDate() + index * 7
      );

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const count = resolvedEvents.filter((ticket) => {
        if (!ticket.resolvedAt) return false;

        return (
          ticket.resolvedAt >= weekStart &&
          ticket.resolvedAt < weekEnd
        );
      }).length;

      return {
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        count,
      };
    }
  );

  return {
    summary: {
      openTickets,
      pendingTickets,
      resolvedThisWeek,
      breachingTickets,
    },

    statusBreakdown: statusBreakdown.map((item) => ({
      status: item.status,
      count: item._count._all,
    })),

    agentBreakdown: agentBreakdown.map((item) => ({
      agent: agentMap.get(item.primaryAssigneeId) ?? {
        id: item.primaryAssigneeId,
        name: "Unknown",
        email: "",
      },
      count: item._count._all,
    })),

    resolvedPerWeek,
  };
}