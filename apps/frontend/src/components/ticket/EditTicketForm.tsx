import { useEffect, useState } from "react";
import api from "../../lib/api";
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
  const [description, setDescription] =
    useState(ticket.description);
  const [requesterName, setRequesterName] =
    useState(ticket.requesterName);
  const [requesterEmail, setRequesterEmail] =
    useState(ticket.requesterEmail);
  const [priority, setPriority] =
    useState<TicketPriority>(ticket.priority);
  const [category, setCategory] =
    useState(ticket.category);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setSubject(ticket.subject);
    setDescription(ticket.description);
    setRequesterName(ticket.requesterName);
    setRequesterEmail(ticket.requesterEmail);
    setPriority(ticket.priority);
    setCategory(ticket.category);
  }, [ticket]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
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

      const response =
        await api.get<TicketDetailsResponse>(
          `/tickets/${ticket.id}`
        );

      onUpdated(response.data.data);
      onCancel();
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to update ticket."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">
          Edit ticket
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Update the ticket information.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4"
      >
        <div>
          <label
            htmlFor="edit-subject"
            className="block text-sm font-medium text-slate-700"
          >
            Subject
          </label>

          <input
            id="edit-subject"
            value={subject}
            onChange={(event) =>
              setSubject(event.target.value)
            }
            required
            maxLength={200}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label
            htmlFor="edit-description"
            className="block text-sm font-medium text-slate-700"
          >
            Description
          </label>

          <textarea
            id="edit-description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            required
            rows={6}
            className="mt-1 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="edit-requester-name"
              className="block text-sm font-medium text-slate-700"
            >
              Requester name
            </label>

            <input
              id="edit-requester-name"
              value={requesterName}
              onChange={(event) =>
                setRequesterName(event.target.value)
              }
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="edit-requester-email"
              className="block text-sm font-medium text-slate-700"
            >
              Requester email
            </label>

            <input
              id="edit-requester-email"
              type="email"
              value={requesterEmail}
              onChange={(event) =>
                setRequesterEmail(event.target.value)
              }
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="edit-priority"
              className="block text-sm font-medium text-slate-700"
            >
              Priority
            </label>

            <select
              id="edit-priority"
              value={priority}
              onChange={(event) =>
                setPriority(
                  event.target.value as TicketPriority
                )
              }
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
            >
              {priorities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="edit-category"
              className="block text-sm font-medium text-slate-700"
            >
              Category
            </label>

            <input
              id="edit-category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
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
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}