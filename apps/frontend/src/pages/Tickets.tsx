import { Link } from "react-router-dom";

import TicketFilters from "../components/TicketFilters";
import { useTickets } from "../hooks/useTickets";
import type {
  TicketPriority,
  TicketStatus,
} from "../types/ticket";
import { useAgents } from "../hooks/useAgents";

function StatusBadge({ status }: { status: TicketStatus }) {
  const styles: Record<TicketStatus, string> = {
    NEW: "bg-blue-50 text-blue-700",
    OPEN: "bg-green-50 text-green-700",
    PENDING: "bg-amber-50 text-amber-700",
    RESOLVED: "bg-purple-50 text-purple-700",
    CLOSED: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: TicketPriority;
}) {
  const styles: Record<TicketPriority, string> = {
    LOW: "text-slate-500",
    MEDIUM: "text-blue-600",
    HIGH: "text-orange-600",
    URGENT: "text-red-600",
  };

  return (
    <span
      className={`text-sm font-semibold ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}

export default function Tickets() {
  const {
    tickets,
    pagination,
    filters,
    loading,
    error,
    updateFilters,
    setPage,
  } = useTickets();
  const { agents } = useAgents();
  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-6">
        <p className="mb-2 text-xs font-bold tracking-[0.12em] text-slate-500">
          SUPPORT OPERATIONS
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Tickets
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Search, filter, and manage support tickets.
            </p>
          </div>

          <span className="text-sm text-slate-500">
            {pagination.total} total tickets
          </span>
        </div>
      </header>

      <TicketFilters
        filters={filters}
        onChange={updateFilters}
        agents={agents}
      />

      <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading tickets...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-600">
            {error}
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-semibold text-slate-700">
              No tickets found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-225">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Ticket
                  </th>

                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Requester
                  </th>

                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Priority
                  </th>

                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Category
                  </th>

                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Assignee
                  </th>

                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Updated
                  </th>
                </tr>
              </thead>

              <tbody>
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="block max-w-xs"
                      >
                        <span className="block truncate font-semibold text-slate-900 hover:text-slate-600">
                          {ticket.subject}
                        </span>

                        <span className="mt-1 block truncate text-xs text-slate-400">
                          {ticket.id}
                        </span>
                      </Link>
                    </td>

                    <td className="px-5 py-4">
                      <span className="block text-sm font-medium text-slate-700">
                        {ticket.requesterName}
                      </span>

                      <span className="block text-xs text-slate-400">
                        {ticket.requesterEmail}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={ticket.status} />
                    </td>

                    <td className="px-5 py-4">
                      <PriorityBadge
                        priority={ticket.priority}
                      />
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {ticket.category}
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-700">
                        {ticket.primaryAssignee?.name ??
                          "Unassigned"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {new Date(
                        ticket.updatedAt
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Page {pagination.page} of{" "}
            {pagination.totalPages}
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() =>
                setPage(pagination.page - 1)
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={
                pagination.page >= pagination.totalPages
              }
              onClick={() =>
                setPage(pagination.page + 1)
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}