import { type FormEvent, useState } from "react";
import api from "./lib/api";
type LoginProps = {
  onLogin: (token: string) => void;
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
     const response = await api.post("/auth/login", {
        email,
        password,
      });

      const token = response.data.data.token;

      localStorage.setItem("token", token);
      onLogin(token);
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-8">
      <form
        className="flex w-full max-w-md flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg"
        onSubmit={handleSubmit}
      >
        <div>
          <p className="mb-2 text-xs font-bold tracking-[0.12em] text-slate-500">
            SUPPORT OPERATIONS
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Sign in
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Sign in to access the support dashboard.
          </p>
        </div>

        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
          Email

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
          Password

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </label>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}