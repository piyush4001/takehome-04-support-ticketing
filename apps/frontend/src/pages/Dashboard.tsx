import { useEffect, useState } from "react";
import api from "../lib/api";

type DashboardData = {
  summary: {
    openTickets: number;
    pendingTickets: number;
    resolvedThisWeek: number;
    breachingTickets: number;
  };
  statusBreakdown: {
    status: string;
    count: number;
  }[];
  agentBreakdown: {
    agent: {
      id: string;
      name: string;
      email: string;
    };
    count: number;
  }[];
  resolvedPerWeek: {
    weekStart: string;
    weekEnd: string;
    count: number;
  }[];
};

function MetricCard({
  label,
  value,
  alert = false,
}: {
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <article
      className={`rounded-xl border bg-white p-6 shadow-sm ${
        alert ? "border-red-200" : "border-slate-200"
      }`}
    >
      <span className="block text-sm font-semibold text-slate-500">
        {label}
      </span>

      <strong
        className={`mt-3 block text-3xl font-bold ${
          alert ? "text-red-600" : "text-slate-900"
        }`}
      >
        {value}
      </strong>
    </article>
  );
}

function StatusBreakdown({
  data,
}: {
  data: DashboardData["statusBreakdown"];
}) {
  const maxCount = Math.max(
    ...data.map((item) => item.count),
    1
  );

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">
          Tickets by Status
        </h2>
      </div>

      <div className="space-y-5">
        {data.map((item) => (
          <div key={item.status}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                {item.status}
              </span>

              <strong className="text-sm text-slate-900">
                {item.count}
              </strong>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-600 transition-all"
                style={{
                  width: `${(item.count / maxCount) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function AgentBreakdown({
  data,
}: {
  data: DashboardData["agentBreakdown"];
}) {
  const maxCount = Math.max(
    ...data.map((item) => item.count),
    1
  );

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">
          Tickets by Agent
        </h2>
      </div>

      <div className="space-y-5">
        {data.map((item) => (
          <div key={item.agent.id}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <div>
                <span className="block text-sm font-semibold text-slate-700">
                  {item.agent.name}
                </span>

                <small className="block text-xs text-slate-400">
                  {item.agent.email}
                </small>
              </div>

              <strong className="text-sm text-slate-900">
                {item.count}
              </strong>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-600 transition-all"
                style={{
                  width: `${(item.count / maxCount) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function WeeklyResolution({
  data,
}: {
  data: DashboardData["resolvedPerWeek"];
}) {
  const maxCount = Math.max(
    ...data.map((item) => item.count),
    1
  );

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">
          Resolved Tickets — Last 8 Weeks
        </h2>
      </div>

      <div className="space-y-4">
        {data.map((week) => (
          <div
            key={week.weekStart}
            className="grid grid-cols-[90px_1fr_40px] items-center gap-3 sm:grid-cols-[120px_1fr_40px]"
          >
            <span className="text-xs text-slate-500">
              {new Date(week.weekStart).toLocaleDateString()}
            </span>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-600 transition-all"
                style={{
                  width: `${(week.count / maxCount) * 100}%`,
                }}
              />
            </div>

            <strong className="text-right text-sm">
              {week.count}
            </strong>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function Dashboard() {
  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response =
          await api.get<DashboardData>("/dashboard");

        setDashboard(response.data);
      } catch {
        setError(
          "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    }

    void fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="app-state">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-state error">
        {error}
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="app-state error">
        No dashboard data available.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="mb-2 text-xs font-bold tracking-[0.12em] text-slate-500">
            SUPPORT OPERATIONS
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Overview of your support ticket queue and SLA performance.
          </p>
        </header>

        <section className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Open Tickets"
            value={dashboard.summary.openTickets}
          />

          <MetricCard
            label="Pending on Customer"
            value={dashboard.summary.pendingTickets}
          />

          <MetricCard
            label="Resolved This Week"
            value={dashboard.summary.resolvedThisWeek}
          />

          <MetricCard
            label="SLA Breaches"
            value={dashboard.summary.breachingTickets}
            alert
          />
        </section>

        <section className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <StatusBreakdown
            data={dashboard.statusBreakdown}
          />

          <AgentBreakdown
            data={dashboard.agentBreakdown}
          />
        </section>

        <WeeklyResolution
          data={dashboard.resolvedPerWeek}
        />
      </div>
    </main>
  );
}