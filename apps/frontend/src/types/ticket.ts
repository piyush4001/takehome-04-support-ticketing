export type TicketStatus =
  | "NEW"
  | "OPEN"
  | "PENDING"
  | "RESOLVED"
  | "CLOSED";

export type TicketPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT";

export type ReplyType =
  | "INTERNAL_NOTE"
  | "CUSTOMER_REPLY";

export type UserRole =
  | "AGENT"
  | "SUPERVISOR";

export type TicketUser = {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
};

export type TicketCollaborator = {
  userId: string;
  addedAt: string;
  user?: TicketUser;
};

export type Ticket = {
  id: string;
  subject: string;
  description: string;
  requesterName: string;
  requesterEmail: string;
  priority: TicketPriority;
  category: string;
  status: TicketStatus;

  primaryAssigneeId: string;
  primaryAssignee?: TicketUser;

  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;

  responseTargetSeconds: number;
  responseElapsedSeconds: number;
  slaRunningSince: string | null;
  firstRespondedAt: string | null;

  collaborators?: TicketCollaborator[];
};

export type TicketListResponse = {
  success: boolean;
  data: {
    tickets: Ticket[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
};

export type AgentsResponse = {
  success: boolean;
  data: TicketUser[];
};

export type TicketReply = {
  id: string;
  ticketId: string;
  authorId: string;
  body: string;
  type: ReplyType;
  createdAt: string;
  author: TicketUser;
};

export type TicketEvent = {
  id: string;
  ticketId: string;
  actorId: string | null;
  type:
  | "TICKET_CREATED"
  | "TICKET_UPDATED"
  | "STATUS_CHANGED"
  | "ASSIGNMENT_CHANGED"
  | "COLLABORATOR_ADDED"
  | "COLLABORATOR_REMOVED"
  | "REPLY_ADDED"
  | "ARCHIVED"
  | "RESTORED";
  oldValue: string | null;
  newValue: string | null;
  metadata: unknown;
  createdAt: string;
  actor: TicketUser | null;
};

export type SLAAlert = {
  id: string;
  ticketId: string;
  type: "AT_RISK" | "BREACHED";
  breachSequence: number;
  acknowledgedAt: string | null;
  acknowledgedById: string | null;
  createdAt: string;
  resolvedAt: string | null;
  acknowledgedBy: TicketUser | null;
};

export type TicketDetails = Ticket & {
  primaryAssignee: TicketUser;
  collaborators: TicketCollaborator[];
  replies: TicketReply[];
  events: TicketEvent[];
  slaAlerts: SLAAlert[];
};

export type TicketDetailsResponse = {
  success: boolean;
  data: TicketDetails;
};