import { NavLink, Outlet } from "react-router-dom";
import { useSlaAlerts } from "../hooks/useSlaAlerts";

export default function Layout() {
  const { alerts } = useSlaAlerts();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <div className="border-b border-slate-200 p-6">
          <p className="text-xs font-bold tracking-[0.12em] text-slate-500">
            SUPPORT OPERATIONS
          </p>

          <h1 className="mt-2 text-lg font-bold">
            Ticketing
          </h1>
        </div>

        <nav className="p-4">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `block rounded-lg px-4 py-2.5 text-sm font-semibold ${
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50"
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/tickets"
            className={({ isActive }) =>
              `mt-1 block rounded-lg px-4 py-2.5 text-sm font-semibold ${
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50"
              }`
            }
          >
            Tickets
          </NavLink>

          <NavLink
            to="/alerts"
            className={({ isActive }) =>
              `mt-1 flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-semibold ${
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50"
              }`
            }
          >
            <span>Alerts</span>
            {alerts.length > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                {alerts.length}
              </span>
            )}
          </NavLink>
        </nav>
      </aside>

      <main className="lg:pl-64">
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
