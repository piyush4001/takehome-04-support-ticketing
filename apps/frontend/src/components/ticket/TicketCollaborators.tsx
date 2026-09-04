import { useState } from "react";
import {
  AlertCircle,
  Loader2,
  Plus,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";

import api from "../../lib/api";
import { getApiErrorMessage } from "../../lib/api-error";
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

  const [selectedCollaborator, setSelectedCollaborator] = useState("");
  const [loading, setLoading] = useState(false);
  const [removingUserId, setRemovingUserId] = useState("");
  const [error, setError] = useState("");

  async function refreshTicket() {
    const response = await api.get<TicketDetailsResponse>(
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

      await api.post(`/tickets/${ticket.id}/collaborators`, {
        userId: selectedCollaborator,
      });

      await refreshTicket();
      setSelectedCollaborator("");
    } catch (error: unknown) {
      setError(getApiErrorMessage(error, "Unable to add collaborator."));
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
    } catch (error: unknown) {
      setError(getApiErrorMessage(error, "Unable to remove collaborator."));
    } finally {
      setRemovingUserId("");
    }
  }

  const availableAgents = agents.filter(
    (agent) =>
      agent.id !== ticket.primaryAssigneeId &&
      !ticket.collaborators.some(
        (collaborator) => collaborator.userId === agent.id
      )
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#173b67]/10">
            <UserPlus className="h-5 w-5 text-[#173b67]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Collaborators
              </h2>

              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">
                {ticket.collaborators.length}
              </span>
            </div>

            <p className="mt-0.5 text-sm text-slate-500">
              Agents who can work on this ticket.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {/* Collaborator list */}
        {ticket.collaborators.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-5 py-8 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
              <UserRound className="h-5 w-5 text-slate-400" />
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-700">
              No collaborators yet
            </p>

            <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
              Add an agent below to allow them to work on this ticket.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {ticket.collaborators.map((collaborator) => {
              const isRemoving =
                removingUserId === collaborator.userId;

              return (
                <div
                  key={collaborator.userId}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 transition hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#173b67]/10 text-xs font-bold text-[#173b67]">
                      {collaborator.user?.name
                        ?.split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase() || "A"}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {collaborator.user?.name || "Unknown agent"}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {collaborator.user?.email || "No email available"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(collaborator.userId)}
                    disabled={isRemoving}
                    aria-label={`Remove ${
                      collaborator.user?.name || "collaborator"
                    }`}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isRemoving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}

                    <span className="hidden sm:inline">
                      {isRemoving ? "Removing..." : "Remove"}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Add collaborator */}
        <div className="mt-5 border-t border-slate-100 pt-5">
          <div className="mb-3">
            <p className="text-sm font-bold text-slate-900">
              Add collaborator
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Select an available agent to add to this ticket.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <select
                value={selectedCollaborator}
                onChange={(event) =>
                  setSelectedCollaborator(event.target.value)
                }
                disabled={agentsLoading || loading}
                className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-9 text-sm text-slate-700 shadow-sm outline-none transition hover:border-slate-400 focus:border-[#173b67] focus:ring-2 focus:ring-[#173b67]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
              >
                <option value="">
                  {agentsLoading
                    ? "Loading agents..."
                    : availableAgents.length === 0
                      ? "No available agents"
                      : "Select an agent"}
                </option>

                {availableAgents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} — {agent.email}
                  </option>
                ))}
              </select>

              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                ▾
              </div>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={!selectedCollaborator || loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#173b67] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#123154] focus:outline-none focus:ring-2 focus:ring-[#173b67]/30 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}

              {loading ? "Adding..." : "Add collaborator"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

            <div>
              <p className="text-sm font-semibold text-red-800">
                Action failed
              </p>
              <p className="mt-0.5 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}