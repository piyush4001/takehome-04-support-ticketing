import type { TicketPriority } from "../../types/ticket";

type TicketPriorityBadgeProps = {
  priority: TicketPriority;
};

export default function TicketPriorityBadge({
  priority,
}: TicketPriorityBadgeProps) {
  const styles: Record<TicketPriority, string> = {
    LOW: "text-slate-500",
    MEDIUM: "text-blue-600",
    HIGH: "text-orange-600",
    URGENT: "text-red-600",
  };

  return (
    <span className={`text-sm font-semibold ${styles[priority]}`}>
      {priority}
    </span>
  );
}
