-- CreateEnum
CREATE TYPE "Role" AS ENUM ('AGENT', 'SUPERVISOR');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('NEW', 'OPEN', 'PENDING', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ReplyType" AS ENUM ('INTERNAL_NOTE', 'CUSTOMER_REPLY');

-- CreateEnum
CREATE TYPE "TicketEventType" AS ENUM ('TICKET_CREATED', 'STATUS_CHANGED', 'ASSIGNMENT_CHANGED', 'COLLABORATOR_ADDED', 'COLLABORATOR_REMOVED', 'REPLY_ADDED', 'ARCHIVED', 'RESTORED');

-- CreateEnum
CREATE TYPE "SLAAlertType" AS ENUM ('AT_RISK', 'BREACHED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requesterName" TEXT NOT NULL,
    "requesterEmail" TEXT NOT NULL,
    "priority" "TicketPriority" NOT NULL,
    "category" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'NEW',
    "primaryAssigneeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "responseTargetSeconds" INTEGER NOT NULL,
    "responseElapsedSeconds" INTEGER NOT NULL DEFAULT 0,
    "slaRunningSince" TIMESTAMP(3),
    "firstRespondedAt" TIMESTAMP(3),

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketCollaborator" (
    "ticketId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketCollaborator_pkey" PRIMARY KEY ("ticketId","userId")
);

-- CreateTable
CREATE TABLE "Reply" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" "ReplyType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketEvent" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "actorId" TEXT,
    "type" "TicketEventType" NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SLAAlert" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "type" "SLAAlertType" NOT NULL,
    "breachSequence" INTEGER NOT NULL,
    "acknowledgedAt" TIMESTAMP(3),
    "acknowledgedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "SLAAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");

-- CreateIndex
CREATE INDEX "Ticket_priority_idx" ON "Ticket"("priority");

-- CreateIndex
CREATE INDEX "Ticket_category_idx" ON "Ticket"("category");

-- CreateIndex
CREATE INDEX "Ticket_primaryAssigneeId_idx" ON "Ticket"("primaryAssigneeId");

-- CreateIndex
CREATE INDEX "Ticket_createdAt_idx" ON "Ticket"("createdAt");

-- CreateIndex
CREATE INDEX "Ticket_updatedAt_idx" ON "Ticket"("updatedAt");

-- CreateIndex
CREATE INDEX "Ticket_archivedAt_idx" ON "Ticket"("archivedAt");

-- CreateIndex
CREATE INDEX "Ticket_resolvedAt_idx" ON "Ticket"("resolvedAt");

-- CreateIndex
CREATE INDEX "Ticket_status_archivedAt_idx" ON "Ticket"("status", "archivedAt");

-- CreateIndex
CREATE INDEX "Ticket_primaryAssigneeId_archivedAt_idx" ON "Ticket"("primaryAssigneeId", "archivedAt");

-- CreateIndex
CREATE INDEX "TicketCollaborator_userId_idx" ON "TicketCollaborator"("userId");

-- CreateIndex
CREATE INDEX "Reply_ticketId_createdAt_idx" ON "Reply"("ticketId", "createdAt");

-- CreateIndex
CREATE INDEX "TicketEvent_ticketId_createdAt_idx" ON "TicketEvent"("ticketId", "createdAt");

-- CreateIndex
CREATE INDEX "TicketEvent_actorId_idx" ON "TicketEvent"("actorId");

-- CreateIndex
CREATE INDEX "SLAAlert_ticketId_idx" ON "SLAAlert"("ticketId");

-- CreateIndex
CREATE INDEX "SLAAlert_acknowledgedAt_idx" ON "SLAAlert"("acknowledgedAt");

-- CreateIndex
CREATE INDEX "SLAAlert_ticketId_breachSequence_idx" ON "SLAAlert"("ticketId", "breachSequence");

-- CreateIndex
CREATE UNIQUE INDEX "SLAAlert_ticketId_breachSequence_type_key" ON "SLAAlert"("ticketId", "breachSequence", "type");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_primaryAssigneeId_fkey" FOREIGN KEY ("primaryAssigneeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketCollaborator" ADD CONSTRAINT "TicketCollaborator_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketCollaborator" ADD CONSTRAINT "TicketCollaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketEvent" ADD CONSTRAINT "TicketEvent_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketEvent" ADD CONSTRAINT "TicketEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SLAAlert" ADD CONSTRAINT "SLAAlert_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SLAAlert" ADD CONSTRAINT "SLAAlert_acknowledgedById_fkey" FOREIGN KEY ("acknowledgedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
