import { useState } from "react";
import api from "../../lib/api";
import { useAgents } from "../../hooks/useAgents";
import type {
  TicketDetails as TicketDetailsType,
  TicketDetailsResponse,
} from "../../types/ticket";

type TicketCollaboratorsProps = {
  ticket: TicketDetailsType;
  onUpdated: (ticket: TicketDetailsType) => void;
};

export default function TicketCollaborators({
  ticket,
  onUpdated,
}: TicketCollaboratorsProps) {
  const { agents, loading: agentsLoading } = useAgents();

  const [selectedCollaborator, setSelectedCollaborator] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [removingUserId, setRemovingUserId] =
    useState("");

  const [error, setError] = useState("");

  async function refreshTicket() {
    const response =
      await api.get<TicketDetailsResponse>(
        `/tickets/${ticket.id}`
      );

    onUpdated(response.data.data);
  }

  async function handleAdd() {
    if (!selectedCollaborator) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post(
        `/tickets/${ticket.id}/collaborators`,
        {
          userId: selectedCollaborator,
        }
      );

      await refreshTicket();

      setSelectedCollaborator("");
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to add collaborator."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(userId: string) {
    try {
      setRemovingUserId(userId);
      setError("");

      await api.delete(
        `/tickets/${ticket.id}/collaborators/${userId}`
      );

      await refreshTicket();
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to remove collaborator."
      );
    } finally {
      setRemovingUserId("");
    }
  }

  const availableAgents = agents.filter(
    (agent) =>
      agent.id !== ticket.primaryAssigneeId &&
      !ticket.collaborators.some(
        (collaborator) =>
          collaborator.userId === agent.id
      )
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">
          Collaborators
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Agents who can work on this ticket.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {ticket.collaborators.length === 0 ? (
          <p className="text-sm text-slate-500">
            No collaborators assigned.
          </p>
        ) : (
          ticket.collaborators.map((collaborator) => (
            <div
              key={collaborator.userId}
              className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
            >
              <div>
                <p className="font-medium text-slate-900">
                  {collaborator.user?.name}
                </p>

                <p className="text-sm text-slate-500">
                  {collaborator.user?.email}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleRemove(collaborator.userId)
                }
                disabled={
                  removingUserId === collaborator.userId
                }
                className="text-sm font-semibold text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {removingUserId === collaborator.userId
                  ? "Removing..."
                  : "Remove"}
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <select
          value={selectedCollaborator}
          onChange={(event) =>
            setSelectedCollaborator(event.target.value)
          }
          disabled={agentsLoading || loading}
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">
            {agentsLoading
              ? "Loading agents..."
              : "Select an agent"}
          </option>

          {availableAgents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name} — {agent.email}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!selectedCollaborator || loading}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add collaborator"}
        </button>
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}