import { LogOut, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "../auth/useAuth";

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roleLabel =
    user.role === "SUPERVISOR" ? "Supervisor" : "Support Agent";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Page header */}
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#173b67]">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Profile
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          View your authenticated support account details.
        </p>
      </header>

      {/* Profile card */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Profile hero */}
        <div className="bg-[#173b67] px-6 py-8 md:px-8">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-xl font-bold text-[#173b67] shadow-sm">
              {initials}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-white">
                {user.name}
              </h2>
              <p className="mt-1 truncate text-sm text-blue-100">
                {user.email}
              </p>

              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-inset ring-white/20">
                <ShieldCheck className="h-3.5 w-3.5" />
                {roleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Account details */}
        <div className="p-6 md:p-8">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-slate-900">
              Account information
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Your current account and access information.
            </p>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                <UserRound className="h-3.5 w-3.5" />
                Name
              </dt>
              <dd className="mt-2 text-sm font-semibold text-slate-900">
                {user.name}
              </dd>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                <Mail className="h-3.5 w-3.5" />
                Email
              </dt>
              <dd className="mt-2 break-all text-sm font-semibold text-slate-900">
                {user.email}
              </dd>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:col-span-2">
              <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Role
              </dt>
              <dd className="mt-2">
                <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  {roleLabel}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        {/* Logout */}
        <div className="flex justify-end border-t border-slate-200 bg-slate-50/60 px-6 py-4 md:px-8">
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </section>
    </div>
  );
}