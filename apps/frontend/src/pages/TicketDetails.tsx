import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  AlertCircle,
  Edit3,
  Loader2,
  Pencil,
  Ticket as TicketIcon,
} from "lucide-react";

import { useTicketDetails } from "../hooks/useTicketDetails";

import TicketHeader from "../components/ticket/TicketHeader";
import TicketMeta from "../components/ticket/TicketMeta";
import TicketRequester from "../components/ticket/TicketRequester";
import TicketDescription from "../components/ticket/TicketDescription";
import TicketReplies from "../components/ticket/TicketReplies";
import TicketHistory from "../components/ticket/TicketHistory";
import TicketReplyForm from "../components/ticket/TicketReplyForm";
import TicketCollaborators from "../components/ticket/TicketCollaborators";
import EditTicketForm from "../components/ticket/EditTicketForm";
import TicketArchiveActions from "../components/ticket/TicketArchiveActions";

export default function TicketDetails() {
  const { id } = useParams<{ id: string }>();
  const [editing, setEditing] = useState(false);

  const { ticket, setTicket, loading, error } = useTicketDetails(id);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#173b67]/10">
            <Loader2 className="h-6 w-6 animate-spin text-[#173b67]" />
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">
              Loading ticket
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Fetching ticket details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="mx-auto max-w-7xl space-y-5">
        <TicketHeader subject="Ticket not found" />

        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>

          <div>
            <p className="text-sm font-semibold text-red-800">
              Unable to load ticket
            </p>

            <p className="mt-1 text-sm text-red-700">
              {error || "Ticket not found."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* =========================================================
          TICKET HEADER
      ========================================================== */}
      <header className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm lg:px-8">
        <div className="flex flex-col gap-5">
          <TicketHeader subject={ticket.subject} />

          <div className="flex flex-wrap items-center justify-end gap-2">
            {!editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50"
              >
                <Pencil className="h-4 w-4" />
                Edit ticket
              </button>
            )}

            <TicketArchiveActions ticketId={ticket.id} />
          </div>
        </div>
      </header>

      {/* =========================================================
          EDIT TICKET
      ========================================================== */}
      {editing && (
        <section className="rounded-2xl border border-blue-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 rounded-t-2xl bg-blue-50/40 px-6 py-4 lg:px-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
              <Edit3 className="h-4 w-4 text-[#173b67]" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Edit ticket
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Update the ticket information below.
              </p>
            </div>
          </div>

          <div className="p-6 lg:p-8">
            <EditTicketForm
              ticket={ticket}
              onUpdated={setTicket}
              onCancel={() => setEditing(false)}
            />
          </div>
        </section>
      )}

      {/* =========================================================
          MAIN WORKSPACE
      ========================================================== */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* =======================================================
            MAIN CONTENT
        ======================================================== */}
        <main className="min-w-0 space-y-6">
          {/* Description */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#173b67]/10">
                <TicketIcon className="h-4 w-4 text-[#173b67]" />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Description
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Original issue submitted by the requester.
                </p>
              </div>
            </div>

            <TicketDescription description={ticket.description} />
          </section>

          {/* Conversation */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="px-6 pt-6 lg:px-7 lg:pt-7">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#173b67]/10">
                  <TicketIcon className="h-4 w-4 text-[#173b67]" />
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Conversation
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Replies and internal notes for this ticket.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 pt-5 lg:px-7 lg:pb-7">
              <TicketReplies replies={ticket.replies} />
            </div>

            <div className="bg-slate-50/70 px-6 py-6 lg:px-7 lg:py-7">
              <TicketReplyForm
                ticketId={ticket.id}
                onUpdated={setTicket}
              />
            </div>
          </section>

          {/* Activity history */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#173b67]/10">
                <TicketIcon className="h-4 w-4 text-[#173b67]" />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Activity history
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  A chronological record of changes made to this ticket.
                </p>
              </div>
            </div>

            <TicketHistory events={ticket.events} />
          </section>
        </main>

        {/* =======================================================
            SIDEBAR
        ======================================================== */}
        <aside
          className="
            min-w-0
            lg:sticky
            lg:top-6
            lg:max-h-[calc(100vh-3rem)]
            lg:overflow-y-auto
            lg:pr-1
            lg:scrollbar-thin
          "
        >
          <div className="space-y-5">
            {/* Ticket information */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5">
                <h2 className="text-base font-bold text-slate-900">
                  Ticket information
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Status, priority and assignment.
                </p>
              </div>

              <TicketMeta
                ticket={ticket}
                onUpdated={setTicket}
              />
            </section>

            {/* Requester */}
            <TicketRequester
              name={ticket.requesterName}
              email={ticket.requesterEmail}
            />

            {/* Collaborators */}
            <TicketCollaborators
              ticket={ticket}
              onUpdated={setTicket}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}