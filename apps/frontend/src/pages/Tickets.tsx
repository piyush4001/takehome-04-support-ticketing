import { useState } from "react";
import {
  Archive,
  ChevronRight,
  Download,
  Plus,
  RefreshCw,
  Ticket as TicketIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import TicketBulkActions, {
  type BulkResult,
} from "../components/ticket/TicketBulkActions";
import TicketFilters from "../components/ticket/TicketFilters";
import TicketPagination from "../components/ticket/TicketPagination";
import TicketTable from "../components/ticket/TicketTable";
import { useAgents } from "../hooks/useAgents";
import { useTickets } from "../hooks/useTickets";
import api from "../lib/api";
import { useAuth } from "../auth/useAuth";

function getErrorMessage(error: unknown, fallback: string) {
  return (
    (error as { response?: { data?: { message?: string } } }).response?.data
      ?.message || fallback
  );
}

export default function Tickets() {
  const { user } = useAuth();

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
  const [restoreError, setRestoreError] = useState("");

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<
    "REASSIGN" | "CLOSE" | null
  >(null);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState("");
  const [bulkResults, setBulkResults] = useState<BulkResult[]>([]);

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
        {
          responseType: "blob",
        }
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

    const currentPageIds = tickets.map((ticket) => ticket.id);

    const allSelected =
      currentPageIds.length > 0 &&
      currentPageIds.every((id) => selectedTicketIds.includes(id));

    setSelectedTicketIds((current) =>
      allSelected
        ? current.filter((id) => !currentPageIds.includes(id))
        : [
            ...current,
            ...currentPageIds.filter((id) => !current.includes(id)),
          ]
    );
  }

  const allCurrentPageSelected =
    tickets.length > 0 &&
    tickets.every((ticket) => selectedTicketIds.includes(ticket.id));

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

      const response = await api.post("/tickets/bulk/reassign", {
        ticketIds: selectedTicketIds,
        assigneeId: selectedAssigneeId,
      });

      const results: BulkResult[] =
        response.data?.data?.results ?? [];

      setBulkResults(results);

      const successfulIds = results
        .filter((result) => result.success)
        .map((result) => result.ticketId);

      setSelectedTicketIds((current) =>
        current.filter((id) => !successfulIds.includes(id))
      );

      await refetch();
    } catch (error) {
      setBulkError(
        getErrorMessage(
          error,
          "Unable to bulk reassign tickets."
        )
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

    if (
      !window.confirm(
        `Are you sure you want to close ${
          selectedTicketIds.length
        } selected ticket${
          selectedTicketIds.length !== 1 ? "s" : ""
        }?`
      )
    ) {
      return;
    }

    try {
      setBulkLoading(true);
      setBulkError("");
      setBulkResults([]);

      const response = await api.post("/tickets/bulk/close", {
        ticketIds: selectedTicketIds,
      });

      const results: BulkResult[] =
        response.data?.data?.results ?? [];

      setBulkResults(results);

      const successfulIds = results
        .filter((result) => result.success)
        .map((result) => result.ticketId);

      setSelectedTicketIds((current) =>
        current.filter((id) => !successfulIds.includes(id))
      );

      await refetch();
    } catch (error) {
      setBulkError(
        getErrorMessage(
          error,
          "Unable to bulk close tickets."
        )
      );
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleRestore(ticketId: string) {
    if (
      !window.confirm(
        "Are you sure you want to restore this ticket?"
      )
    ) {
      return;
    }

    try {
      setRestoringTicketId(ticketId);
      setRestoreError("");

      await api.patch(`/tickets/${ticketId}/restore`);

      await refetch();
    } catch (error) {
      setRestoreError(
        getErrorMessage(
          error,
          "Unable to restore ticket."
        )
      );
    } finally {
      setRestoringTicketId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page Header */}
      <header className="mb-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />

              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Support Operations
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <TicketIcon
                  aria-hidden="true"
                  className="h-5 w-5"
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                  Tickets
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Search, filter, and manage support tickets.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 sm:flex">
              <span className="text-sm font-bold text-slate-900">
                {pagination.total}
              </span>

              <span className="text-xs text-slate-500">
                total tickets
              </span>
            </div>

            <Link
              to="/tickets/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0b1f3a] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#102c52] hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              <Plus
                aria-hidden="true"
                className="h-4 w-4"
                strokeWidth={2}
              />

              <span>Create Ticket</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <TicketFilters
          filters={filters}
          onChange={updateFilters}
          agents={agents}
        />
      </section>

      {/* Export Error */}
      {exportError && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
          <span>{exportError}</span>
        </div>
      )}

      {/* Bulk Actions */}
      <div className="mt-4">
        <TicketBulkActions
          selectedTicketIds={selectedTicketIds}
          bulkAction={bulkAction}
          selectedAssigneeId={selectedAssigneeId}
          bulkLoading={bulkLoading}
          bulkError={bulkError}
          bulkResults={bulkResults}
          exporting={exporting}
          agents={agents}
          canReassign={user?.role === "SUPERVISOR"}
          onExportCsv={handleExportCsv}
          onOpenBulkReassign={openBulkReassign}
          onOpenBulkClose={openBulkClose}
          onClearSelection={clearSelection}
          onSelectedAssigneeChange={setSelectedAssigneeId}
          onBulkReassign={handleBulkReassign}
          onBulkClose={handleBulkClose}
          onCancelReassign={() => {
            setBulkAction(null);
            setSelectedAssigneeId("");
          }}
          onCancelClose={() => setBulkAction(null)}
        />
      </div>

      {/* Restore Error */}
      {restoreError && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <Archive
            aria-hidden="true"
            className="h-4 w-4 shrink-0"
            strokeWidth={1.8}
          />

          <span>{restoreError}</span>
        </div>
      )}

      {/* Ticket Table */}
      <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <TicketTable
          tickets={tickets}
          archived={filters.archived}
          loading={loading}
          error={error}
          selectedTicketIds={selectedTicketIds}
          allCurrentPageSelected={allCurrentPageSelected}
          restoringTicketId={restoringTicketId}
          onToggleTicketSelection={toggleTicketSelection}
          onToggleSelectAll={toggleSelectAll}
          onRestore={handleRestore}
        />
      </section>

      {/* Pagination */}
      <div className="mt-5 flex items-center justify-between">
        <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
          <span>
            Showing current page of
          </span>

          <span className="font-semibold text-slate-600">
            {pagination.total}
          </span>

          <span>tickets</span>
        </div>

        <div className="ml-auto">
          <TicketPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onSetPage={setPage}
          />
        </div>
      </div>
    </div>
  );
}