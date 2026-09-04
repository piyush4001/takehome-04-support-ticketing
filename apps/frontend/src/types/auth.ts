export type UserRole = "AGENT" | "SUPERVISOR";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type LoginResponse = {
  success: boolean;
  data: {
    token: string;
    user: AuthUser;
  };
};