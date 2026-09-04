import { type FormEvent, useState } from "react";
import api from "./lib/api";
import type { LoginResponse } from "./types/auth";

type LoginProps = {
  onLogin: (
    token: string,
    user: LoginResponse["data"]["user"]
  ) => void;
};

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("supervisor@example.com");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      onLogin(
        response.data.data.token,
        response.data.data.user
      );
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-8">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-slate-200/60 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-slate-200/60 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white shadow-lg shadow-slate-900/10">
            T
          </div>

          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Support Operations
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            Ticketing
          </h1>
        </div>

        {/* Login card */}
        <form
          className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8"
          onSubmit={handleSubmit}
        >
          <div className="mb-7">
            <h2 className="text-xl font-bold tracking-tight text-slate-950">
              Welcome back
            </h2>

            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              Sign in to access your support workspace.
            </p>
          </div>

          <div className="space-y-5">
            {/* Email */}
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Email address
              </span>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
              />
            </label>

            {/* Password */}
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </span>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
              />
            </label>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-700"
              >
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mt-0.5 h-4 w-4 shrink-0"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path
                    strokeLinecap="round"
                    d="M12 8v4M12 16h.01"
                  />
                </svg>

                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                />
              )}

              <span>{loading ? "Signing in..." : "Sign in"}</span>
            </button>
          </div>
        </form>

        <p className="mt-5 text-center text-xs text-slate-400">
          Secure support workspace
        </p>
      </div>
    </main>
  );
}