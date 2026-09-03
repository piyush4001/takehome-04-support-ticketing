import type { TicketPriority, TicketStatus } from "./ticket";

export type SLAAlert = {
  id: string;
  ticketId: string;
  type: "AT_RISK" | "BREACHED";
  breachSequence: number;
  acknowledgedAt: string | null;
  acknowledgedById: string | null;
  createdAt: string;
  resolvedAt: string | null;
  ticket: {
    id: string;
    subject: string;
    status: TicketStatus;
    priority: TicketPriority;
    responseTargetSeconds: number;
    responseElapsedSeconds: number;
    slaRunningSince: string | null;
    firstRespondedAt: string | null;
    primaryAssigneeId: string;
  };
};

export type SLAAlertsResponse = {
  success: boolean;
  data: SLAAlert[];
};
