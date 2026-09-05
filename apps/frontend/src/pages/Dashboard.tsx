import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Inbox,
  TrendingUp,
} from "lucide-react";
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

let dashboardCache: DashboardData | null = null;

function MetricCard({
  label,
  value,
  description,
  type = "default",
}: {
  label: string;
  value: number;
  description: string;
  type?: "default" | "blue" | "green" | "danger";
}) {
  const styles = {
    default: {
      icon: "bg-slate-100 text-slate-600",
      value: "text-slate-950",
      Icon: Inbox,
    },
    blue: {
      icon: "bg-blue-50 text-blue-600",
      value: "text-slate-950",
      Icon: ClipboardList,
    },
    green: {
      icon: "bg-emerald-50 text-emerald-600",
      value: "text-slate-950",
      Icon: CheckCircle2,
    },
    danger: {
      icon: "bg-red-50 text-red-600",
      value: "text-red-600",
      Icon: AlertTriangle,
    },
  };

  const currentStyle = styles[type];
  const Icon = currentStyle.Icon;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>

          <strong
            className={`mt-2 block text-3xl font-bold tracking-tight ${currentStyle.value}`}
          >
            {value}
          </strong>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${currentStyle.icon}`}
        >
          <Icon
            aria-hidden="true"
            className="h-5 w-5"
            strokeWidth={1.8}
          />
        </div>
      </div>
    </article>
  );
}

function CardHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-base font-bold text-slate-950">{title}</h2>

      {description && (
        <p className="mt-1 text-xs leading-5 text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}

function StatusBreakdown({
  data,
}: {
  data: DashboardData["statusBreakdown"];
}) {
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <CardHeader
        title="Tickets by Status"
        description="Current distribution across ticket states."
      />

      {data.length === 0 ? (
        <EmptyChartState message="No status data available." />
      ) : (
        <div className="space-y-5">
          {data.map((item) => (
            <div key={item.status}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <span className="text-sm font-medium capitalize text-slate-700">
                  {item.status.toLowerCase()}
                </span>

                <span className="text-sm font-bold text-slate-950">
                  {item.count}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#173b67] transition-all duration-500"
                  style={{
                    width: `${(item.count / maxCount) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function AgentBreakdown({
  data,
}: {
  data: DashboardData["agentBreakdown"];
}) {
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <CardHeader
        title="Tickets by Agent"
        description="Current workload across support agents."
      />

      {data.length === 0 ? (
        <EmptyChartState message="No agent data available." />
      ) : (
        <div className="space-y-5">
          {data.map((item) => (
            <div key={item.agent.id}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                    {item.agent.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-700">
                      {item.agent.name}
                    </span>

                    <small className="block truncate text-xs text-slate-400">
                      {item.agent.email}
                    </small>
                  </div>
                </div>

                <strong className="shrink-0 text-sm text-slate-950">
                  {item.count}
                </strong>
              </div>

              <div className="ml-11 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{
                    width: `${(item.count / maxCount) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function WeeklyResolution({
  data,
}: {
  data: DashboardData["resolvedPerWeek"];
}) {
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp
                aria-hidden="true"
                className="h-4 w-4"
                strokeWidth={1.8}
              />
            </div>

            <h2 className="text-base font-bold text-slate-950">
              Resolution Trend
            </h2>
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-400">
            Tickets resolved over the last 8 weeks.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          Resolved tickets
        </div>
      </div>

      {data.length === 0 ? (
        <EmptyChartState message="No resolution data available." />
      ) : (
        <div className="relative">
          <div className="pointer-events-none absolute inset-x-0 bottom-8 top-0 flex flex-col justify-between">
            <div className="border-t border-dashed border-slate-100" />
            <div className="border-t border-dashed border-slate-100" />
            <div className="border-t border-dashed border-slate-100" />
            <div className="border-t border-dashed border-slate-100" />
          </div>

          <div className="relative flex h-64 items-end justify-between gap-2 border-b border-slate-200 px-1 sm:gap-4">
            {data.map((week) => {
              const height =
                week.count === 0
                  ? 4
                  : Math.max((week.count / maxCount) * 100, 8);

              const label = new Date(
                week.weekStart
              ).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={week.weekStart}
                  className="group flex h-full flex-1 flex-col items-center justify-end"
                >
                  <div className="relative flex w-full flex-1 items-end justify-center">
                    <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                      {week.count} resolved
                    </div>

                    <div
                      className="w-full max-w-12 rounded-t-lg bg-blue-500 transition-all duration-500 group-hover:bg-blue-600"
                      style={{
                        height: `${height}%`,
                      }}
                    />
                  </div>

                  <div className="mt-3 flex h-5 items-center">
                    <span className="whitespace-nowrap text-[10px] font-medium text-slate-400 sm:text-xs">
                      {label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}

function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <main className="min-h-screen bg-white px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="mb-8">
          <div className="h-3 w-32 rounded bg-slate-100" />
          <div className="mt-3 h-8 w-40 rounded bg-slate-100" />
          <div className="mt-3 h-4 w-80 rounded bg-slate-100" />
        </div>

        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 rounded-2xl border border-slate-200 bg-slate-50"
            />
          ))}
        </div>

        <div className="mb-6 h-80 rounded-2xl border border-slate-200 bg-slate-50" />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-80 rounded-2xl border border-slate-200 bg-slate-50" />
          <div className="h-80 rounded-2xl border border-slate-200 bg-slate-50" />
        </div>
      </div>
    </main>
  );
}

export default function Dashboard() {
  const [dashboard, setDashboard] =
    useState<DashboardData | null>(() => dashboardCache);

  const [loading, setLoading] = useState(
    () => dashboardCache === null
  );

  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async (force = false) => {
    if (dashboardCache && !force) {
      setDashboard(dashboardCache);
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response =
        await api.get<DashboardData>("/dashboard");

      dashboardCache = response.data;

      setDashboard(response.data);
    } catch {
      setError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (dashboardCache) {
      setDashboard(dashboardCache);
      setLoading(false);
      return;
    }

    // This effect intentionally starts the initial request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <main className="min-h-screen bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle
                aria-hidden="true"
                className="h-5 w-5"
                strokeWidth={1.8}
              />
            </div>

            <h1 className="mt-4 text-lg font-bold text-slate-950">
              Unable to load dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!dashboard) {
    return (
      <main className="min-h-screen bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center">
          <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
            <h1 className="text-lg font-bold text-slate-950">
              No dashboard data
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              No dashboard data is currently available.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />

                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Support Operations
                </p>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Overview of your support ticket queue and SLA performance.
              </p>
            </div>

            <div className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:flex">
              <BarChart3
                aria-hidden="true"
                className="h-4 w-4 text-[#173b67]"
                strokeWidth={1.8}
              />

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Current overview
                </p>

                <p className="mt-1 text-xs font-medium text-slate-600">
                  Live support metrics
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Open Tickets"
            value={dashboard.summary.openTickets}
            description="Currently requiring attention"
            type="blue"
          />

          <MetricCard
            label="Pending on Customer"
            value={dashboard.summary.pendingTickets}
            description="Waiting for customer response"
          />

          <MetricCard
            label="Resolved This Week"
            value={dashboard.summary.resolvedThisWeek}
            description="Successfully resolved"
            type="green"
          />

          <MetricCard
            label="SLA Breaches"
            value={dashboard.summary.breachingTickets}
            description="Tickets currently breaching SLA"
            type="danger"
          />
        </section>

        <section className="mb-6">
          <WeeklyResolution data={dashboard.resolvedPerWeek} />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <StatusBreakdown data={dashboard.statusBreakdown} />

          <AgentBreakdown data={dashboard.agentBreakdown} />
        </section>
      </div>
    </main>
  );
}