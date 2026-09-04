import { Mail, UserRound } from "lucide-react";

type TicketRequesterProps = {
  name: string;
  email: string;
};

export default function TicketRequester({
  name,
  email,
}: TicketRequesterProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#173b67]/10 text-[#173b67]">
          <UserRound className="h-5 w-5" />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Requester
          </p>
          <h2 className="text-base font-semibold text-slate-900">
            Contact details
          </h2>
        </div>
      </div>

      <div className="mt-5 rounded-lg bg-slate-50 p-4">
        <p className="font-semibold text-slate-900">{name}</p>

        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
          <Mail className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="break-all">{email}</span>
        </div>
      </div>
    </div>
  );
}