import {
  AlertCircle,
  BellRing,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Filter,
  Loader2,
  ShieldAlert,
  Timer,
  UserRound,
} from "lucide-react";
import axios from "axios";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAgents } from "../hooks/useAgents";
import { useSlaAlerts } from "../hooks/useSlaAlerts";

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

type AlertFilter = "ALL" | "AT_RISK" | "BREACHED";

export default function SlaAlerts() {
  const { alerts, loading, error, acknowledge } = useSlaAlerts();
  const { agents } = useAgents();

  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(
    null
  );
  const [acknowledgeError, setAcknowledgeError] = useState("");
  const [filter, setFilter] = useState<AlertFilter>("ALL");

  async function handleAcknowledge(alertId: string) {
    try {
      setAcknowledgingId(alertId);
      setAcknowledgeError("");
      await acknowledge(alertId);
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;

      setAcknowledgeError(
        message || "Unable to acknowledge this SLA alert."
      );
    } finally {
      setAcknowledgingId(null);
    }
  }

  const breachedCount = alerts.filter(
    (alert) => alert.type === "BREACHED"
  ).length;

  const atRiskCount = alerts.filter(
    (alert) => alert.type !== "BREACHED"
  ).length;

  const filteredAlerts = useMemo(() => {
    if (filter === "AT_RISK") {
      return alerts.filter((alert) => alert.type !== "BREACHED");
    }

    if (filter === "BREACHED") {
      return alerts.filter((alert) => alert.type === "BREACHED");
    }

    return alerts;
  }, [alerts, filter]);

  function handleFilterChange(nextFilter: AlertFilter) {
    setFilter(nextFilter);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <header>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#173b67]/10 text-[#173b67]">
            <BellRing className="h-6 w-6" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#173b67]">
              Support Operations
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              SLA Alerts
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Tickets approaching or past their first-response target.
            </p>
          </div>
        </div>
      </header>

      {/* Summary / Quick filters */}
      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() =>
              handleFilterChange(
                filter === "AT_RISK" ? "ALL" : "AT_RISK"
              )
            }
            className={`group flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
              filter === "AT_RISK"
                ? "border-amber-300 bg-amber-50 shadow-sm"
                : "border-amber-200 bg-amber-50/60 hover:border-amber-300 hover:shadow-sm"
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <Clock3 className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-2xl font-bold text-slate-900">
                {atRiskCount}
              </p>

              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                At risk
              </p>
            </div>

            <span className="ml-auto text-xs font-semibold text-amber-600 opacity-0 transition-opacity group-hover:opacity-100">
              {filter === "AT_RISK" ? "Clear" : "View"}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleFilterChange(
                filter === "BREACHED" ? "ALL" : "BREACHED"
              )
            }
            className={`group flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
              filter === "BREACHED"
                ? "border-red-300 bg-red-50 shadow-sm"
                : "border-red-200 bg-red-50/60 hover:border-red-300 hover:shadow-sm"
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <ShieldAlert className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-2xl font-bold text-slate-900">
                {breachedCount}
              </p>

              <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                Breached
              </p>
            </div>

            <span className="ml-auto text-xs font-semibold text-red-600 opacity-0 transition-opacity group-hover:opacity-100">
              {filter === "BREACHED" ? "Clear" : "View"}
            </span>
          </button>
        </div>
      )}

      {/* Filter */}
      {!loading && !error && alerts.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />

            <span className="text-sm font-semibold text-slate-700">
              Filter alerts
            </span>
          </div>

          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => handleFilterChange("ALL")}
              className={`rounded-md px-4 py-2 text-xs font-semibold transition ${
                filter === "ALL"
                  ? "bg-white text-[#173b67] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              All
              <span className="ml-1.5 text-slate-400">
                {alerts.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleFilterChange("AT_RISK")}
              className={`rounded-md px-4 py-2 text-xs font-semibold transition ${
                filter === "AT_RISK"
                  ? "bg-white text-amber-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              At risk
              <span className="ml-1.5 text-slate-400">
                {atRiskCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleFilterChange("BREACHED")}
              className={`rounded-md px-4 py-2 text-xs font-semibold transition ${
                filter === "BREACHED"
                  ? "bg-white text-red-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Breached
              <span className="ml-1.5 text-slate-400">
                {breachedCount}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Acknowledge error */}
      {acknowledgeError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

          <p className="text-sm font-medium text-red-700">
            {acknowledgeError}
          </p>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-[#173b67]" />
            Loading SLA alerts...
          </div>
        </div>
      ) : error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

          <div>
            <p className="text-sm font-semibold text-red-800">
              Unable to load SLA alerts
            </p>

            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <h2 className="mt-4 font-semibold text-slate-800">
            No active SLA alerts
          </h2>

          <p className="mt-1 max-w-md text-sm text-slate-500">
            Tickets will appear here when they are at risk of breaching
            or have already breached their response target.
          </p>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <Filter className="h-6 w-6" />
          </div>

          <h2 className="mt-4 font-semibold text-slate-800">
            No {filter === "AT_RISK" ? "at-risk" : "breached"} alerts
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            There are currently no alerts matching this filter.
          </p>

          <button
            type="button"
            onClick={() => handleFilterChange("ALL")}
            className="mt-4 text-sm font-semibold text-[#173b67] hover:underline"
          >
            Show all alerts
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Result count */}
          <div className="flex items-center justify-between px-1">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {filteredAlerts.length}
              </span>{" "}
              {filteredAlerts.length === 1 ? "alert" : "alerts"}
            </p>

            {filter !== "ALL" && (
              <button
                type="button"
                onClick={() => handleFilterChange("ALL")}
                className="text-xs font-semibold text-[#173b67] hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>

          {filteredAlerts.map((alert) => {
            const assignee = agents.find(
              (agent) => agent.id === alert.ticket.primaryAssigneeId
            );

            const isBreached = alert.type === "BREACHED";

            const remainingSeconds =
              alert.ticket.responseTargetSeconds -
              alert.ticket.responseElapsedSeconds;

            const isAcknowledging = acknowledgingId === alert.id;

            return (
              <article
                key={alert.id}
                className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md ${
                  isBreached
                    ? "border-red-200"
                    : "border-amber-200"
                }`}
              >
                {/* Alert indicator */}
                <div
                  className={`h-1 w-full ${
                    isBreached ? "bg-red-500" : "bg-amber-400"
                  }`}
                />

                <div className="p-5 md:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${
                            isBreached
                              ? "border-red-200 bg-red-50 text-red-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {isBreached ? (
                            <ShieldAlert className="h-3.5 w-3.5" />
                          ) : (
                            <Clock3 className="h-3.5 w-3.5" />
                          )}

                          {isBreached ? "BREACHED" : "AT RISK"}
                        </span>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {alert.ticket.priority} priority
                        </span>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {alert.ticket.status}
                        </span>
                      </div>

                      {/* Ticket */}
                      <Link
                        to={`/tickets/${alert.ticket.id}`}
                        className="group mt-3 flex items-center gap-1.5"
                      >
                        <span className="truncate text-lg font-bold text-slate-900 transition-colors group-hover:text-[#173b67]">
                          {alert.ticket.subject}
                        </span>

                        <ExternalLink className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-[#173b67]" />
                      </Link>

                      {/* Metadata */}
                      <dl className="mt-5 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-lg bg-slate-50 p-3">
                          <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                            <UserRound className="h-3.5 w-3.5" />
                            Assignee
                          </dt>

                          <dd className="mt-1.5 truncate text-sm font-semibold text-slate-700">
                            {assignee?.name ?? "Assigned agent"}
                          </dd>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-3">
                          <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                            <Timer className="h-3.5 w-3.5" />
                            Response elapsed
                          </dt>

                          <dd className="mt-1.5 text-sm font-semibold text-slate-700">
                            {formatDuration(
                              alert.ticket.responseElapsedSeconds
                            )}
                          </dd>
                        </div>

                        <div
                          className={`rounded-lg p-3 ${
                            isBreached
                              ? "bg-red-50"
                              : "bg-amber-50"
                          }`}
                        >
                          <dt
                            className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide ${
                              isBreached
                                ? "text-red-500"
                                : "text-amber-600"
                            }`}
                          >
                            <Clock3 className="h-3.5 w-3.5" />
                            Target
                          </dt>

                          <dd
                            className={`mt-1.5 text-sm font-bold ${
                              isBreached
                                ? "text-red-700"
                                : "text-amber-700"
                            }`}
                          >
                            {isBreached
                              ? `${formatDuration(
                                  Math.abs(remainingSeconds)
                                )} overdue`
                              : `${formatDuration(
                                  remainingSeconds
                                )} remaining`}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {/* Action */}
                    <button
                      type="button"
                      onClick={() => handleAcknowledge(alert.id)}
                      disabled={acknowledgingId !== null}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isAcknowledging ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Acknowledging...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Acknowledge
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}