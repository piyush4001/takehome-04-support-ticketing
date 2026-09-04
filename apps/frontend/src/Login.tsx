import { type FormEvent, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Headphones,
  Info,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import api from "./lib/api";
import type { LoginResponse } from "./types/auth";

type LoginProps = {
  onLogin: (
    token: string,
    user: LoginResponse["data"]["user"]
  ) => void;
};

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <main className="min-h-screen bg-slate-950">
      <div className="flex min-h-screen">
        {/* Left visual panel */}
        <section className="relative hidden overflow-hidden lg:flex lg:w-[52%]">
          <img
            src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1800&q=85"
            alt="Support team collaborating in an office"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Image overlays */}
          <div className="absolute inset-0 bg-slate-950/65" />
          <div className="absolute inset-0 bg-linear-to-br from-slate-950/90 via-slate-900/55 to-blue-950/70" />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-950 shadow-xl">
                <Headphones className="h-5 w-5" strokeWidth={2.2} />
              </div>

              <div>
                <p className="text-sm font-bold tracking-tight text-white">
                  SupportDesk
                </p>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/50">
                  Support Operations
                </p>
              </div>
            </div>

            {/* Hero copy */}
            <div className="max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Support operations workspace
              </div>

              <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-white xl:text-5xl">
                Resolve issues.
                <br />
                Keep customers moving.
              </h1>

              <p className="mt-5 max-w-lg text-sm leading-7 text-white/65 xl:text-base">
                Manage support requests, collaborate with your team, and
                keep every customer conversation organized in one place.
              </p>

              <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                  <ShieldCheck className="h-5 w-5 text-white/80" />
                  <p className="mt-3 text-xs font-semibold text-white">
                    Secure
                  </p>
                  <p className="mt-1 text-[11px] text-white/45">
                    Role-based access
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                  <Headphones className="h-5 w-5 text-white/80" />
                  <p className="mt-3 text-xs font-semibold text-white">
                    Collaborative
                  </p>
                  <p className="mt-1 text-[11px] text-white/45">
                    Work as a team
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                  <LockKeyhole className="h-5 w-5 text-white/80" />
                  <p className="mt-3 text-xs font-semibold text-white">
                    Protected
                  </p>
                  <p className="mt-1 text-[11px] text-white/45">
                    Secure workspace
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-white/35">
              SupportDesk · Support operations platform
            </p>
          </div>
        </section>

        {/* Right login panel */}
        <section className="flex min-h-screen flex-1 items-center justify-center bg-slate-50 px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            {/* Mobile brand */}
            <div className="mb-9 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-lg">
                <Headphones className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-bold tracking-tight text-slate-950">
                  SupportDesk
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Support Operations
                </p>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Welcome back
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                Sign in to your workspace
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter your credentials to continue managing your support
                tickets.
              </p>
            </div>

            {/* Form card */}
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8"
            >
              <div className="space-y-5">
                {/* Email */}
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Email address
                  </span>

                  <div className="group relative">
                    <Mail
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400 transition group-focus-within:text-slate-700"
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-slate-500 focus:bg-white focus:ring-4 focus:ring-slate-100"
                    />
                  </div>
                </label>

                {/* Password */}
                <label className="block">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">
                      Password
                    </span>
                  </div>

                  <div className="group relative">
                    <LockKeyhole
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400 transition group-focus-within:text-slate-700"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-slate-500 focus:bg-white focus:ring-4 focus:ring-slate-100"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4.5 w-4.5" />
                      ) : (
                        <Eye className="h-4.5 w-4.5" />
                      )}
                    </button>
                  </div>
                </label>

                {/* Error */}
                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-700"
                  >
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                      />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Security note */}
              <div className="mt-6 flex items-start gap-2.5 border-t border-slate-100 pt-5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                <p className="text-xs leading-5 text-slate-400">
                  Your workspace is protected with secure authentication
                  and role-based access controls.
                </p>
              </div>
            </form>

            <p className="mt-6 text-center text-xs text-slate-400">
              Secure support workspace
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}