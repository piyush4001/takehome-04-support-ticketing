import type { Role } from "../generated/prisma/enums.js";

export interface AuthUser {
  userId: string;
  role: Role;
}