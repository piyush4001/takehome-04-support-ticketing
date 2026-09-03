import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAgents } from "../hooks/useAgents";
import type { TicketPriority } from "../types/ticket";

const priorities: TicketPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

export default function CreateTicket() {
  const navigate = useNavigate();
  const { agents, loading: agentsLoading } = useAgents();

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [requesterEmail, setRequesterEmail] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");
  const [category, setCategory] = useState("");
  const [primaryAssigneeId, setPrimaryAssigneeId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!primaryAssigneeId) {
      setError("Please select a primary assignee.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/tickets", {
        subject: subject.trim(),
        description: description.trim(),
        requesterName: requesterName.trim(),
        requesterEmail: requesterEmail.trim(),
        priority,
        category: category.trim(),
        primaryAssigneeId,
      });

      const createdTicket = response.data.data;

      navigate(`/tickets/${createdTicket.id}`);
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to create ticket."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Create Ticket
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Create a new support ticket and assign it to an agent.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Subject
          </label>
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            placeholder="Unable to access account"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
            rows={6}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            placeholder="Describe the customer's issue..."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Requester Name
            </label>
            <input
              value={requesterName}
              onChange={(event) =>
                setRequesterName(event.target.value)
              }
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Requester Email
            </label>
            <input
              type="email"
              value={requesterEmail}
              onChange={(event) =>
                setRequesterEmail(event.target.value)
              }
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Priority
            </label>
            <select
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as TicketPriority)
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              {priorities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Category
            </label>
            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Billing"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Primary Assignee
          </label>

          <select
            value={primaryAssigneeId}
            onChange={(event) =>
              setPrimaryAssigneeId(event.target.value)
            }
            required
            disabled={agentsLoading}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="">
              {agentsLoading
                ? "Loading agents..."
                : "Select an agent"}
            </option>

            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name} ({agent.email})
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/tickets")}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}