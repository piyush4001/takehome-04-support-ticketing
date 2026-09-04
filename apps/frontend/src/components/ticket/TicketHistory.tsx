import { useState } from "react";
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Clock3,
  UserRound,
} from "lucide-react";
import type { TicketEvent } from "../../types/ticket";

type TicketHistoryProps = {
  events: TicketEvent[];
};

const INITIAL_VISIBLE_EVENTS = 5;

function formatEventType(type: string) {
  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatFieldName(field: string) {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function renderUpdateMetadata(metadata: unknown) {
  if (
    !metadata ||
    typeof metadata !== "object" ||
    Array.isArray(metadata)
  ) {
    return null;
  }

  const changes = metadata as Record<
    string,
    {
      oldValue?: unknown;
      newValue?: unknown;
    }
  >;

  return (
    <div className="mt-3 space-y-2">
      {Object.entries(changes).map(([field, change]) => (
        <div
          key={field}
          className="rounded-lg bg-slate-50 px-3 py-2 text-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {formatFieldName(field)}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
              {String(change.oldValue ?? "—")}
            </span>

            <span className="text-slate-400">→</span>

            <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
              {String(change.newValue ?? "—")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function renderEventValues(event: TicketEvent) {
  if (!event.oldValue && !event.newValue) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
      {event.oldValue && (
        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {event.oldValue}
        </span>
      )}

      {event.oldValue && event.newValue && (
        <span className="text-slate-400">→</span>
      )}

      {event.newValue && (
        <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-[#173b67]">
          {event.newValue}
        </span>
      )}
    </div>
  );
}

export default function TicketHistory({
  events,
}: TicketHistoryProps) {
  const [expanded, setExpanded] = useState(false);

  const sortedEvents = [...events].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );

  const visibleEvents = expanded
    ? sortedEvents
    : sortedEvents.slice(0, INITIAL_VISIBLE_EVENTS);

  const hasMoreEvents =
    sortedEvents.length > INITIAL_VISIBLE_EVENTS;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#173b67]/10">
            <Activity className="h-5 w-5 text-[#173b67]" />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">
              History
            </h2>

            <p className="mt-0.5 text-sm text-slate-500">
              Immutable ticket activity history
            </p>
          </div>
        </div>

        {events.length > 0 && (
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {events.length} event{events.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Empty state */}
      {sortedEvents.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-5 py-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
            <Clock3 className="h-5 w-5 text-slate-400" />
          </div>

          <p className="mt-3 text-sm font-semibold text-slate-700">
            No history available
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Ticket activity will appear here as changes are made.
          </p>
        </div>
      ) : (
        <>
          {/* Timeline */}
          <div className="mt-6">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute bottom-4 left-1.75 top-4 w-px bg-slate-200" />

              <div className="space-y-6">
                {visibleEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className="relative flex gap-4"
                  >
                    {/* Timeline dot */}
                    <div className="relative z-10 mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#173b67] shadow-sm">
                      {index === 0 && (
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </div>

                    {/* Event */}
                    <div
                      className={`min-w-0 flex-1 rounded-xl border p-4 transition ${
                        index === 0
                          ? "border-[#173b67]/20 bg-blue-50/40"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-bold text-slate-900">
                              {formatEventType(event.type)}
                            </p>

                            {index === 0 && (
                              <span className="rounded-full bg-[#173b67] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                                Latest
                              </span>
                            )}
                          </div>

                          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                            <UserRound className="h-3.5 w-3.5" />

                            <span>
                              {event.actor
                                ? `${event.actor.name} (${event.actor.email})`
                                : "System"}
                            </span>
                          </div>
                        </div>

                        <time className="shrink-0 text-xs font-medium text-slate-400">
                          {new Date(
                            event.createdAt
                          ).toLocaleString()}
                        </time>
                      </div>

                      {event.type === "TICKET_UPDATED"
                        ? renderUpdateMetadata(event.metadata)
                        : renderEventValues(event)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Expand / collapse */}
          {hasMoreEvents && (
            <div className="mt-6 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setExpanded((current) => !current)}
                className="mx-auto flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#173b67]/20"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Collapse history
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show all {sortedEvents.length} events
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}