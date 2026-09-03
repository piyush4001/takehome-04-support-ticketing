import type { TicketEvent } from "../../types/ticket";

type TicketHistoryProps = {
  events: TicketEvent[];
};

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
    <div className="mt-2 space-y-1 text-sm text-slate-600">
      {Object.entries(changes).map(
        ([field, change]) => (
          <div key={field}>
            <span className="font-medium text-slate-700">
              {formatFieldName(field)}:
            </span>{" "}
            <span>
              {String(change.oldValue ?? "")}
            </span>
            <span className="mx-2 text-slate-400">
              →
            </span>
            <span>
              {String(change.newValue ?? "")}
            </span>
          </div>
        )
      )}
    </div>
  );
}
export default function TicketHistory({
  events,
}: TicketHistoryProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">
          History
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Immutable ticket activity history
        </p>
      </div>

      <div className="mt-6">
        {events.length === 0 ? (
          <p className="text-sm text-slate-500">
            No history available.
          </p>
        ) : (
          <div className="space-y-5">
            {events.map((event) => (
              <div
                key={event.id}
                className="relative border-l-2 border-slate-200 pl-5"
              >
                <div className="absolute -left-1.75 top-1 h-3 w-3 rounded-full border-2 border-white bg-slate-400" />

                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium text-slate-900">
                      {formatEventType(event.type)}
                    </p>

                    <p className="text-sm text-slate-500">
                      {event.actor
                        ? `${event.actor.name} (${event.actor.email})`
                        : "System"}
                    </p>
                  </div>

                  <span className="text-xs text-slate-500">
                    {new Date(
                      event.createdAt
                    ).toLocaleString()}
                  </span>
                </div>

                {event.type === "TICKET_UPDATED"
  ? renderUpdateMetadata(event.metadata)
  : (event.oldValue || event.newValue) && (
      <div className="mt-2 text-sm text-slate-600">
        {event.oldValue && (
          <span className="font-medium">
            {event.oldValue}
          </span>
        )}

        {event.oldValue &&
          event.newValue && (
            <span className="mx-2 text-slate-400">
              →
            </span>
          )}

        {event.newValue && (
          <span className="font-medium">
            {event.newValue}
          </span>
        )}
      </div>
    )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}