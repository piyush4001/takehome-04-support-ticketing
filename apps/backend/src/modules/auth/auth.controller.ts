import type { Request, Response, NextFunction } from "express";
import { loginUser } from "./auth.service.js";
import { loginSchema } from "./auth.validation.js";

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = loginSchema.parse(req.body);

    const result = await loginUser(input);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}