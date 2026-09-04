import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Send,
  StickyNote,
} from "lucide-react";

import api from "../../lib/api";
import type {
  TicketDetails as TicketDetailsType,
  TicketDetailsResponse,
} from "../../types/ticket";

type TicketReplyFormProps = {
  ticketId: string;
  onUpdated: (ticket: TicketDetailsType) => void;
};

export default function TicketReplyForm({
  ticketId,
  onUpdated,
}: TicketReplyFormProps) {
  const [replyBody, setReplyBody] = useState("");
  const [replyType, setReplyType] = useState<
    "CUSTOMER_REPLY" | "INTERNAL_NOTE"
  >("CUSTOMER_REPLY");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!replyBody.trim()) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await api.post(`/tickets/${ticketId}/replies`, {
        body: replyBody.trim(),
        type: replyType,
      });

      const response = await api.get<TicketDetailsResponse>(
        `/tickets/${ticketId}`
      );

      onUpdated(response.data.data);

      setReplyBody("");
      setSuccess("Reply added successfully.");
    } catch (error: any) {
      setError(
        error?.response?.data?.message || "Unable to add reply."
      );
    } finally {
      setLoading(false);
    }
  }

  const isInternalNote = replyType === "INTERNAL_NOTE";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isInternalNote
                ? "bg-amber-100"
                : "bg-[#173b67]/10"
            }`}
          >
            {isInternalNote ? (
              <StickyNote className="h-5 w-5 text-amber-700" />
            ) : (
              <MessageSquare className="h-5 w-5 text-[#173b67]" />
            )}
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">
              Add reply
            </h2>

            <p className="mt-0.5 text-sm text-slate-500">
              Add a customer-visible reply or an internal note.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-5 p-5 sm:p-6">
          {/* Reply type */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Reply type
            </label>

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setReplyType("CUSTOMER_REPLY")}
                disabled={loading}
                className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                  replyType === "CUSTOMER_REPLY"
                    ? "border-[#173b67]/30 bg-blue-50/50 ring-1 ring-[#173b67]/10"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    replyType === "CUSTOMER_REPLY"
                      ? "bg-[#173b67]/10"
                      : "bg-slate-100"
                  }`}
                >
                  <MessageSquare
                    className={`h-4 w-4 ${
                      replyType === "CUSTOMER_REPLY"
                        ? "text-[#173b67]"
                        : "text-slate-500"
                    }`}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Customer-visible
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    Visible to the customer.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setReplyType("INTERNAL_NOTE")}
                disabled={loading}
                className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                  replyType === "INTERNAL_NOTE"
                    ? "border-amber-300 bg-amber-50/60 ring-1 ring-amber-200"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    replyType === "INTERNAL_NOTE"
                      ? "bg-amber-100"
                      : "bg-slate-100"
                  }`}
                >
                  <StickyNote
                    className={`h-4 w-4 ${
                      replyType === "INTERNAL_NOTE"
                        ? "text-amber-700"
                        : "text-slate-500"
                    }`}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Internal note
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    Only visible to support agents.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Message */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="replyBody"
                className="text-sm font-semibold text-slate-700"
              >
                Message
              </label>

              <span className="text-xs text-slate-400">
                {replyBody.length} characters
              </span>
            </div>

            <textarea
              id="replyBody"
              value={replyBody}
              onChange={(event) => setReplyBody(event.target.value)}
              rows={6}
              placeholder={
                isInternalNote
                  ? "Write an internal note for the support team..."
                  : "Write your reply to the customer..."
              }
              disabled={loading}
              className={`w-full resize-y rounded-xl border px-4 py-3 text-sm leading-7 text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 ${
                isInternalNote
                  ? "border-amber-200 bg-amber-50/20 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10"
                  : "border-slate-300 bg-white focus:border-[#173b67] focus:ring-2 focus:ring-[#173b67]/10"
              } disabled:cursor-not-allowed disabled:bg-slate-50`}
            />

            <p className="mt-1.5 text-xs text-slate-400">
              {isInternalNote
                ? "This note will not be visible to the customer."
                : "This message will be visible to the customer."}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <div>
                <p className="text-sm font-semibold text-red-800">
                  Unable to add reply
                </p>
                <p className="mt-0.5 text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Success */}
          {success && (
            <div
              role="status"
              className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  Reply added
                </p>
                <p className="mt-0.5 text-sm text-emerald-700">
                  {success}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:px-6">
          <button
            type="submit"
            disabled={loading || !replyBody.trim()}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${
              isInternalNote
                ? "bg-amber-700 hover:bg-amber-800 focus:ring-amber-500/30"
                : "bg-[#173b67] hover:bg-[#123154] focus:ring-[#173b67]/30"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {isInternalNote ? "Add internal note" : "Send reply"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}