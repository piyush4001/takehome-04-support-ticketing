import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const DEMO_PASSWORD = "Password123!";

async function main() {
  console.log("Starting database seed...");

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // --------------------------------------------------
  // Users
  // --------------------------------------------------

  const supervisor = await prisma.user.upsert({
    where: {
      email: "supervisor@example.com",
    },
    update: {
      name: "Sarah Supervisor",
      role: "SUPERVISOR",
      passwordHash,
    },
    create: {
      email: "supervisor@example.com",
      name: "Sarah Supervisor",
      role: "SUPERVISOR",
      passwordHash,
    },
  });

  const alice = await prisma.user.upsert({
    where: {
      email: "alice@example.com",
    },
    update: {
      name: "Alice Agent",
      role: "AGENT",
      passwordHash,
    },
    create: {
      email: "alice@example.com",
      name: "Alice Agent",
      role: "AGENT",
      passwordHash,
    },
  });

  const bob = await prisma.user.upsert({
    where: {
      email: "bob@example.com",
    },
    update: {
      name: "Bob Agent",
      role: "AGENT",
      passwordHash,
    },
    create: {
      email: "bob@example.com",
      name: "Bob Agent",
      role: "AGENT",
      passwordHash,
    },
  });

  const charlie = await prisma.user.upsert({
    where: {
      email: "charlie@example.com",
    },
    update: {
      name: "Charlie Agent",
      role: "AGENT",
      passwordHash,
    },
    create: {
      email: "charlie@example.com",
      name: "Charlie Agent",
      role: "AGENT",
      passwordHash,
    },
  });

  console.log("Users created.");

  // --------------------------------------------------
  // Tickets
  // --------------------------------------------------

  const ticket1 = await prisma.ticket.create({
    data: {
      subject: "Unable to reset password",
      description:
        "The password reset link expires immediately after clicking it.",
      requesterName: "John Doe",
      requesterEmail: "john@example.com",
      priority: "HIGH",
      category: "ACCOUNT",
      status: "OPEN",
      primaryAssigneeId: alice.id,
      responseTargetSeconds: 4 * 60 * 60,
      responseElapsedSeconds: 30 * 60,
      slaRunningSince: new Date(Date.now() - 30 * 60 * 1000),
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      subject: "Payment charged twice",
      description:
        "The customer was charged twice for the same subscription.",
      requesterName: "Emily Smith",
      requesterEmail: "emily@example.com",
      priority: "URGENT",
      category: "BILLING",
      status: "OPEN",
      primaryAssigneeId: bob.id,
      responseTargetSeconds: 1 * 60 * 60,
      responseElapsedSeconds: 90 * 60,
      slaRunningSince: new Date(Date.now() - 90 * 60 * 1000),
    },
  });

  const ticket3 = await prisma.ticket.create({
    data: {
      subject: "How to export account data",
      description:
        "Customer wants instructions for exporting all account data.",
      requesterName: "Michael Brown",
      requesterEmail: "michael@example.com",
      priority: "LOW",
      category: "HOW_TO",
      status: "PENDING",
      primaryAssigneeId: alice.id,
      responseTargetSeconds: 24 * 60 * 60,
      responseElapsedSeconds: 2 * 60 * 60,
      slaRunningSince: null,
    },
  });

  const ticket4 = await prisma.ticket.create({
    data: {
      subject: "Application crashes during checkout",
      description:
        "The application crashes when the customer attempts to complete checkout.",
      requesterName: "David Wilson",
      requesterEmail: "david@example.com",
      priority: "URGENT",
      category: "BUG",
      status: "NEW",
      primaryAssigneeId: charlie.id,
      responseTargetSeconds: 1 * 60 * 60,
      responseElapsedSeconds: 0,
      slaRunningSince: new Date(),
    },
  });

  const ticket5 = await prisma.ticket.create({
    data: {
      subject: "Invoice address needs correction",
      description:
        "The billing address on the latest invoice is incorrect.",
      requesterName: "Emma Davis",
      requesterEmail: "emma@example.com",
      priority: "MEDIUM",
      category: "BILLING",
      status: "RESOLVED",
      primaryAssigneeId: bob.id,
      responseTargetSeconds: 12 * 60 * 60,
      responseElapsedSeconds: 3 * 60 * 60,
      slaRunningSince: null,
      firstRespondedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  const ticket6 = await prisma.ticket.create({
    data: {
      subject: "Cannot update profile information",
      description:
        "The save button does not update the customer's profile.",
      requesterName: "James Taylor",
      requesterEmail: "james@example.com",
      priority: "HIGH",
      category: "ACCOUNT",
      status: "CLOSED",
      primaryAssigneeId: alice.id,
      responseTargetSeconds: 4 * 60 * 60,
      responseElapsedSeconds: 2 * 60 * 60,
      slaRunningSince: null,
      firstRespondedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      resolvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      closedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("Tickets created.");

  // --------------------------------------------------
  // Collaborators
  // --------------------------------------------------

  await prisma.ticketCollaborator.createMany({
    data: [
      {
        ticketId: ticket1.id,
        userId: bob.id,
      },
      {
        ticketId: ticket1.id,
        userId: charlie.id,
      },
      {
        ticketId: ticket3.id,
        userId: bob.id,
      },
      {
        ticketId: ticket4.id,
        userId: alice.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Collaborators created.");

  // --------------------------------------------------
  // Replies
  // --------------------------------------------------

  const reply1 = await prisma.reply.create({
    data: {
      ticketId: ticket1.id,
      authorId: alice.id,
      body: "Hi John, we're looking into the password reset issue.",
      type: "CUSTOMER_REPLY",
    },
  });

  const reply2 = await prisma.reply.create({
    data: {
      ticketId: ticket1.id,
      authorId: bob.id,
      body: "I found an issue with the reset token expiration configuration.",
      type: "INTERNAL_NOTE",
    },
  });

  await prisma.reply.create({
    data: {
      ticketId: ticket2.id,
      authorId: bob.id,
      body: "We've identified the duplicate charge and are investigating the refund.",
      type: "CUSTOMER_REPLY",
    },
  });

  await prisma.reply.create({
    data: {
      ticketId: ticket3.id,
      authorId: alice.id,
      body: "Could you confirm which export format you would prefer?",
      type: "CUSTOMER_REPLY",
    },
  });

  console.log("Replies created.");

  // --------------------------------------------------
  // Ticket events
  // --------------------------------------------------

  await prisma.ticketEvent.createMany({
    data: [
      {
        ticketId: ticket1.id,
        actorId: supervisor.id,
        type: "TICKET_CREATED",
      },
      {
        ticketId: ticket1.id,
        actorId: supervisor.id,
        type: "ASSIGNMENT_CHANGED",
        oldValue: null,
        newValue: alice.id,
      },
      {
        ticketId: ticket1.id,
        actorId: alice.id,
        type: "STATUS_CHANGED",
        oldValue: "NEW",
        newValue: "OPEN",
      },
      {
        ticketId: ticket1.id,
        actorId: alice.id,
        type: "REPLY_ADDED",
        newValue: reply1.id,
        metadata: {
          visibility: "CUSTOMER_REPLY",
        },
      },
      {
        ticketId: ticket1.id,
        actorId: bob.id,
        type: "REPLY_ADDED",
        newValue: reply2.id,
        metadata: {
          visibility: "INTERNAL_NOTE",
        },
      },
      {
        ticketId: ticket3.id,
        actorId: alice.id,
        type: "STATUS_CHANGED",
        oldValue: "OPEN",
        newValue: "PENDING",
      },
      {
        ticketId: ticket4.id,
        actorId: supervisor.id,
        type: "TICKET_CREATED",
      },
    ],
  });

  console.log("Ticket history created.");

  // --------------------------------------------------
  // SLA alerts
  // --------------------------------------------------

  await prisma.sLAAlert.create({
    data: {
      ticketId: ticket2.id,
      type: "BREACHED",
      breachSequence: 1,
    },
  });

  await prisma.sLAAlert.create({
    data: {
      ticketId: ticket1.id,
      type: "AT_RISK",
      breachSequence: 1,
    },
  });

  console.log("SLA alerts created.");

  console.log("Database seed completed.");
  console.log("");
  console.log("Demo credentials:");
  console.log("Supervisor: supervisor@example.com / Password123!");
  console.log("Agent:      alice@example.com / Password123!");
  console.log("Agent:      bob@example.com / Password123!");
  console.log("Agent:      charlie@example.com / Password123!");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });