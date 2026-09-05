import { Check, ChevronRight, RotateCcw, Ticket as TicketIcon } from "lucide-react";
import { Link } from "react-router-dom";
import type { Ticket } from "../../types/ticket";
import TicketPriorityBadge from "./TicketPriorityBadge";
import TicketStatusBadge from "./TicketStatusBadge";

type TicketTableProps = {
  tickets: Ticket[];
  archived: boolean;
  loading: boolean;
  error: string;
  selectedTicketIds: string[];
  allCurrentPageSelected: boolean;
  restoringTicketId: string | null;
  onToggleTicketSelection: (ticketId: string) => void;
  onToggleSelectAll: () => void;
  onRestore: (ticketId: string) => void;
};

export default function TicketTable({
  tickets,
  archived,
  loading,
  error,
  selectedTicketIds,
  allCurrentPageSelected,
  restoringTicketId,
  onToggleTicketSelection,
  onToggleSelectAll,
  onRestore,
}: TicketTableProps) {
  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {loading ? (
        <div className="flex min-h-64 items-center justify-center p-8">
          <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#173b67]" />
            Loading tickets...
          </div>
        </div>
      ) : error ? (
        <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
            <TicketIcon className="h-5 w-5 text-red-500" />
          </div>
          <p className="mt-3 text-sm font-semibold text-red-700">
            Unable to load tickets
          </p>
          <p className="mt-1 max-w-md text-sm text-slate-500">{error}</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
            <TicketIcon className="h-6 w-6 text-slate-400" />
          </div>
          <p className="mt-4 font-semibold text-slate-800">No tickets found</p>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Try changing your search or filters to find what you are looking
            for.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-250">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-left">
                <th className="w-14 px-5 py-3.5">
                  <input
                    type="checkbox"
                    checked={allCurrentPageSelected}
                    onChange={onToggleSelectAll}
                    aria-label="Select all tickets on this page"
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-[#173b67] accent-[#173b67] focus:ring-2 focus:ring-[#173b67]/20"
                  />
                </th>

                {[
                  "Ticket",
                  "Requester",
                  "Status",
                  "Priority",
                  "Category",
                  "Assignee",
                  "Updated",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500"
                  >
                    {heading}
                  </th>
                ))}

                {archived && (
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {tickets.map((ticket) => {
                const isSelected = selectedTicketIds.includes(ticket.id);
                const isRestoring = restoringTicketId === ticket.id;

                return (
                  <tr
                    key={ticket.id}
                    className={`group border-b border-slate-100 last:border-b-0 transition-colors ${
                      isSelected
                        ? "bg-blue-50/50"
                        : "hover:bg-slate-50/70"
                    }`}
                  >
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleTicketSelection(ticket.id)}
                        aria-label={`Select ticket ${ticket.subject}`}
                        className="h-4 w-4 cursor-pointer rounded border-slate-300 text-[#173b67] accent-[#173b67] focus:ring-2 focus:ring-[#173b67]/20"
                      />
                    </td>

                    <td className="max-w-xs px-5 py-4">
                      {archived ? (
                        <Link
                          to={`/tickets/${ticket.id}`}
                          className="group/link block"
                        >
                          <div className="flex items-center gap-2">
                            <span className="block truncate font-semibold text-slate-900 transition-colors group-hover/link:text-[#173b67]">
                              {ticket.subject}
                            </span>
                            <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover/link:text-[#173b67]" />
                          </div>
                          <span className="mt-1 block truncate font-mono text-[11px] text-slate-400">
                            {ticket.id}
                          </span>
                        </Link>
                      ) : (
                        <Link
                          to={`/tickets/${ticket.id}`}
                          className="group/link block"
                        >
                          <div className="flex items-center gap-1">
                            <span className="block truncate font-semibold text-slate-900 transition-colors group-hover/link:text-[#173b67]">
                              {ticket.subject}
                            </span>
                            <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 opacity-0 transition-all group-hover/link:translate-x-0.5 group-hover/link:text-[#173b67] group-hover/link:opacity-100" />
                          </div>

                          <span className="mt-1 block truncate font-mono text-[11px] text-slate-400">
                            {ticket.id}
                          </span>
                        </Link>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="max-w-45">
                        <span className="block truncate text-sm font-medium text-slate-700">
                          {ticket.requesterName}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-slate-400">
                          {ticket.requesterEmail}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <TicketStatusBadge status={ticket.status} />
                    </td>

                    <td className="px-5 py-4">
                      <TicketPriorityBadge priority={ticket.priority} />
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex max-w-35 truncate rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {ticket.category}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#173b67]/10 text-xs font-bold text-[#173b67]">
                          {ticket.primaryAssignee?.name
                            ? ticket.primaryAssignee.name
                                .split(" ")
                                .map((part) => part[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()
                            : "—"}
                        </div>

                        <span className="max-w-30 truncate text-sm font-medium text-slate-700">
                          {ticket.primaryAssignee?.name ?? "Unassigned"}
                        </span>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                      {new Date(ticket.updatedAt).toLocaleDateString()}
                    </td>

                    {archived && (
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          disabled={isRestoring}
                          onClick={() => onRestore(ticket.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isRestoring ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
                              Restoring...
                            </>
                          ) : (
                            <>
                              <RotateCcw className="h-4 w-4" />
                              Restore
                            </>
                          )}
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3">
            <p className="text-xs text-slate-400">
              {selectedTicketIds.length > 0 ? (
                <>
                  <span className="font-semibold text-[#173b67]">
                    {selectedTicketIds.length}
                  </span>{" "}
                  ticket{selectedTicketIds.length !== 1 ? "s" : ""} selected
                </>
              ) : (
                "Select tickets to perform bulk actions"
              )}
            </p>

            {allCurrentPageSelected && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#173b67]">
                <Check className="h-3.5 w-3.5" />
                All tickets on this page selected
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}