import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  createReplySchema,
} from "./ticket.validation.js";

import {
  createReply as createReplyService,
} from "./reply.service.js";

export async function createReply(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id: ticketId } = req.params;

    if (!ticketId || Array.isArray(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    const input = createReplySchema.parse(
      req.body
    );

    const reply = await createReplyService(
      ticketId,
      input,
      req.user.userId,
      req.user.role
    );

    return res.status(201).json({
      success: true,
      data: reply,
    });
  } catch (error) {
    next(error);
  }
}