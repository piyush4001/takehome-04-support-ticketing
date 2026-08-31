import { z } from "zod";

export const createTicketSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(1, "Subject is required")
    .max(200, "Subject is too long"),

  description: z
    .string()
    .trim()
    .min(1, "Description is required"),

  requesterName: z
    .string()
    .trim()
    .min(1, "Requester name is required"),

  requesterEmail: z
    .string()
    .email("Invalid requester email"),

  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),

  category: z
    .string()
    .trim()
    .min(1, "Category is required"),

  primaryAssigneeId: z.string().uuid().optional(),
});

export type CreateTicketInput = z.infer<
  typeof createTicketSchema
>;

export const listTicketsSchema = z.object({
  search: z
  .string()
  .trim()
  .min(1)
  .optional(),

  status: z
    .enum(["NEW", "OPEN", "PENDING", "RESOLVED", "CLOSED"])
    .optional(),

  priority: z
    .enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
    .optional(),

  category: z
  .string()
  .trim()
  .min(1)
  .optional(),

  assigneeId: z.string().uuid().optional(),

  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20),

  sortBy: z
    .enum([
      "createdAt",
      "updatedAt",
      "priority",
      "status",
    ])
    .default("createdAt"),

  sortOrder: z
    .enum(["asc", "desc"])
    .default("desc"),
});

export type ListTicketsInput = z.infer<
  typeof listTicketsSchema
>;