import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSlaAlerts } from "../hooks/useSlaAlerts";
import { useAuth } from "../auth/useAuth";

export default function Layout() {
  const { alerts } = useSlaAlerts();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const displayName = user?.name || user?.email || "User";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const roleLabel =
    user?.role === "SUPERVISOR"
      ? "Supervisor"
      : user?.role === "AGENT"
        ? "Agent"
        : user?.role || "User";

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
      isActive
        ? "bg-slate-100 text-slate-950 shadow-sm"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
    }`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200/80 bg-white lg:flex lg:flex-col">
        {/* Brand */}
        <div className="border-b border-slate-200/80 px-6 py-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Support Operations
          </p>

          <div className="mt-2 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
              T
            </div>

            <h1 className="text-lg font-bold tracking-tight text-slate-950">
              Ticketing
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5">
          <p className="mb-2 px-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Workspace
          </p>

          <div className="space-y-1">
            {user?.role === "SUPERVISOR" && (
              <NavLink to="/dashboard" className={navItemClass}>
                <span>Dashboard</span>
              </NavLink>
            )}

            <NavLink to="/tickets" className={navItemClass}>
              <span>Tickets</span>
            </NavLink>

            <NavLink
              to="/alerts"
              className={({ isActive }) =>
                `${navItemClass({ isActive })} justify-between`
              }
            >
              <span>Alerts</span>

              {alerts.length > 0 && (
                <span className="min-w-6 rounded-full bg-red-50 px-1.5 py-0.5 text-center text-[11px] font-bold text-red-600 ring-1 ring-red-100">
                  {alerts.length}
                </span>
              )}
            </NavLink>
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-slate-200/80 p-3">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `mb-2 flex items-center gap-3 rounded-xl p-3 transition-colors ${
                isActive
                  ? "bg-slate-100"
                  : "hover:bg-slate-50"
              }`
            }
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
              {avatarLetter}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {displayName}
              </p>

              <p className="mt-0.5 truncate text-xs text-slate-500">
                {roleLabel}
              </p>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="flex w-full items-center rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowLogoutConfirm(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 8.25L21 12l-3 3.75M21 12H9"
                />
              </svg>
            </div>

            <h2
              id="logout-title"
              className="mt-4 text-lg font-bold text-slate-950"
            >
              Log out?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to log out of your account?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}