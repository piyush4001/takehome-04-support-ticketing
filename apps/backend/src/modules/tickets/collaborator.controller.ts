import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  addCollaboratorSchema,
} from "./ticket.validation.js";

import {
  addCollaborator as addCollaboratorService,
  removeCollaborator as removeCollaboratorService,
} from "./collaborator.service.js";

export async function addCollaborator(
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

    const { userId } =
      addCollaboratorSchema.parse(req.body);

    const result =
      await addCollaboratorService(
        ticketId,
        userId,
        req.user.userId,
        req.user.role
      );

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeCollaborator(
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

    const { id: ticketId, userId } =
      req.params;

    if (
      !ticketId ||
      Array.isArray(ticketId) ||
      !userId ||
      Array.isArray(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket or user ID",
      });
    }

    await removeCollaboratorService(
      ticketId,
      userId,
      req.user.userId,
      req.user.role
    );

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}