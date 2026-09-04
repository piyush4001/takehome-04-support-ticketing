import { ArrowLeft, Ticket as TicketIcon } from "lucide-react";
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
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#173b67]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tickets
      </Link>

      <div className="mt-5 flex items-start gap-3">
        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#173b67]/10">
          <TicketIcon className="h-5 w-5 text-[#173b67]" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-[#173b67]">
            Ticket
          </p>

          <h1 className="mt-1 text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
            {subject}
          </h1>
        </div>
      </div>
    </div>
  );
}