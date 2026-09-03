import { useState } from "react";
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
  const [replyType, setReplyType] =
    useState<"CUSTOMER_REPLY" | "INTERNAL_NOTE">(
      "CUSTOMER_REPLY"
    );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
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

      const response =
        await api.get<TicketDetailsResponse>(
          `/tickets/${ticketId}`
        );

      onUpdated(response.data.data);

      setReplyBody("");
      setSuccess("Reply added successfully.");
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to add reply."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">
          Add reply
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Add a customer-visible reply or an internal note.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4"
      >
        <div>
          <label
            htmlFor="replyType"
            className="block text-sm font-medium text-slate-700"
          >
            Reply type
          </label>

          <select
            id="replyType"
            value={replyType}
            onChange={(event) =>
              setReplyType(
                event.target.value as
                  | "CUSTOMER_REPLY"
                  | "INTERNAL_NOTE"
              )
            }
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
          >
            <option value="CUSTOMER_REPLY">
              Customer-visible reply
            </option>

            <option value="INTERNAL_NOTE">
              Internal note
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="replyBody"
            className="block text-sm font-medium text-slate-700"
          >
            Message
          </label>

          <textarea
            id="replyBody"
            value={replyBody}
            onChange={(event) =>
              setReplyBody(event.target.value)
            }
            rows={5}
            placeholder="Write your reply..."
            className="mt-1 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !replyBody.trim()}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Sending..." : "Add reply"}
          </button>
        </div>
      </form>
    </div>
  );
}