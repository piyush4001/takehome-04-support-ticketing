import type { TicketUser } from "../../types/ticket";

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
    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {selectedTicketIds.length} ticket{selectedTicketIds.length !== 1 ? "s" : ""} selected
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Choose a bulk action for the selected tickets.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onExportCsv} disabled={exporting} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
          <button type="button" onClick={onOpenBulkReassign} disabled={bulkLoading} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50">
            Bulk Reassign
          </button>
          <button type="button" onClick={onOpenBulkClose} disabled={bulkLoading} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
            Bulk Close
          </button>
          <button type="button" onClick={onClearSelection} disabled={bulkLoading} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50">
            Clear
          </button>
        </div>
      </div>

      {bulkAction === "REASSIGN" && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="bulk-assignee" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Reassign selected tickets to
              </label>
              <select id="bulk-assignee" value={selectedAssigneeId} onChange={(event) => onSelectedAssigneeChange(event.target.value)} disabled={bulkLoading} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-500">
                <option value="">Select an agent</option>
                {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
              </select>
            </div>
            <button type="button" onClick={onBulkReassign} disabled={bulkLoading || !selectedAssigneeId} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
              {bulkLoading ? "Reassigning..." : "Confirm Reassign"}
            </button>
            <button type="button" onClick={onCancelReassign} disabled={bulkLoading} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {bulkAction === "CLOSE" && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Close selected tickets?</p>
              <p className="mt-1 text-xs text-slate-500">Tickets that cannot legally be closed will be refused individually with a reason.</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onBulkClose} disabled={bulkLoading} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
                {bulkLoading ? "Closing..." : "Confirm Close"}
              </button>
              <button type="button" onClick={onCancelClose} disabled={bulkLoading} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {bulkError && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{bulkError}</div>}
      {bulkResults.length > 0 && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-bold text-slate-800">Bulk action results</h3>
          <div className="mt-3 space-y-2">
            {bulkResults.map((result) => (
              <div key={result.ticketId} className={`flex flex-col gap-1 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between ${result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                <span className="text-xs font-medium text-slate-600">{result.ticketId}</span>
                {result.success ? <span className="text-sm font-semibold text-green-700">Successful</span> : <span className="text-sm font-semibold text-red-700">Refused: {result.error || "Unknown reason"}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
