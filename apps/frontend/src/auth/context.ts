import { createContext } from "react";
import type { AuthUser } from "../types/auth";

export type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);