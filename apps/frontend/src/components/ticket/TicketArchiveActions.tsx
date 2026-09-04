import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Archive, AlertCircle, Loader2 } from "lucide-react";
import api from "../../lib/api";
import { getApiErrorMessage } from "../../lib/api-error";

type TicketArchiveActionsProps = {
  ticketId: string;
};

export default function TicketArchiveActions({
  ticketId,
}: TicketArchiveActionsProps) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleArchive() {
    const confirmed = window.confirm(
      "Are you sure you want to archive this ticket?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.patch(`/tickets/${ticketId}/archive`);

      navigate("/tickets");
    } catch (error: unknown) {
      setError(getApiErrorMessage(error, "Unable to archive ticket."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleArchive}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition hover:border-red-300 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Archiving...
          </>
        ) : (
          <>
            <Archive className="h-4 w-4" />
            Archive ticket
          </>
        )}
      </button>

      {error && (
        <div className="flex max-w-xs items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-left">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <p className="text-xs font-medium leading-5 text-red-700">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}