import { FileText } from "lucide-react";

type TicketDescriptionProps = {
  description: string;
};

export default function TicketDescription({
  description,
}: TicketDescriptionProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#173b67]/10">
          <FileText className="h-4 w-4 text-[#173b67]" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Issue description
          </p>

          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}