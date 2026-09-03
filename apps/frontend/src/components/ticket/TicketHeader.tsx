import { Link } from "react-router-dom";

type TicketHeaderProps = {
  subject: string;
};

export default function TicketHeader({
  subject,
}: TicketHeaderProps) {
  return (
    <div>
      <Link
        to="/tickets"
        className="text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← Back to tickets
      </Link>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Ticket
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          {subject}
        </h1>
      </div>
    </div>
  );
}