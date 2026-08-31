import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { createTicketSchema } from "./ticket.validation.js";
import { createTicket as createTicketService } from "./ticket.service.js";
import { listTicketsSchema } from "./ticket.validation.js";
import { listTickets as listTicketsService } from "./ticket.service.js";

export async function createTicket(
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

    const input = createTicketSchema.parse(req.body);

    const ticket = await createTicketService(
      input,
      req.user.userId
    );

    return res.status(201).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
}

export async function listTickets(
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

    const input = listTicketsSchema.parse(req.query);

    const result = await listTicketsService(
      input,
      req.user.userId,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}