import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
const DEMO_PASSWORD = "Password123!";
const DEMO_NOW = new Date("2026-09-04T12:00:00.000Z");

const SLA_TARGETS = {
  LOW: 24 * 60 * 60,
  MEDIUM: 12 * 60 * 60,
  HIGH: 4 * 60 * 60,
  URGENT: 60 * 60,
} as const;

type Status = "NEW" | "OPEN" | "PENDING" | "RESOLVED" | "CLOSED";
type Priority = keyof typeof SLA_TARGETS;
type ReplyType = "CUSTOMER_REPLY" | "INTERNAL_NOTE";

type ReplySeed = {
  body: string;
  type: ReplyType;
  author: "alice" | "bob" | "charlie" | "diana";
  hoursAfterCreated: number;
};

type TicketSeed = {
  number: number;
  subject: string;
  description: string;
  requesterName: string;
  requesterEmail: string;
  priority: Priority;
  category: string;
  status: Status;
  ageDays: number;
  assignee: "alice" | "bob" | "charlie" | "diana";
  lifecycle: Status[];
  collaborators?: ("alice" | "bob" | "charlie" | "diana")[];
  replies?: ReplySeed[];
  archived?: boolean;
};

const users = {
  supervisor: {
    email: "supervisor@example.com",
    name: "Sarah Supervisor",
    role: "SUPERVISOR" as const,
  },
  supervisorTwo: {
    email: "morgan.supervisor@example.com",
    name: "Morgan Supervisor",
    role: "SUPERVISOR" as const,
  },
  alice: {
    email: "alice@example.com",
    name: "Alice Agent",
    role: "AGENT" as const,
  },
  bob: {
    email: "bob@example.com",
    name: "Bob Agent",
    role: "AGENT" as const,
  },
  charlie: {
    email: "charlie@example.com",
    name: "Charlie Agent",
    role: "AGENT" as const,
  },
  diana: {
    email: "diana@example.com",
    name: "Diana Agent",
    role: "AGENT" as const,
  },
};

