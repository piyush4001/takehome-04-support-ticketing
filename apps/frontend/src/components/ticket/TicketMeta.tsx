import { useState } from "react";
import api from "../../lib/api";
import type {
  TicketDetails as TicketDetailsType,
  TicketDetailsResponse,
} from "../../types/ticket";

type TicketMetaProps = {
  ticket: TicketDetailsType;
  onUpdated: (ticket: TicketDetailsType) => void;
};

export default function TicketMeta({
  ticket,
  onUpdated,
}: TicketMetaProps) {
  const [statusLoading, setStatusLoading] =
    useState(false);

  const [statusError, setStatusError] =
    useState("");

  async function handleStatusChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    try {
      setStatusLoading(true);
      setStatusError("");

      await api.patch(`/tickets/${ticket.id}/status`, {
        status: event.target.value,
      });

      const response =
        await api.get<TicketDetailsResponse>(
          `/tickets/${ticket.id}`
        );

      onUpdated(response.data.data);
    } catch (error: any) {
      setStatusError(
        error?.response?.data?.message ||
          "Unable to update ticket status."
      );
    } finally {
      setStatusLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="ticketStatus"
              className="text-xs font-medium uppercase text-slate-500"
            >
              Status
            </label>

            <select
              id="ticketStatus"
              value={ticket.status}
              onChange={handleStatusChange}
              disabled={statusLoading}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="NEW">NEW</option>
              <option value="OPEN">OPEN</option>
              <option value="PENDING">PENDING</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-slate-500">
              Priority
            </p>

            <p className="mt-1 font-semibold">
              {ticket.priority}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-slate-500">
              Category
            </p>

            <p className="mt-1 font-semibold">
              {ticket.category}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-slate-500">
              Assignee
            </p>

            <p className="mt-1 font-semibold">
              {ticket.primaryAssignee.name}
            </p>
          </div>
        </div>
      </div>

      {statusError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {statusError}
        </div>
      )}
    </div>
  );
}