import type { TicketStatus } from "../../types/ticket";

type TicketStatusBadgeProps = {
  status: TicketStatus;
};

export default function TicketStatusBadge({
  status,
}: TicketStatusBadgeProps) {
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
