import type { TicketPriority } from "../../types/ticket";

type TicketPriorityBadgeProps = {
  priority: TicketPriority;
};

export default function TicketPriorityBadge({
  priority,
}: TicketPriorityBadgeProps) {
  const styles: Record<
    TicketPriority,
    { badge: string; dot: string }
  > = {
    LOW: {
      badge: "border-slate-200 bg-slate-50 text-slate-600",
      dot: "bg-slate-400",
    },
    MEDIUM: {
      badge: "border-blue-200 bg-blue-50 text-blue-700",
      dot: "bg-blue-500",
    },
    HIGH: {
      badge: "border-orange-200 bg-orange-50 text-orange-700",
      dot: "bg-orange-500",
    },
    URGENT: {
      badge: "border-red-200 bg-red-50 text-red-700",
      dot: "bg-red-500",
    },
  };

  const priorityStyle = styles[priority];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityStyle.badge}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${priorityStyle.dot}`}
        aria-hidden="true"
      />
      {priority}
    </span>
  );
}