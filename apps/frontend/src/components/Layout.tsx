import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
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
        ? "bg-blue-900/70 text-white shadow-sm"
        : "text-blue-100/70 hover:bg-blue-900/50 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-[#0b1f3a] text-white lg:flex lg:flex-col">
        {/* Brand */}
        <div className="border-b border-white/10 px-6 py-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200/60">
            Support Operations
          </p>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-bold text-[#0b1f3a] shadow-sm">
              T
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                Ticketing
              </h1>

              <p className="mt-0.5 text-[11px] text-blue-200/50">
                Support workspace
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6">
          <p className="mb-3 px-3.5 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200/45">
            Workspace
          </p>

          <div className="space-y-1">
            {user?.role === "SUPERVISOR" && (
              <NavLink to="/dashboard" className={navItemClass}>
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="mr-3 h-4 w-4 shrink-0"
                >
                  <rect
                    width="7"
                    height="7"
                    x="3"
                    y="3"
                    rx="1"
                  />
                  <rect
                    width="7"
                    height="7"
                    x="14"
                    y="3"
                    rx="1"
                  />
                  <rect
                    width="7"
                    height="7"
                    x="3"
                    y="14"
                    rx="1"
                  />
                  <rect
                    width="7"
                    height="7"
                    x="14"
                    y="14"
                    rx="1"
                  />
                </svg>

                <span>Dashboard</span>
              </NavLink>
            )}

            <NavLink to="/tickets" className={navItemClass}>
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="mr-3 h-4 w-4 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6.75A2.75 2.75 0 016.75 4h10.5A2.75 2.75 0 0120 6.75v10.5A2.75 2.75 0 0117.25 20H6.75A2.75 2.75 0 014 17.25V6.75z"
                />
                <path
                  strokeLinecap="round"
                  d="M8 9h8M8 12h5M8 15h3"
                />
              </svg>

              <span>Tickets</span>
            </NavLink>

            <NavLink
              to="/alerts"
              className={({ isActive }) =>
                `${navItemClass({ isActive })} justify-between`
              }
            >
              <div className="flex items-center">
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="mr-3 h-4 w-4 shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17H9m10-2V11a7 7 0 10-14 0v4l-2 2h18l-2-2z"
                  />
                  <path
                    strokeLinecap="round"
                    d="M10 20h4"
                  />
                </svg>

                <span>Alerts</span>
              </div>

              {alerts.length > 0 && (
                <span className="min-w-6 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[11px] font-bold text-white shadow-sm">
                  {alerts.length}
                </span>
              )}
            </NavLink>
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-white/10 p-3">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `mb-2 flex items-center gap-3 rounded-xl p-3 transition-colors ${
                isActive
                  ? "bg-blue-900/70"
                  : "hover:bg-blue-900/50"
              }`
            }
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white ring-2 ring-white/10">
              {avatarLetter}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {displayName}
              </p>

              <p className="mt-0.5 truncate text-xs text-blue-200/60">
                {roleLabel}
              </p>
            </div>

            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4 shrink-0 text-blue-200/40"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 18l6-6-6-6"
              />
            </svg>
          </NavLink>

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="flex w-full items-center rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-blue-100/65 transition-colors hover:bg-red-500/10 hover:text-red-300"
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="mr-3 h-4 w-4 shrink-0"
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

            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen bg-white lg:pl-64">
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
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
                aria-hidden="true"
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