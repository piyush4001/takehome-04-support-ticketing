import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  bulkReassignSchema,
  bulkCloseSchema,
} from "./ticket.validation.js";

import {
  bulkReassignTickets,
  bulkCloseTickets,
} from "./bulk.service.js";
export async function bulkReassign(
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

    const input =
      bulkReassignSchema.parse(req.body);

    const results =
      await bulkReassignTickets(
        input.ticketIds,
        input.assigneeId,
        req.user.userId,
        req.user.role
      );

    return res.status(200).json({
      success: true,
      data: {
        results,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function bulkClose(
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

    const input =
      bulkCloseSchema.parse(req.body);

    const results =
      await bulkCloseTickets(
        input.ticketIds,
        req.user.userId,
        req.user.role
      );

    return res.status(200).json({
      success: true,
      data: {
        results,
      },
    });
  } catch (error) {
    next(error);
  }
}