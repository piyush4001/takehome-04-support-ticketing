import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app.error.js";
import {
    acknowledgeSlaAlert,
  calculateResponseElapsedSeconds,
} from "./sla.service.js";
export async function getSlaAlerts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      throw new AppError(401, "Authentication required");
    }

    const { userId, role } = req.user;

    const alerts = await prisma.sLAAlert.findMany({
      where: {
        acknowledgedAt: null,
        resolvedAt: null,
        ticket: {
          archivedAt: null,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        ticket: {
          select: {
            id: true,
            subject: true,
            status: true,
            priority: true,
            responseTargetSeconds: true,
            responseElapsedSeconds: true,
            slaRunningSince: true,
            firstRespondedAt: true,
            primaryAssigneeId: true,
          },
        },
      },
    });

    const visibleAlerts = alerts.filter((alert) => {
      if (role === "SUPERVISOR") {
        return true;
      }

      return alert.ticket.primaryAssigneeId === userId;
    });

    const data = visibleAlerts.map((alert) => ({
      ...alert,
      ticket: {
        ...alert.ticket,
        responseElapsedSeconds:
          calculateResponseElapsedSeconds(alert.ticket),
      },
    }));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}
export async function acknowledgeSlaAlertController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      throw new AppError(
        400,
        "Invalid SLA alert ID"
      );
    }
    if (!req.user) {
  throw new AppError(401, "Authentication required");
}

const { userId, role } = req.user;

    const alert = await acknowledgeSlaAlert(
      id,
      req.user.userId,
      req.user.role
    );

    res.status(200).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
}