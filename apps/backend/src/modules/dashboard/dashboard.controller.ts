import type { Request, Response } from "express";

import { getDashboard } from "./dashboard.service.js";
import { AppError } from "../../utils/app.error.js";

export async function getDashboardController(
  req: Request,
  res: Response
) {
  if (req.user?.role !== "SUPERVISOR") {
    throw new AppError(
      403,
      "Only supervisors can access the dashboard"
    );
  }

  const dashboard = await getDashboard();

  res.status(200).json(dashboard);
}