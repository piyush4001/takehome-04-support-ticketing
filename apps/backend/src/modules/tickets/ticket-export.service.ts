import { prisma } from "../../lib/prisma.js";
import { buildTicketWhere } from "./ticket.filters.js";
import type { ExportTicketsInput } from "./ticket.validation.js";

function escapeCsv(value: unknown): string {
  const stringValue = value == null ? "" : String(value);

  return `"${stringValue.replace(/"/g, '""')}"`;
}

export async function exportTicketsCsv(
  input: ExportTicketsInput,
  userId: string,
  userRole: "AGENT" | "SUPERVISOR"
): Promise<string> {
  const where = buildTicketWhere({
    search: input.search,
    status: input.status,
    priority: input.priority,
    category: input.category,
    assigneeId: input.assigneeId,
    userId,
    userRole,
  });

  const tickets = await prisma.ticket.findMany({
    where,

    orderBy: {
      [input.sortBy]: input.sortOrder,
    },

    include: {
      primaryAssignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  const header = [
    "Ticket ID",
    "Subject",
    "Description",
    "Requester Name",
    "Requester Email",
    "Priority",
    "Category",
    "Status",
    "Assignee",
    "Created At",
    "Updated At",
  ];

  const rows = tickets.map((ticket) => [
    ticket.id,
    ticket.subject,
    ticket.description,
    ticket.requesterName,
    ticket.requesterEmail,
    ticket.priority,
    ticket.category,
    ticket.status,
    ticket.primaryAssignee?.name ?? "",
    ticket.createdAt.toISOString(),
    ticket.updatedAt.toISOString(),
  ]);

  return [
    header.map(escapeCsv).join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ].join("\r\n");
}