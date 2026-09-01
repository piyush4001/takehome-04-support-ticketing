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

export const updateTicketSchema = z
  .object({
    subject: z.string().trim().min(1).max(200).optional(),

    description: z.string().trim().min(1).optional(),

    requesterName: z.string().trim().min(1).optional(),

    requesterEmail: z.string().email().optional(),

    priority: z
      .enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
      .optional(),

    category: z.string().trim().min(1).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field must be provided",
    }
  );

export const updateTicketStatusSchema = z.object({
  status: z.enum([
    "NEW",
    "OPEN",
    "PENDING",
    "RESOLVED",
    "CLOSED",
  ]),
});

export type UpdateTicketInput = z.infer<
  typeof updateTicketSchema
>;

export type UpdateTicketStatusInput = z.infer<
  typeof updateTicketStatusSchema
>;

export const createReplySchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Reply body is required"),

  type: z.enum([
    "CUSTOMER_REPLY",
    "INTERNAL_NOTE",
  ]),
});

export type CreateReplyInput = z.infer<
  typeof createReplySchema
>;

export const addCollaboratorSchema = z.object({
  userId: z.string().uuid(),
});

export type AddCollaboratorInput = z.infer<
  typeof addCollaboratorSchema
>;