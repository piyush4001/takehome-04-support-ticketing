import {
  useState,
  type ReactNode,
} from "react";
import type { AuthUser } from "../types/auth";
import { AuthContext } from "./context";

const USER_STORAGE_KEY = "authUser";
function readStoredUser(): AuthUser | null {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as AuthUser;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("token")
  );
  const [user, setUser] = useState<AuthUser | null>(
    readStoredUser
  );

  function login(newToken: string, newUser: AuthUser) {
    localStorage.setItem("token", newToken);
    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(newUser)
    );
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}