import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Save, X } from "lucide-react";
import api from "../../lib/api";
import { getApiErrorMessage } from "../../lib/api-error";
import type {
  TicketDetails as TicketDetailsType,
  TicketDetailsResponse,
  TicketPriority,
} from "../../types/ticket";

type EditTicketFormProps = {
  ticket: TicketDetailsType;
  onUpdated: (ticket: TicketDetailsType) => void;
  onCancel: () => void;
};

const priorities: TicketPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

export default function EditTicketForm({
  ticket,
  onUpdated,
  onCancel,
}: EditTicketFormProps) {
  const [subject, setSubject] = useState(ticket.subject);
  const [description, setDescription] = useState(ticket.description);
  const [requesterName, setRequesterName] = useState(ticket.requesterName);
  const [requesterEmail, setRequesterEmail] = useState(ticket.requesterEmail);
  const [priority, setPriority] = useState<TicketPriority>(ticket.priority);
  const [category, setCategory] = useState(ticket.category);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // This effect intentionally mirrors the current ticket into the editable form.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSubject(ticket.subject);
    setDescription(ticket.description);
    setRequesterName(ticket.requesterName);
    setRequesterEmail(ticket.requesterEmail);
    setPriority(ticket.priority);
    setCategory(ticket.category);
  }, [ticket]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      await api.patch(`/tickets/${ticket.id}`, {
        subject: subject.trim(),
        description: description.trim(),
        requesterName: requesterName.trim(),
        requesterEmail: requesterEmail.trim(),
        priority,
        category: category.trim(),
      });

      const response = await api.get<TicketDetailsResponse>(
        `/tickets/${ticket.id}`
      );

      onUpdated(response.data.data);
      onCancel();
    } catch (error: unknown) {
      setError(getApiErrorMessage(error, "Unable to update ticket."));
    } finally {
      setLoading(false);
    }
  }

  const inputClassName =
    "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#173b67] focus:ring-2 focus:ring-[#173b67]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

  const labelClassName =
    "block text-sm font-semibold text-slate-700";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#173b67]/10">
            <Save className="h-5 w-5 text-[#173b67]" />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">
              Edit ticket
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Update the ticket information below.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-7 p-5 sm:p-6">
          {/* Ticket details */}
          <section>
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Ticket details
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Update the subject, description, priority and category.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="edit-subject" className={labelClassName}>
                  Subject
                </label>

                <input
                  id="edit-subject"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  required
                  maxLength={200}
                  placeholder="Enter ticket subject"
                  className={inputClassName}
                  disabled={loading}
                />

                <div className="mt-1.5 flex justify-end">
                  <span className="text-xs text-slate-400">
                    {subject.length}/200
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="edit-description"
                  className={labelClassName}
                >
                  Description
                </label>

                <textarea
                  id="edit-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  required
                  rows={7}
                  placeholder="Describe the issue..."
                  className={`${inputClassName} resize-y leading-6`}
                  disabled={loading}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="edit-priority" className={labelClassName}>
                    Priority
                  </label>

                  <select
                    id="edit-priority"
                    value={priority}
                    onChange={(event) =>
                      setPriority(event.target.value as TicketPriority)
                    }
                    className={inputClassName}
                    disabled={loading}
                  >
                    {priorities.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-category" className={labelClassName}>
                    Category
                  </label>

                  <input
                    id="edit-category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    required
                    placeholder="e.g. Billing, Technical"
                    className={inputClassName}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Requester */}
          <section className="border-t border-slate-100 pt-7">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Requester information
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Update the customer's contact information.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="edit-requester-name"
                  className={labelClassName}
                >
                  Requester name
                </label>

                <input
                  id="edit-requester-name"
                  value={requesterName}
                  onChange={(event) => setRequesterName(event.target.value)}
                  required
                  placeholder="Customer name"
                  className={inputClassName}
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="edit-requester-email"
                  className={labelClassName}
                >
                  Requester email
                </label>

                <input
                  id="edit-requester-email"
                  type="email"
                  value={requesterEmail}
                  onChange={(event) => setRequesterEmail(event.target.value)}
                  required
                  placeholder="customer@example.com"
                  className={inputClassName}
                  disabled={loading}
                />
              </div>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5"
            >
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-red-800">
                  Update failed
                </p>
                <p className="mt-0.5 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              loading ||
              !subject.trim() ||
              !description.trim() ||
              !requesterName.trim() ||
              !requesterEmail.trim() ||
              !category.trim()
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#173b67] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#123154] focus:outline-none focus:ring-2 focus:ring-[#173b67]/30 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}