import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ClipboardPlus,
  FileText,
  Loader2,
  Mail,
  Tag,
  UserRound,
  UserRoundCheck,
} from "lucide-react";
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

const priorityStyles: Record<TicketPriority, string> = {
  LOW: "border-slate-200 bg-slate-50 text-slate-600",
  MEDIUM: "border-blue-200 bg-blue-50 text-blue-700",
  HIGH: "border-orange-200 bg-orange-50 text-orange-700",
  URGENT: "border-red-200 bg-red-50 text-red-700",
};

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
        error?.response?.data?.message || "Unable to create ticket."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page header */}
      <div>
        <button
          type="button"
          onClick={() => navigate("/tickets")}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-[#173b67]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to tickets
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#173b67]/10 text-[#173b67]">
            <ClipboardPlus className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Create Ticket
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Create a new support ticket and assign it to an agent.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 border-b border-red-200 bg-red-50 px-6 py-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-semibold text-red-800">
                Unable to create ticket
              </p>
              <p className="mt-0.5 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-8 p-6 md:p-8">
          {/* Ticket details */}
          <section>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <FileText className="h-4.5 w-4.5" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Ticket details
                </h2>
                <p className="text-xs text-slate-500">
                  Describe the issue and categorize the request.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Subject */}
              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Subject <span className="text-red-500">*</span>
                </label>

                <input
                  id="subject"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#173b67] focus:ring-4 focus:ring-[#173b67]/10"
                  placeholder="Unable to access account"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Description <span className="text-red-500">*</span>
                </label>

                <textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  required
                  rows={7}
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#173b67] focus:ring-4 focus:ring-[#173b67]/10"
                  placeholder="Describe the customer's issue, including any relevant details..."
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Include enough detail for the assigned agent to understand
                  and resolve the issue.
                </p>
              </div>

              {/* Priority + Category */}
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="priority"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Priority <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <select
                      id="priority"
                      value={priority}
                      onChange={(event) =>
                        setPriority(event.target.value as TicketPriority)
                      }
                      className={`w-full appearance-none rounded-xl border px-4 py-3 pr-10 text-sm font-semibold outline-none transition-all focus:border-[#173b67] focus:ring-4 focus:ring-[#173b67]/10 ${priorityStyles[priority]}`}
                    >
                      {priorities.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>

                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                      <Tag className="h-4 w-4 text-current opacity-60" />
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Category <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#173b67] focus:ring-4 focus:ring-[#173b67]/10"
                    placeholder="Billing"
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="border-t border-slate-100" />

          {/* Requester information */}
          <section>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <UserRound className="h-4.5 w-4.5" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Requester information
                </h2>
                <p className="text-xs text-slate-500">
                  Enter the customer's contact details.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="requesterName"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Requester Name <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="requesterName"
                    value={requesterName}
                    onChange={(event) =>
                      setRequesterName(event.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#173b67] focus:ring-4 focus:ring-[#173b67]/10"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="requesterEmail"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Requester Email <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="requesterEmail"
                    type="email"
                    value={requesterEmail}
                    onChange={(event) =>
                      setRequesterEmail(event.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#173b67] focus:ring-4 focus:ring-[#173b67]/10"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="border-t border-slate-100" />

          {/* Assignment */}
          <section>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <UserRoundCheck className="h-4.5 w-4.5" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Assignment
                </h2>
                <p className="text-xs text-slate-500">
                  Choose the primary agent responsible for this ticket.
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="primaryAssignee"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Primary Assignee <span className="text-red-500">*</span>
              </label>

              <select
                id="primaryAssignee"
                value={primaryAssigneeId}
                onChange={(event) =>
                  setPrimaryAssigneeId(event.target.value)
                }
                required
                disabled={agentsLoading}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#173b67] focus:ring-4 focus:ring-[#173b67]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">
                  {agentsLoading ? "Loading agents..." : "Select an agent"}
                </option>

                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.email})
                  </option>
                ))}
              </select>
            </div>
          </section>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end md:px-8">
          <button
            type="button"
            onClick={() => navigate("/tickets")}
            disabled={loading}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#173b67] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#123154] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Create Ticket
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}