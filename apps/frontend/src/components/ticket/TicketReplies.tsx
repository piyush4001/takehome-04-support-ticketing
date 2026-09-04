import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Clock3,
  MessageSquare,
  StickyNote,
  UserRound,
} from "lucide-react";
import type { TicketReply } from "../../types/ticket";

type TicketRepliesProps = {
  replies: TicketReply[];
};

const INITIAL_VISIBLE_REPLIES = 5;

export default function TicketReplies({
  replies,
}: TicketRepliesProps) {
  const [expanded, setExpanded] = useState(false);

  const sortedReplies = [...replies].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );

  const visibleReplies = expanded
    ? sortedReplies
    : sortedReplies.slice(0, INITIAL_VISIBLE_REPLIES);

  const hasMoreReplies =
    sortedReplies.length > INITIAL_VISIBLE_REPLIES;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#173b67]/10">
            <MessageSquare className="h-5 w-5 text-[#173b67]" />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">
              Replies
            </h2>

            <p className="mt-0.5 text-sm text-slate-500">
              Conversation history for this ticket
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {replies.length}{" "}
          {replies.length === 1 ? "reply" : "replies"}
        </span>
      </div>

      {/* Empty state */}
      {sortedReplies.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-5 py-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
            <Clock3 className="h-5 w-5 text-slate-400" />
          </div>

          <p className="mt-3 text-sm font-semibold text-slate-700">
            No replies yet
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Replies and internal notes will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Replies */}
          <div className="mt-6 space-y-4">
            {visibleReplies.map((reply, index) => {
              const isInternalNote =
                reply.type === "INTERNAL_NOTE";

              return (
                <article
                  key={reply.id}
                  className={`rounded-xl border p-4 transition ${
                    isInternalNote
                      ? "border-amber-200 bg-amber-50/40"
                      : index === 0
                        ? "border-[#173b67]/20 bg-blue-50/30"
                        : "border-slate-200 bg-white"
                  }`}
                >
                  {/* Reply header */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isInternalNote
                            ? "bg-amber-100 text-amber-700"
                            : "bg-[#173b67]/10 text-[#173b67]"
                        }`}
                      >
                        {reply.author.name
                          ?.split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase() || "U"}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {reply.author.name}
                          </p>

                          {index === 0 && (
                            <span className="rounded-full bg-[#173b67] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                              Latest
                            </span>
                          )}
                        </div>

                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                          <UserRound className="h-3.5 w-3.5" />

                          <span className="truncate">
                            {reply.author.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Type + time */}
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          isInternalNote
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {isInternalNote ? (
                          <StickyNote className="h-3 w-3" />
                        ) : (
                          <MessageSquare className="h-3 w-3" />
                        )}

                        {isInternalNote
                          ? "Internal note"
                          : "Customer-visible"}
                      </span>

                      <time className="text-xs font-medium text-slate-400">
                        {new Date(
                          reply.createdAt
                        ).toLocaleString()}
                      </time>
                    </div>
                  </div>

                  {/* Reply body */}
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                      {reply.body}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Expand / Collapse */}
          {hasMoreReplies && (
            <div className="mt-6 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setExpanded((current) => !current)}
                className="mx-auto flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#173b67]/20"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Collapse replies
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show all {sortedReplies.length} replies
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}