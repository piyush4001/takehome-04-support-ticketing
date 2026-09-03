import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

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
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to archive ticket."
      );
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
        className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Archiving..." : "Archive ticket"}
      </button>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}