const tickets: TicketSeed[] = [
  {
    number: 1,
    subject: "Password reset link expires immediately",
    description: "The password reset email arrives, but its link reports that it has expired as soon as it is opened.",
    requesterName: "John Doe",
    requesterEmail: "john.doe@example.com",
    priority: "HIGH",
    category: "ACCOUNT",
    status: "OPEN",
    ageDays: 1,
    assignee: "alice",
    lifecycle: ["NEW", "OPEN"],
    collaborators: ["bob"],
    replies: [
      { body: "We are checking the reset-token configuration now.", type: "CUSTOMER_REPLY", author: "alice", hoursAfterCreated: 2 },
      { body: "The token TTL looks shorter than expected in the account service.", type: "INTERNAL_NOTE", author: "bob", hoursAfterCreated: 4 },
    ],
  },
  {
    number: 2,
    subject: "Duplicate charge on monthly subscription",
    description: "The customer was charged twice for the same monthly subscription invoice.",
    requesterName: "Emily Smith",
    requesterEmail: "emily.smith@example.com",
    priority: "URGENT",
    category: "BILLING",
    status: "OPEN",
    ageDays: 2,
    assignee: "bob",
    lifecycle: ["NEW", "OPEN"],
    collaborators: ["diana"],
    replies: [
      { body: "We found the duplicate payment authorization and are reviewing the refund.", type: "CUSTOMER_REPLY", author: "bob", hoursAfterCreated: 1 },
      { body: "Refund approval is ready for finance review.", type: "INTERNAL_NOTE", author: "diana", hoursAfterCreated: 6 },
    ],
  },
  {
    number: 3,
    subject: "Export account data as CSV",
    description: "Please confirm how to export all account data in CSV format for an audit.",
    requesterName: "Michael Brown",
    requesterEmail: "michael.brown@example.com",
    priority: "LOW",
    category: "GENERAL",
    status: "PENDING",
    ageDays: 5,
    assignee: "alice",
    lifecycle: ["NEW", "OPEN", "PENDING"],
    collaborators: ["charlie"],
    replies: [
      { body: "Could you confirm whether CSV or JSON would work for your audit?", type: "CUSTOMER_REPLY", author: "alice", hoursAfterCreated: 3 },
    ],
  },
  {
    number: 4,
    subject: "Checkout crashes after applying discount",
    description: "Checkout fails with a blank screen when a discount code is applied before payment.",
    requesterName: "David Wilson",
    requesterEmail: "david.wilson@example.com",
    priority: "URGENT",
    category: "TECHNICAL",
    status: "NEW",
    ageDays: 0.04,
    assignee: "charlie",
    lifecycle: ["NEW"],
  },
  {
    number: 5,
    subject: "Invoice billing address is incorrect",
    description: "The latest invoice shows an old billing address and needs to be regenerated.",
    requesterName: "Emma Davis",
    requesterEmail: "emma.davis@example.com",
    priority: "MEDIUM",
    category: "BILLING",
    status: "RESOLVED",
    ageDays: 4,
    assignee: "bob",
    lifecycle: ["NEW", "OPEN", "RESOLVED"],
    replies: [
      { body: "The address has been corrected and a replacement invoice is available.", type: "CUSTOMER_REPLY", author: "bob", hoursAfterCreated: 5 },
    ],
  },
  {
    number: 6,
    subject: "Profile changes are not saved",
    description: "Updating the phone number appears successful but the old value returns after refresh.",
    requesterName: "James Taylor",
    requesterEmail: "james.taylor@example.com",
    priority: "HIGH",
    category: "ACCOUNT",
    status: "CLOSED",
    ageDays: 12,
    assignee: "alice",
    lifecycle: ["NEW", "OPEN", "RESOLVED", "CLOSED"],
    collaborators: ["diana"],
    replies: [
      { body: "The profile update is fixed and has been deployed.", type: "CUSTOMER_REPLY", author: "alice", hoursAfterCreated: 6 },
    ],
  },
  {
    number: 7,
    subject: "Webhook delivery retries indefinitely",
    description: "Our integration receives repeated webhook attempts even after returning HTTP 200.",
    requesterName: "Priya Nair",
    requesterEmail: "priya.nair@example.com",
    priority: "HIGH",
    category: "INTEGRATION",
    status: "OPEN",
    ageDays: 3,
    assignee: "charlie",
    lifecycle: ["NEW", "OPEN"],
    collaborators: ["alice", "diana"],
    replies: [
      { body: "Please share one delivery ID so we can trace the retry sequence.", type: "CUSTOMER_REPLY", author: "charlie", hoursAfterCreated: 2 },
      { body: "The retry worker is not persisting the acknowledgement for one event type.", type: "INTERNAL_NOTE", author: "alice", hoursAfterCreated: 8 },
    ],
  },
  {
    number: 8,
    subject: "Cancel annual subscription",
    description: "The customer wants to cancel an annual plan before the next renewal date.",
    requesterName: "Lucas Martin",
    requesterEmail: "lucas.martin@example.com",
    priority: "MEDIUM",
    category: "SUBSCRIPTION",
    status: "PENDING",
    ageDays: 6,
    assignee: "diana",
    lifecycle: ["NEW", "OPEN", "PENDING"],
  },
  {
    number: 9,
    subject: "Refund missing after cancelled order",
    description: "A refund was approved five business days ago but is not visible on the customer's card.",
    requesterName: "Sofia Garcia",
    requesterEmail: "sofia.garcia@example.com",
    priority: "URGENT",
    category: "REFUND",
    status: "OPEN",
    ageDays: 1,
    assignee: "diana",
    lifecycle: ["NEW", "OPEN"],
    replies: [
      { body: "We have escalated the refund trace to our payments provider.", type: "CUSTOMER_REPLY", author: "diana", hoursAfterCreated: 2 },
    ],
  },
  {
    number: 10,
    subject: "Two-factor authentication code not received",
    description: "SMS verification codes do not arrive for the account's registered phone number.",
    requesterName: "Noah Williams",
    requesterEmail: "noah.williams@example.com",
    priority: "HIGH",
    category: "SECURITY",
    status: "RESOLVED",
    ageDays: 8,
    assignee: "alice",
    lifecycle: ["NEW", "OPEN", "RESOLVED"],
    replies: [
      { body: "We switched the account to an authenticator challenge and confirmed access.", type: "CUSTOMER_REPLY", author: "alice", hoursAfterCreated: 4 },
      { body: "SMS provider logs show a regional delivery delay; keep the fallback enabled.", type: "INTERNAL_NOTE", author: "charlie", hoursAfterCreated: 7 },
    ],
  },
  {
    number: 11,
    subject: "API token rotation guidance",
    description: "The engineering team needs the recommended process for rotating production API tokens.",
    requesterName: "Olivia Chen",
    requesterEmail: "olivia.chen@example.com",
    priority: "MEDIUM",
    category: "INTEGRATION",
    status: "OPEN",
    ageDays: 2,
    assignee: "charlie",
    lifecycle: ["NEW", "OPEN"],
  },
  {
    number: 12,
    subject: "Unexpected tax amount at checkout",
    description: "The checkout tax total differs from the estimate shown in the cart for one region.",
    requesterName: "Ethan Moore",
    requesterEmail: "ethan.moore@example.com",
    priority: "HIGH",
    category: "BILLING",
    status: "PENDING",
    ageDays: 7,
    assignee: "bob",
    lifecycle: ["NEW", "OPEN", "PENDING"],
    collaborators: ["alice"],
    replies: [
      { body: "Can you confirm the shipping postcode used for the order?", type: "CUSTOMER_REPLY", author: "bob", hoursAfterCreated: 5 },
    ],
  },
  {
    number: 13,
    subject: "Mobile app closes during document upload",
    description: "The iOS app closes when uploading a document larger than 8 MB over cellular data.",
    requesterName: "Grace Lee",
    requesterEmail: "grace.lee@example.com",
    priority: "URGENT",
    category: "TECHNICAL",
    status: "OPEN",
    ageDays: 3,
    assignee: "charlie",
    lifecycle: ["NEW", "OPEN"],
    collaborators: ["diana"],
  },
  {
    number: 14,
    subject: "Remove former employee access",
    description: "Please remove a former employee from the workspace and confirm audit retention.",
    requesterName: "Henry Adams",
    requesterEmail: "henry.adams@example.com",
    priority: "HIGH",
    category: "SECURITY",
    status: "CLOSED",
    ageDays: 15,
    assignee: "diana",
    lifecycle: ["NEW", "OPEN", "RESOLVED", "CLOSED"],
    archived: true,
    replies: [
      { body: "The user was deactivated and the workspace audit record was retained.", type: "CUSTOMER_REPLY", author: "diana", hoursAfterCreated: 3 },
    ],
  },
  {
    number: 15,
    subject: "Restore deleted project workspace",
    description: "A project workspace was deleted accidentally and needs to be restored if possible.",
    requesterName: "Isabella Rossi",
    requesterEmail: "isabella.rossi@example.com",
    priority: "URGENT",
    category: "ACCOUNT",
    status: "CLOSED",
    ageDays: 21,
    assignee: "alice",
    lifecycle: ["NEW", "OPEN", "RESOLVED", "CLOSED"],
    archived: true,
    collaborators: ["diana"],
  },
  {
    number: 16,
    subject: "Plan upgrade did not apply features",
    description: "The account was upgraded but the newly included reporting features remain locked.",
    requesterName: "Jack Thompson",
    requesterEmail: "jack.thompson@example.com",
    priority: "MEDIUM",
    category: "SUBSCRIPTION",
    status: "OPEN",
    ageDays: 3,
    assignee: "bob",
    lifecycle: ["NEW", "OPEN"],
    collaborators: ["charlie"],
  },
  {
    number: 17,
    subject: "Invoice PDF download returns 404",
    description: "The invoice appears in billing history, but its PDF download returns a not found error.",
    requesterName: "Mia Johnson",
    requesterEmail: "mia.johnson@example.com",
    priority: "LOW",
    category: "BILLING",
    status: "NEW",
    ageDays: 0,
    assignee: "diana",
    lifecycle: ["NEW"],
  },
  {
    number: 18,
    subject: "Customer portal branding question",
    description: "The customer wants to know whether the portal logo can be changed without an enterprise plan.",
    requesterName: "Liam Anderson",
    requesterEmail: "liam.anderson@example.com",
    priority: "LOW",
    category: "GENERAL",
    status: "RESOLVED",
    ageDays: 10,
    assignee: "charlie",
    lifecycle: ["NEW", "OPEN", "RESOLVED"],
    replies: [
      { body: "Branding changes are available on the enterprise plan; I have shared the upgrade details.", type: "CUSTOMER_REPLY", author: "charlie", hoursAfterCreated: 8 },
    ],
  },
  {
    number: 19,
    subject: "SAML login certificate rotation",
    description: "The identity team needs help rotating the SAML certificate before it expires next month.",
    requesterName: "Ava Patel",
    requesterEmail: "ava.patel@example.com",
    priority: "HIGH",
    category: "SECURITY",
    status: "PENDING",
    ageDays: 4,
    assignee: "alice",
    lifecycle: ["NEW", "OPEN", "PENDING"],
    collaborators: ["diana"],
    replies: [
      { body: "Please send the new certificate metadata when it is ready for validation.", type: "CUSTOMER_REPLY", author: "alice", hoursAfterCreated: 6 },
    ],
  },
  {
    number: 20,
    subject: "Bulk import reports three invalid rows",
    description: "A CSV import completed with three rejected rows and the customer needs the validation details.",
    requesterName: "William Clark",
    requesterEmail: "william.clark@example.com",
    priority: "MEDIUM",
    category: "INTEGRATION",
    status: "OPEN",
    ageDays: 1,
    assignee: "bob",
    lifecycle: ["NEW", "OPEN"],
    collaborators: ["alice", "diana"],
  },
];

