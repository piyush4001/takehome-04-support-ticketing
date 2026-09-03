import type { TicketReply } from "../../types/ticket";

type TicketRepliesProps = {
  replies: TicketReply[];
};

export default function TicketReplies({
  replies,
}: TicketRepliesProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Replies
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Conversation history for this ticket
          </p>
        </div>

        <span className="text-sm text-slate-500">
          {replies.length}{" "}
          {replies.length === 1 ? "reply" : "replies"}
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {replies.length === 0 ? (
          <p className="text-sm text-slate-500">
            No replies yet.
          </p>
        ) : (
          replies.map((reply) => (
            <div
              key={reply.id}
              className="rounded-lg border border-slate-200 p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium text-slate-900">
                    {reply.author.name}
                  </p>

                  <p className="text-xs text-slate-500">
                    {reply.author.email}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      reply.type === "INTERNAL_NOTE"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {reply.type === "INTERNAL_NOTE"
                      ? "Internal note"
                      : "Customer-visible"}
                  </span>

                  <span className="text-xs text-slate-500">
                    {new Date(
                      reply.createdAt
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {reply.body}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}