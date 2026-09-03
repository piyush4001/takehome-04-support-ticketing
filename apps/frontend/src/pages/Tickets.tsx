import { useState } from "react";
import { Link } from "react-router-dom";
import TicketFilters from "../components/ticket/TicketFilters";
import { useTickets } from "../hooks/useTickets";
import type {
  TicketPriority,
  TicketStatus,
} from "../types/ticket";
import { useAgents } from "../hooks/useAgents";
import api from "../lib/api";

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

type BulkResult = {
  ticketId: string;
  success: boolean;
  error?: string;
};

export default function Tickets() {
  const {
    tickets,
    pagination,
    filters,
    loading,
    error,
    updateFilters,
    setPage,
    refetch,
  } = useTickets();

  const { agents } = useAgents();

  const [restoringTicketId, setRestoringTicketId] =
    useState<string | null>(null);

  const [restoreError, setRestoreError] =
    useState("");

  const [exporting, setExporting] = useState(false);

  const [exportError, setExportError] = useState("");

  const [selectedTicketIds, setSelectedTicketIds] =
    useState<string[]>([]);

  const [bulkAction, setBulkAction] = useState<
    "REASSIGN" | "CLOSE" | null
  >(null);

  const [selectedAssigneeId, setSelectedAssigneeId] =
    useState("");

  const [bulkLoading, setBulkLoading] =
    useState(false);

  const [bulkError, setBulkError] =
    useState("");

  const [bulkResults, setBulkResults] =
    useState<BulkResult[]>([]);

  async function handleExportCsv() {
    try {
      setExporting(true);
      setExportError("");

      const params = new URLSearchParams({
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        archived: String(filters.archived),
      });

      if (filters.search.trim()) {
        params.set("search", filters.search.trim());
      }

      if (filters.status) {
        params.set("status", filters.status);
      }

      if (filters.priority) {
        params.set("priority", filters.priority);
      }

      if (filters.category) {
        params.set("category", filters.category);
      }

      if (filters.assigneeId) {
        params.set("assigneeId", filters.assigneeId);
      }

      const response = await api.get(
        `/tickets/export/csv?${params.toString()}`,
        { responseType: "blob" }
      );

      const disposition = response.headers["content-disposition"];
      const filename =
        disposition?.match(/filename="?([^";]+)"?/i)?.[1] ??
        "tickets.csv";
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setExportError("Unable to export the current ticket queue.");
    } finally {
      setExporting(false);
    }
  }

  function toggleTicketSelection(ticketId: string) {
  setBulkResults([]);
  setBulkError("");

  setSelectedTicketIds((current) =>
    current.includes(ticketId)
      ? current.filter((id) => id !== ticketId)
      : [...current, ticketId]
  );
}

 function toggleSelectAll() {
  setBulkResults([]);
  setBulkError("");

  const currentPageIds = tickets.map(
    (ticket) => ticket.id
  );

  const allSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) =>
      selectedTicketIds.includes(id)
    );

  if (allSelected) {
    setSelectedTicketIds((current) =>
      current.filter(
        (id) => !currentPageIds.includes(id)
      )
    );
  } else {
    setSelectedTicketIds((current) => [
      ...current,
      ...currentPageIds.filter(
        (id) => !current.includes(id)
      ),
    ]);
  }
}

  const allCurrentPageSelected =
    tickets.length > 0 &&
    tickets.every((ticket) =>
      selectedTicketIds.includes(ticket.id)
    );

  function clearSelection() {
  setSelectedTicketIds([]);
  setBulkAction(null);
  setSelectedAssigneeId("");
  setBulkResults([]);
  setBulkError("");
}

  function openBulkReassign() {
    setBulkError("");
    setBulkResults([]);
    setSelectedAssigneeId("");
    setBulkAction("REASSIGN");
  }

  function openBulkClose() {
    setBulkError("");
    setBulkResults([]);
    setBulkAction("CLOSE");
  }

  async function handleBulkReassign() {
    if (!selectedAssigneeId) {
      setBulkError("Please select an agent.");
      return;
    }

    if (selectedTicketIds.length === 0) {
      setBulkError("Please select at least one ticket.");
      return;
    }

    try {
      setBulkLoading(true);
      setBulkError("");
      setBulkResults([]);

      const response = await api.post(
        "/tickets/bulk/reassign",
        {
          ticketIds: selectedTicketIds,
          assigneeId: selectedAssigneeId,
        }
      );

      const results: BulkResult[] =
        response.data?.data?.results ?? [];

      setBulkResults(results);

      const successfulIds = results
        .filter((result) => result.success)
        .map((result) => result.ticketId);

      setSelectedTicketIds((current) =>
        current.filter(
          (id) => !successfulIds.includes(id)
        )
      );

      await refetch();
    } catch (error: any) {
      setBulkError(
        error?.response?.data?.message ||
          "Unable to bulk reassign tickets."
      );
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleBulkClose() {
    if (selectedTicketIds.length === 0) {
      setBulkError("Please select at least one ticket.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to close ${selectedTicketIds.length} selected ticket${
        selectedTicketIds.length !== 1 ? "s" : ""
      }?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setBulkLoading(true);
      setBulkError("");
      setBulkResults([]);

      const response = await api.post(
        "/tickets/bulk/close",
        {
          ticketIds: selectedTicketIds,
        }
      );

      const results: BulkResult[] =
        response.data?.data?.results ?? [];

      setBulkResults(results);

      const successfulIds = results
        .filter((result) => result.success)
        .map((result) => result.ticketId);

      setSelectedTicketIds((current) =>
        current.filter(
          (id) => !successfulIds.includes(id)
        )
      );

      await refetch();
    } catch (error: any) {
      setBulkError(
        error?.response?.data?.message ||
          "Unable to bulk close tickets."
      );
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleRestore(ticketId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to restore this ticket?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setRestoringTicketId(ticketId);
      setRestoreError("");

      await api.patch(
        `/tickets/${ticketId}/restore`
      );

      await refetch();
    } catch (error: any) {
      setRestoreError(
        error?.response?.data?.message ||
          "Unable to restore ticket."
      );
    } finally {
      setRestoringTicketId(null);
    }
  }

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

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              {pagination.total} total tickets
            </span>

            

            <Link
              to="/tickets/new"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Create Ticket
            </Link>
          </div>
        </div>
      </header>

      <TicketFilters
        filters={filters}
        onChange={updateFilters}
        agents={agents}
      />

      {exportError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {exportError}
        </div>
      )}

      {selectedTicketIds.length > 0 && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {selectedTicketIds.length} ticket
                {selectedTicketIds.length !== 1
                  ? "s"
                  : ""}{" "}
                selected
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Choose a bulk action for the selected
                tickets.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
                <button
              type="button"
              onClick={handleExportCsv}
              disabled={exporting}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
              <button
                type="button"
                onClick={openBulkReassign}
                disabled={bulkLoading}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Bulk Reassign
              </button>

              <button
                type="button"
                onClick={openBulkClose}
                disabled={bulkLoading}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Bulk Close
              </button>
                
              <button
                type="button"
                onClick={clearSelection}
                disabled={bulkLoading}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear
              </button>
              
            </div>
          </div>

          {bulkAction === "REASSIGN" && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label
                    htmlFor="bulk-assignee"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    Reassign selected tickets to
                  </label>

                  <select
                    id="bulk-assignee"
                    value={selectedAssigneeId}
                    onChange={(event) =>
                      setSelectedAssigneeId(
                        event.target.value
                      )
                    }
                    disabled={bulkLoading}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-500"
                  >
                    <option value="">
                      Select an agent
                    </option>

                    {agents.map((agent) => (
                      <option
                        key={agent.id}
                        value={agent.id}
                      >
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleBulkReassign}
                  disabled={
                    bulkLoading ||
                    !selectedAssigneeId
                  }
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {bulkLoading
                    ? "Reassigning..."
                    : "Confirm Reassign"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBulkAction(null);
                    setSelectedAssigneeId("");
                  }}
                  disabled={bulkLoading}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {bulkAction === "CLOSE" && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Close selected tickets?
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Tickets that cannot legally be closed
                    will be refused individually with a
                    reason.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleBulkClose}
                    disabled={bulkLoading}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {bulkLoading
                      ? "Closing..."
                      : "Confirm Close"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setBulkAction(null)
                    }
                    disabled={bulkLoading}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {bulkError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {bulkError}
            </div>
          )}

          {bulkResults.length > 0 && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-bold text-slate-800">
                Bulk action results
              </h3>

              <div className="mt-3 space-y-2">
                {bulkResults.map((result) => (
                  <div
                    key={result.ticketId}
                    className={`flex flex-col gap-1 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between ${
                      result.success
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <span className="text-xs font-medium text-slate-600">
                      {result.ticketId}
                    </span>

                    {result.success ? (
                      <span className="text-sm font-semibold text-green-700">
                        Successful
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-red-700">
                        Refused:{" "}
                        {result.error ||
                          "Unknown reason"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {restoreError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {restoreError}
        </div>
      )}

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
                  <th className="w-12 px-5 py-3">
                    <input
                      type="checkbox"
                      checked={allCurrentPageSelected}
                      onChange={toggleSelectAll}
                      aria-label="Select all tickets on this page"
                      className="h-4 w-4 rounded border-slate-300"
                    />
                  </th>

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

                  {filters.archived && (
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
                        checked={selectedTicketIds.includes(
                          ticket.id
                        )}
                        onChange={() =>
                          toggleTicketSelection(
                            ticket.id
                          )
                        }
                        aria-label={`Select ticket ${ticket.subject}`}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                    </td>

                    <td className="px-5 py-4">
                      {filters.archived ? (
                        <div className="block max-w-xs">
                          <span className="block truncate font-semibold text-slate-900">
                            {ticket.subject}
                          </span>

                          <span className="mt-1 block truncate text-xs text-slate-400">
                            {ticket.id}
                          </span>
                        </div>
                      ) : (
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

                    <td className="px-5 py-4">
                      <StatusBadge
                        status={ticket.status}
                      />
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

                    {filters.archived && (
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          disabled={
                            restoringTicketId ===
                            ticket.id
                          }
                          onClick={() =>
                            handleRestore(ticket.id)
                          }
                          className="rounded-lg border border-green-200 bg-white px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {restoringTicketId ===
                          ticket.id
                            ? "Restoring..."
                            : "Restore"}
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
                pagination.page >=
                pagination.totalPages
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
