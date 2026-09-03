import axios from "axios";
import { Link } from "react-router-dom";
import { useState } from "react";

import { useAgents } from "../hooks/useAgents";
import { useSlaAlerts } from "../hooks/useSlaAlerts";

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export default function SlaAlerts() {
  const { alerts, loading, error, acknowledge } = useSlaAlerts();
  const { agents } = useAgents();
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);
  const [acknowledgeError, setAcknowledgeError] = useState("");

  async function handleAcknowledge(alertId: string) {
    try {
      setAcknowledgingId(alertId);
      setAcknowledgeError("");
      await acknowledge(alertId);
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;

      setAcknowledgeError(message || "Unable to acknowledge this SLA alert.");
    } finally {
      setAcknowledgingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <p className="mb-2 text-xs font-bold tracking-[0.12em] text-slate-500">SUPPORT OPERATIONS</p>
        <h1 className="text-3xl font-bold tracking-tight">SLA Alerts</h1>
        <p className="mt-2 text-sm text-slate-500">Tickets approaching or past their first-response target.</p>
      </header>

      {acknowledgeError && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{acknowledgeError}</div>}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">Loading SLA alerts...</div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : alerts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="font-semibold text-slate-700">No active SLA alerts</p>
          <p className="mt-1 text-sm text-slate-500">Tickets will appear here when they are at risk or breached.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const assignee = agents.find((agent) => agent.id === alert.ticket.primaryAssigneeId);
            const isBreached = alert.type === "BREACHED";
            const remainingSeconds = alert.ticket.responseTargetSeconds - alert.ticket.responseElapsedSeconds;

            return (
              <article key={alert.id} className={`rounded-xl border bg-white p-5 shadow-sm ${isBreached ? "border-red-200" : "border-amber-200"}`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${isBreached ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                        {isBreached ? "BREACHED" : "AT RISK"}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{alert.ticket.priority} priority</span>
                      <span className="text-xs font-semibold text-slate-500">{alert.ticket.status}</span>
                    </div>

                    <Link to={`/tickets/${alert.ticket.id}`} className="mt-3 block truncate text-lg font-bold text-slate-900 hover:text-slate-600">
                      {alert.ticket.subject}
                    </Link>

                    <dl className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                      <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Assignee</dt><dd>{assignee?.name ?? "Assigned agent"}</dd></div>
                      <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Response elapsed</dt><dd>{formatDuration(alert.ticket.responseElapsedSeconds)}</dd></div>
                      <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Target</dt><dd>{isBreached ? `${formatDuration(Math.abs(remainingSeconds))} overdue` : `${formatDuration(remainingSeconds)} remaining`}</dd></div>
                    </dl>
                  </div>

                  <button type="button" onClick={() => handleAcknowledge(alert.id)} disabled={acknowledgingId !== null} className="shrink-0 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                    {acknowledgingId === alert.id ? "Acknowledging..." : "Acknowledge"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