function seedId(kind: number, number: number): string {
  return `00000000-0000-4000-8000-${kind.toString(16).padStart(4, "0")}${number.toString(16).padStart(8, "0")}`;
}

function hoursAfter(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function ticketCreatedAt(ticket: TicketSeed): Date {
  return new Date(DEMO_NOW.getTime() - ticket.ageDays * 24 * 60 * 60 * 1000);
}

function statusTimes(ticket: TicketSeed): Date[] {
  const createdAt = ticketCreatedAt(ticket);
  const finalOffset = Math.max(0.5, Math.min(18, ticket.ageDays * 3));
  const step = ticket.lifecycle.length > 1 ? finalOffset / (ticket.lifecycle.length - 1) : 0;

  return ticket.lifecycle.map((_, index) => hoursAfter(createdAt, index * step));
}

async function upsertUser(
  data: (typeof users)[keyof typeof users],
  passwordHash: string
) {
  return prisma.user.upsert({
    where: { email: data.email },
    update: { name: data.name, role: data.role, passwordHash },
    create: { ...data, passwordHash },
  });
}

async function main() {
  console.log("Starting deterministic database seed...");
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const seededUsers = {} as Record<keyof typeof users, { id: string; email: string; name: string; role: "AGENT" | "SUPERVISOR" }>;

  for (const [key, data] of Object.entries(users) as [keyof typeof users, (typeof users)[keyof typeof users]][]) {
    seededUsers[key] = await upsertUser(data, passwordHash);
  }

  const seedOwnedChildPrefixes = ["00000000-0000-4000-8000-0002", "00000000-0000-4000-8000-0003", "00000000-0000-4000-8000-0004", "00000000-0000-4000-8000-0005", "00000000-0000-4000-8000-0006", "00000000-0000-4000-8000-0007"];
  await prisma.ticketEvent.deleteMany({
    where: {
      id: { startsWith: "00000000-0000-4000-8000-0002" },
    },
  });
  await prisma.ticketEvent.deleteMany({
    where: {
      OR: seedOwnedChildPrefixes.slice(1, 5).map((prefix) => ({
        id: { startsWith: prefix },
      })),
    },
  });
  await prisma.reply.deleteMany({
    where: {
      id: { startsWith: seedOwnedChildPrefixes[2] },
    },
  });
  await prisma.sLAAlert.deleteMany({
    where: {
      id: { startsWith: seedOwnedChildPrefixes[5] },
    },
  });

  let replyCount = 0;
  let eventCount = 0;
  let collaboratorCount = 0;
  let alertCount = 0;

  for (const ticketSeed of tickets) {
    const ticketId = seedId(1, ticketSeed.number);
    const createdAt = ticketCreatedAt(ticketSeed);
    const times = statusTimes(ticketSeed);
    const statusChangedAt = times[times.length - 1];
    const assignmentAt = hoursAfter(
      createdAt,
      Math.min(1, Math.max(0.25, ticketSeed.ageDays * 12))
    );
    const firstResponse = ticketSeed.replies?.find((reply) => reply.type === "CUSTOMER_REPLY");
    const firstRespondedAt = firstResponse
      ? hoursAfter(createdAt, firstResponse.hoursAfterCreated)
      : null;
    const isRunning =
      (ticketSeed.status === "NEW" || ticketSeed.status === "OPEN") &&
      !firstRespondedAt;
    const responseElapsedSeconds = ticketSeed.status === "NEW"
      ? Math.max(0, Math.floor((DEMO_NOW.getTime() - createdAt.getTime()) / 1000))
      : ticketSeed.status === "OPEN"
        ? Math.max(0, Math.floor((DEMO_NOW.getTime() - (firstRespondedAt ?? statusChangedAt).getTime()) / 1000))
        : Math.max(1800, Math.floor((firstRespondedAt ? firstRespondedAt.getTime() - createdAt.getTime() : statusChangedAt.getTime() - createdAt.getTime()) / 1000));

    const resolvedAt = ticketSeed.status === "RESOLVED" || ticketSeed.status === "CLOSED"
      ? statusChangedAt
      : null;
    const closedAt = ticketSeed.status === "CLOSED" ? statusChangedAt : null;
    const archivedAt = ticketSeed.archived ? hoursAfter(statusChangedAt, 2) : null;

    await prisma.ticket.upsert({
      where: { id: ticketId },
      update: {
        subject: ticketSeed.subject,
        description: ticketSeed.description,
        requesterName: ticketSeed.requesterName,
        requesterEmail: ticketSeed.requesterEmail,
        priority: ticketSeed.priority,
        category: ticketSeed.category,
        status: ticketSeed.status,
        primaryAssigneeId: seededUsers[ticketSeed.assignee].id,
        createdAt,
        updatedAt: archivedAt ?? statusChangedAt,
        archivedAt,
        resolvedAt,
        closedAt,
        responseTargetSeconds: SLA_TARGETS[ticketSeed.priority],
        responseElapsedSeconds,
        slaRunningSince: isRunning ? new Date(Math.max(statusChangedAt.getTime(), DEMO_NOW.getTime() - 2 * 60 * 60 * 1000)) : null,
        firstRespondedAt,
      },
      create: {
        id: ticketId,
        subject: ticketSeed.subject,
        description: ticketSeed.description,
        requesterName: ticketSeed.requesterName,
        requesterEmail: ticketSeed.requesterEmail,
        priority: ticketSeed.priority,
        category: ticketSeed.category,
        status: ticketSeed.status,
        primaryAssigneeId: seededUsers[ticketSeed.assignee].id,
        createdAt,
        updatedAt: archivedAt ?? statusChangedAt,
        archivedAt,
        resolvedAt,
        closedAt,
        responseTargetSeconds: SLA_TARGETS[ticketSeed.priority],
        responseElapsedSeconds,
        slaRunningSince: isRunning ? new Date(Math.max(statusChangedAt.getTime(), DEMO_NOW.getTime() - 2 * 60 * 60 * 1000)) : null,
        firstRespondedAt,
      },
    });

    await prisma.ticketEvent.upsert({
      where: { id: seedId(2, ticketSeed.number * 100 + 1) },
      update: { ticketId, actorId: seededUsers.supervisor.id, type: "TICKET_CREATED", newValue: "NEW", createdAt },
      create: { id: seedId(2, ticketSeed.number * 100 + 1), ticketId, actorId: seededUsers.supervisor.id, type: "TICKET_CREATED", newValue: "NEW", createdAt },
    });
    eventCount += 1;

    await prisma.ticketEvent.upsert({
      where: { id: seedId(2, ticketSeed.number * 100 + 2) },
      update: { ticketId, actorId: seededUsers.supervisor.id, type: "ASSIGNMENT_CHANGED", oldValue: null, newValue: seededUsers[ticketSeed.assignee].id, createdAt: assignmentAt },
      create: { id: seedId(2, ticketSeed.number * 100 + 2), ticketId, actorId: seededUsers.supervisor.id, type: "ASSIGNMENT_CHANGED", oldValue: null, newValue: seededUsers[ticketSeed.assignee].id, createdAt: assignmentAt },
    });
    eventCount += 1;

    for (let index = 1; index < ticketSeed.lifecycle.length; index += 1) {
      const oldValue = ticketSeed.lifecycle[index - 1];
      const newValue = ticketSeed.lifecycle[index];
      const eventId = seedId(2, ticketSeed.number * 100 + 10 + index);
      const actorId = seededUsers[ticketSeed.assignee].id;
      await prisma.ticketEvent.upsert({
        where: { id: eventId },
        update: { ticketId, actorId, type: "STATUS_CHANGED", oldValue, newValue, createdAt: times[index] },
        create: { id: eventId, ticketId, actorId, type: "STATUS_CHANGED", oldValue, newValue, createdAt: times[index] },
      });
      eventCount += 1;
    }

    for (const [index, collaborator] of (ticketSeed.collaborators ?? []).entries()) {
      const collaboratorId = seededUsers[collaborator].id;
      await prisma.ticketCollaborator.upsert({
        where: { ticketId_userId: { ticketId, userId: collaboratorId } },
        update: { addedAt: hoursAfter(createdAt, 2 + index) },
        create: { ticketId, userId: collaboratorId, addedAt: hoursAfter(createdAt, 2 + index) },
      });
      collaboratorCount += 1;

      const eventId = seedId(3, ticketSeed.number * 100 + index + 1);
      await prisma.ticketEvent.upsert({
        where: { id: eventId },
        update: { ticketId, actorId: seededUsers[ticketSeed.assignee].id, type: "COLLABORATOR_ADDED", newValue: collaboratorId, createdAt: hoursAfter(createdAt, 2 + index) },
        create: { id: eventId, ticketId, actorId: seededUsers[ticketSeed.assignee].id, type: "COLLABORATOR_ADDED", newValue: collaboratorId, createdAt: hoursAfter(createdAt, 2 + index) },
      });
      eventCount += 1;
    }

    for (const [index, replySeed] of (ticketSeed.replies ?? []).entries()) {
      const replyId = seedId(4, ticketSeed.number * 100 + index + 1);
      const replyCreatedAt = hoursAfter(createdAt, replySeed.hoursAfterCreated);
      await prisma.reply.upsert({
        where: { id: replyId },
        update: { ticketId, authorId: seededUsers[replySeed.author].id, body: replySeed.body, type: replySeed.type, createdAt: replyCreatedAt },
        create: { id: replyId, ticketId, authorId: seededUsers[replySeed.author].id, body: replySeed.body, type: replySeed.type, createdAt: replyCreatedAt },
      });
      replyCount += 1;

      const eventId = seedId(5, ticketSeed.number * 100 + index + 1);
      await prisma.ticketEvent.upsert({
        where: { id: eventId },
        update: { ticketId, actorId: seededUsers[replySeed.author].id, type: "REPLY_ADDED", newValue: replyId, metadata: { visibility: replySeed.type }, createdAt: replyCreatedAt },
        create: { id: eventId, ticketId, actorId: seededUsers[replySeed.author].id, type: "REPLY_ADDED", newValue: replyId, metadata: { visibility: replySeed.type }, createdAt: replyCreatedAt },
      });
      eventCount += 1;
    }

    if (ticketSeed.archived) {
      const eventId = seedId(6, ticketSeed.number * 100 + 1);
      await prisma.ticketEvent.upsert({
        where: { id: eventId },
        update: {
          ticketId,
          actorId: seededUsers.supervisor.id,
          type: "ARCHIVED",
          oldValue: ticketSeed.status,
          newValue: "ARCHIVED",
          createdAt: archivedAt ?? statusChangedAt,
        },
        create: {
          id: eventId,
          ticketId,
          actorId: seededUsers.supervisor.id,
          type: "ARCHIVED",
          oldValue: ticketSeed.status,
          newValue: "ARCHIVED",
          createdAt: archivedAt ?? statusChangedAt,
        },
      });
      eventCount += 1;
    }
  }

  const alertSeeds = [
    { number: 4, type: "AT_RISK" as const, sequence: 1, acknowledgedBy: null },
    { number: 13, type: "BREACHED" as const, sequence: 1, acknowledgedBy: null },
    { number: 20, type: "BREACHED" as const, sequence: 1, acknowledgedBy: null },
  ];

  for (const alert of alertSeeds) {
    const alertId = seedId(7, alert.number * 100 + alert.sequence);
    const alertTicket = tickets.find((ticket) => ticket.number === alert.number);
    if (!alertTicket) {
      throw new Error(`Alert ticket ${alert.number} is not defined`);
    }
    const alertCreatedAt = hoursAfter(
      ticketCreatedAt(alertTicket),
      Math.max(0.25, alertTicket.ageDays * 12)
    );
const alertData = {
  ticketId: seedId(1, alert.number),
  type: alert.type,
  breachSequence: alert.sequence,
  acknowledgedAt: alert.acknowledgedBy
    ? hoursAfter(DEMO_NOW, -12)
    : null,
  acknowledgedById: alert.acknowledgedBy,
  createdAt: alertCreatedAt,
  resolvedAt: alert.acknowledgedBy
    ? hoursAfter(alertCreatedAt, 2)
    : null,
};

await prisma.sLAAlert.upsert({
  where: {
    ticketId_breachSequence_type: {
      ticketId: alertData.ticketId,
      breachSequence: alertData.breachSequence,
      type: alertData.type,
    },
  },
  update: alertData,
  create: {
    id: alertId,
    ...alertData,
  },
});

alertCount += 1;
  }

  console.log("Database seed completed.");
  console.log(`Users upserted: ${Object.keys(users).length}`);
  console.log(`Tickets upserted: ${tickets.length}`);
  console.log(`Replies upserted: ${replyCount}`);
  console.log(`Events upserted: ${eventCount}`);
  console.log(`Collaborators upserted: ${collaboratorCount}`);
  console.log(`SLA alerts upserted: ${alertCount}`);
  console.log("");
  console.log("Demo credentials (all use Password123!):");
  for (const data of Object.values(users)) {
    console.log(`${data.role}: ${data.email}`);
  }
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });