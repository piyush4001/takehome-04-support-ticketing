import { useAuth } from "../auth/useAuth";

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-xs font-bold tracking-[0.12em] text-slate-500">
          ACCOUNT
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Profile
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Your authenticated support account.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="divide-y divide-slate-100">
          <div className="grid gap-1 py-4 sm:grid-cols-[120px_1fr] sm:gap-4">
            <dt className="text-sm font-semibold text-slate-500">Name</dt>
            <dd className="text-sm text-slate-900">{user.name}</dd>
          </div>
          <div className="grid gap-1 py-4 sm:grid-cols-[120px_1fr] sm:gap-4">
            <dt className="text-sm font-semibold text-slate-500">Email</dt>
            <dd className="text-sm text-slate-900">{user.email}</dd>
          </div>
          <div className="grid gap-1 py-4 sm:grid-cols-[120px_1fr] sm:gap-4">
            <dt className="text-sm font-semibold text-slate-500">Role</dt>
            <dd className="text-sm font-semibold text-slate-900">{user.role}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={logout}
          className="mt-6 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Log out
        </button>
      </section>
    </div>
  );
}