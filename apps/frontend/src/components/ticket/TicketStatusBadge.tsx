import type { TicketStatus } from "../../types/ticket";

type TicketStatusBadgeProps = {
  status: TicketStatus;
};

export default function TicketStatusBadge({
  status,
}: TicketStatusBadgeProps) {
  const styles: Record<
    TicketStatus,
    { badge: string; dot: string }
  > = {
    NEW: {
      badge: "border-blue-200 bg-blue-50 text-blue-700",
      dot: "bg-blue-500",
    },
    OPEN: {
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
    },
    PENDING: {
      badge: "border-amber-200 bg-amber-50 text-amber-700",
      dot: "bg-amber-500",
    },
    RESOLVED: {
      badge: "border-purple-200 bg-purple-50 text-purple-700",
      dot: "bg-purple-500",
    },
    CLOSED: {
      badge: "border-slate-200 bg-slate-100 text-slate-600",
      dot: "bg-slate-400",
    },
  };

  const statusStyle = styles[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyle.badge}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
        aria-hidden="true"
      />
      {status}
    </span>
  );
}