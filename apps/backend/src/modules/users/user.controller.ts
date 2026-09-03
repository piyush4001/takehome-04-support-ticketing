import type { Request, Response } from "express";

import { getAgents } from "./user.service.js";

export async function getAgentsController(
  _req: Request,
  res: Response
) {
  const agents = await getAgents();

  res.status(200).json({
    success: true,
    data: agents,
  });
}