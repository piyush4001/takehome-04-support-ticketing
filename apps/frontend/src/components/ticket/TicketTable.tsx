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
    <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {loading ? (
        <div className="p-8 text-center text-sm text-slate-500">
          Loading tickets...
        </div>
      ) : error ? (
        <div className="p-8 text-center text-sm text-red-600">{error}</div>
      ) : tickets.length === 0 ? (
        <div className="p-8 text-center">
          <p className="font-semibold text-slate-700">No tickets found</p>
          <p className="mt-1 text-sm text-slate-500">
            Try changing your search or filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-225">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="w-12 px-5 py-3">
                  <input
                    type="checkbox"
                    checked={allCurrentPageSelected}
                    onChange={onToggleSelectAll}
                    aria-label="Select all tickets on this page"
                    className="h-4 w-4 rounded border-slate-300"
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
                    className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
                {archived && (
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <input
                      type="checkbox"
                      checked={selectedTicketIds.includes(ticket.id)}
                      onChange={() => onToggleTicketSelection(ticket.id)}
                      aria-label={`Select ticket ${ticket.subject}`}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                  </td>
                  <td className="px-5 py-4">
                    {archived ? (
                      <div className="block max-w-xs">
                        <span className="block truncate font-semibold text-slate-900">
                          {ticket.subject}
                        </span>
                        <span className="mt-1 block truncate text-xs text-slate-400">
                          {ticket.id}
                        </span>
                      </div>
                    ) : (
                      <Link to={`/tickets/${ticket.id}`} className="block max-w-xs">
                        <span className="block truncate font-semibold text-slate-900 hover:text-slate-600">
                          {ticket.subject}
                        </span>
                        <span className="mt-1 block truncate text-xs text-slate-400">
                          {ticket.id}
                        </span>
                      </Link>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="block text-sm font-medium text-slate-700">
                      {ticket.requesterName}
                    </span>
                    <span className="block text-xs text-slate-400">
                      {ticket.requesterEmail}
                    </span>
                  </td>
                  <td className="px-5 py-4"><TicketStatusBadge status={ticket.status} /></td>
                  <td className="px-5 py-4"><TicketPriorityBadge priority={ticket.priority} /></td>
                  <td className="px-5 py-4 text-sm text-slate-600">{ticket.category}</td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-slate-700">
                      {ticket.primaryAssignee?.name ?? "Unassigned"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">
                    {new Date(ticket.updatedAt).toLocaleDateString()}
                  </td>
                  {archived && (
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        disabled={restoringTicketId === ticket.id}
                        onClick={() => onRestore(ticket.id)}
                        className="rounded-lg border border-green-200 bg-white px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {restoringTicketId === ticket.id ? "Restoring..." : "Restore"}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
