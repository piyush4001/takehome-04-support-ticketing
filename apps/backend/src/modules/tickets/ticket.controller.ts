import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { createTicketSchema, updateTicketStatusSchema } from "./ticket.validation.js";
import { createTicket as createTicketService } from "./ticket.service.js";
import { listTicketsSchema } from "./ticket.validation.js";
import { listTickets as listTicketsService } from "./ticket.service.js";
import { getTicketById as getTicketByIdService } from "./ticket.service.js";
import { updateTicketSchema} from "./ticket.validation.js";
import { updateTicket as updateTicketService } from "./ticket.service.js";
import { updateTicketStatus as updateTicketStatusService } from "./ticket.service.js";

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

export async function getTicketById(
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

    const ticket = await getTicketByIdService(
      ticketId,
      req.user.userId,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTicket(
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

    const input = updateTicketSchema.parse(
      req.body
    );

    const ticket = await updateTicketService(
      ticketId,
      input,
      req.user.userId,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTicketStatus(
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

    const { status } =
      updateTicketStatusSchema.parse(req.body);

    const ticket =
      await updateTicketStatusService(
        ticketId,
        status,
        req.user.userId,
        req.user.role
      );

    return res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
}