import { useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  Loader2,
  Tag,
  UserRound,
} from "lucide-react";

import api from "../../lib/api";
import type {
  TicketDetails as TicketDetailsType,
  TicketDetailsResponse,
} from "../../types/ticket";

type TicketMetaProps = {
  ticket: TicketDetailsType;
  onUpdated: (ticket: TicketDetailsType) => void;
};

const statusOptions = [
  "NEW",
  "OPEN",
  "PENDING",
  "RESOLVED",
  "CLOSED",
] as const;

function getStatusStyles(status: string) {
  switch (status) {
    case "NEW":
      return {
        badge: "bg-slate-100 text-slate-700",
        dot: "bg-slate-500",
      };
    case "OPEN":
      return {
        badge: "bg-blue-100 text-blue-700",
        dot: "bg-blue-500",
      };
    case "PENDING":
      return {
        badge: "bg-amber-100 text-amber-800",
        dot: "bg-amber-500",
      };
    case "RESOLVED":
      return {
        badge: "bg-emerald-100 text-emerald-700",
        dot: "bg-emerald-500",
      };
    case "CLOSED":
      return {
        badge: "bg-slate-200 text-slate-700",
        dot: "bg-slate-600",
      };
    default:
      return {
        badge: "bg-slate-100 text-slate-700",
        dot: "bg-slate-400",
      };
  }
}

function getPriorityStyles(priority: string) {
  switch (priority) {
    case "URGENT":
      return "bg-red-100 text-red-700";
    case "HIGH":
      return "bg-orange-100 text-orange-700";
    case "MEDIUM":
      return "bg-amber-100 text-amber-700";
    case "LOW":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function TicketMeta({
  ticket,
  onUpdated,
}: TicketMetaProps) {
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState("");

  async function handleStatusChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    try {
      setStatusLoading(true);
      setStatusError("");

      await api.patch(`/tickets/${ticket.id}/status`, {
        status: event.target.value,
      });

      const response = await api.get<TicketDetailsResponse>(
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

  const statusStyles = getStatusStyles(ticket.status);

  const assigneeInitials =
    ticket.primaryAssignee.name
      ?.split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "A";

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <div className="flex items-center justify-between">
          <label
            htmlFor="ticketStatus"
            className="text-[11px] font-bold uppercase tracking-wider text-slate-400"
          >
            Status
          </label>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${statusStyles.badge}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${statusStyles.dot}`}
            />
            {ticket.status}
          </span>
        </div>

        <div className="relative mt-3">
          <select
            id="ticketStatus"
            value={ticket.status}
            onChange={handleStatusChange}
            disabled={statusLoading}
            className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-9 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-400 focus:border-[#173b67] focus:ring-2 focus:ring-[#173b67]/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {statusLoading ? (
            <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#173b67]" />
          ) : (
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          )}
        </div>
      </div>

      {/* Priority + Category */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Priority
            </p>

            <Tag className="h-3.5 w-3.5 shrink-0 text-slate-300" />
          </div>

          <span
            className={`mt-3 inline-flex max-w-full truncate rounded-full px-2.5 py-1 text-xs font-bold ${getPriorityStyles(
              ticket.priority
            )}`}
          >
            {ticket.priority}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Category
            </p>

            <Tag className="h-3.5 w-3.5 shrink-0 text-slate-300" />
          </div>

          <p
            title={ticket.category}
            className="mt-3 truncate text-sm font-semibold text-slate-900"
          >
            {ticket.category}
          </p>
        </div>
      </div>

      {/* Assignee */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Primary assignee
          </p>

          <UserRound className="h-3.5 w-3.5 text-slate-300" />
        </div>

        <div className="mt-3 flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#173b67]/10 text-xs font-bold text-[#173b67]">
            {assigneeInitials}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {ticket.primaryAssignee.name}
            </p>

            <p className="truncate text-xs text-slate-400">
              Primary owner
            </p>
          </div>
        </div>
      </div>

      {/* Status error */}
      {statusError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

          <div className="min-w-0">
            <p className="text-sm font-semibold text-red-800">
              Unable to update status
            </p>

            <p className="mt-0.5 text-sm leading-5 text-red-700">
              {statusError}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}