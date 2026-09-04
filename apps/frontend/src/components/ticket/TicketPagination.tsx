import { ChevronLeft, ChevronRight } from "lucide-react";

type TicketPaginationProps = {
  page: number;
  totalPages: number;
  onSetPage: (page: number) => void;
};

export default function TicketPagination({
  page,
  totalPages,
  onSetPage,
}: TicketPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div>
        <p className="text-sm font-medium text-slate-700">
          Page <span className="font-semibold text-[#173b67]">{page}</span>{" "}
          <span className="text-slate-400">of</span>{" "}
          <span className="font-semibold text-[#173b67]">{totalPages}</span>
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onSetPage(page - 1)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onSetPage(page + 1)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#173b67] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#123154] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}