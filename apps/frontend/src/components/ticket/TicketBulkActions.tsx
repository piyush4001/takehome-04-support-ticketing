import type { TicketUser } from "../../types/ticket";
import {
  AlertCircle,
  Archive,
  CheckCircle2,
  ChevronDown,
  Download,
  Loader2,
  RotateCcw,
  UserRound,
  X,
} from "lucide-react";

export type BulkResult = {
  ticketId: string;
  success: boolean;
  error?: string;
};

type TicketBulkActionsProps = {
  selectedTicketIds: string[];
  bulkAction: "REASSIGN" | "CLOSE" | null;
  selectedAssigneeId: string;
  bulkLoading: boolean;
  bulkError: string;
  bulkResults: BulkResult[];
  exporting: boolean;
  agents: TicketUser[];
  canReassign: boolean;
  onExportCsv: () => void;
  onOpenBulkReassign: () => void;
  onOpenBulkClose: () => void;
  onClearSelection: () => void;
  onSelectedAssigneeChange: (assigneeId: string) => void;
  onBulkReassign: () => void;
  onBulkClose: () => void;
  onCancelReassign: () => void;
  onCancelClose: () => void;
};

export default function TicketBulkActions({
  selectedTicketIds,
  bulkAction,
  selectedAssigneeId,
  bulkLoading,
  bulkError,
  bulkResults,
  exporting,
  agents,
  canReassign,
  onExportCsv,
  onOpenBulkReassign,
  onOpenBulkClose,
  onClearSelection,
  onSelectedAssigneeChange,
  onBulkReassign,
  onBulkClose,
  onCancelReassign,
  onCancelClose,
}: TicketBulkActionsProps) {
  if (selectedTicketIds.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Selection header */}
      <div className="bg-slate-50/70 p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#173b67]/10">
              <Archive className="h-5 w-5 text-[#173b67]" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                {selectedTicketIds.length} ticket
                {selectedTicketIds.length !== 1 ? "s" : ""} selected
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Choose an action to apply to the selected tickets.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Export */}
            <button
              type="button"
              onClick={onExportCsv}
              disabled={exporting}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#173b67]/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {exporting ? "Exporting..." : "Export CSV"}
            </button>

            {/* Reassign */}
            {canReassign && (
              <button
                type="button"
                onClick={onOpenBulkReassign}
                disabled={bulkLoading}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#173b67]/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <UserRound className="h-4 w-4" />
                Bulk Reassign
              </button>
            )}

            {/* Close */}
            <button
              type="button"
              onClick={onOpenBulkClose}
              disabled={bulkLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#173b67] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#123154] focus:outline-none focus:ring-2 focus:ring-[#173b67]/30 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              Bulk Close
            </button>

            {/* Clear */}
            <button
              type="button"
              onClick={onClearSelection}
              disabled={bulkLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Reassign panel */}
      {bulkAction === "REASSIGN" && (
        <div className="border-t border-slate-200 bg-white p-4 sm:p-5">
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <UserRound className="h-4 w-4 text-[#173b67]" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Reassign tickets
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Select an agent who should become the primary assignee.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="bulk-assignee"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Assign to
                </label>

                <div className="relative">
                  <select
                    id="bulk-assignee"
                    value={selectedAssigneeId}
                    onChange={(event) =>
                      onSelectedAssigneeChange(event.target.value)
                    }
                    disabled={bulkLoading}
                    className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-700 shadow-sm outline-none transition hover:border-slate-400 focus:border-[#173b67] focus:ring-2 focus:ring-[#173b67]/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  >
                    <option value="">Select an agent</option>

                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onBulkReassign}
                  disabled={bulkLoading || !selectedAssigneeId}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#173b67] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#123154] focus:outline-none focus:ring-2 focus:ring-[#173b67]/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {bulkLoading && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {bulkLoading ? "Reassigning..." : "Confirm Reassign"}
                </button>

                <button
                  type="button"
                  onClick={onCancelReassign}
                  disabled={bulkLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close confirmation */}
      {bulkAction === "CLOSE" && (
        <div className="border-t border-slate-200 bg-white p-4 sm:p-5">
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                  <CheckCircle2 className="h-4 w-4 text-amber-700" />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Close selected tickets?
                  </p>
                  <p className="mt-1 max-w-xl text-xs leading-5 text-slate-600">
                    Tickets that cannot legally be closed will be refused
                    individually with a reason.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={onBulkClose}
                  disabled={bulkLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#173b67] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#123154] focus:outline-none focus:ring-2 focus:ring-[#173b67]/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {bulkLoading && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {bulkLoading ? "Closing..." : "Confirm Close"}
                </button>

                <button
                  type="button"
                  onClick={onCancelClose}
                  disabled={bulkLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* General error */}
      {bulkError && (
        <div className="border-t border-red-100 bg-red-50/50 p-4 sm:p-5">
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <div>
              <p className="text-sm font-bold text-red-800">
                Bulk action failed
              </p>
              <p className="mt-0.5 text-sm text-red-700">{bulkError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {bulkResults.length > 0 && (
        <div className="border-t border-slate-200 bg-slate-50/40 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Bulk action results
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Each selected ticket was processed independently.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {bulkResults.length} result
              {bulkResults.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="space-y-2">
            {bulkResults.map((result) => (
              <div
                key={result.ticketId}
                className={`flex flex-col gap-2 rounded-xl border p-3.5 sm:flex-row sm:items-center sm:justify-between ${
                  result.success
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      result.success ? "bg-emerald-100" : "bg-red-100"
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>

                  <span className="truncate font-mono text-xs font-medium text-slate-600">
                    {result.ticketId}
                  </span>
                </div>

                {result.success ? (
                  <span className="text-sm font-semibold text-emerald-700">
                    Successful
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-red-700">
                    Refused: {result.error || "Unknown reason"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}