import { useParams } from "react-router-dom";
import { useState } from "react";
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
 const {
  ticket,
  setTicket,
  loading,
  error,
} = useTicketDetails(id);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading ticket...
        </p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="space-y-4">
        <TicketHeader subject="Ticket not found" />
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error || "Ticket not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TicketHeader subject={ticket.subject} />
      <div className="flex justify-end">
        <TicketArchiveActions ticketId={ticket.id} />
      </div>
        <div className="flex justify-end">
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Edit ticket
          </button>
        )}
      </div>

      {editing && (
        <EditTicketForm
          ticket={ticket}
          onUpdated={setTicket}
          onCancel={() => setEditing(false)}
        />
      )}
      <TicketMeta
        ticket={ticket}
        onUpdated={setTicket}
      />

      <TicketRequester
        name={ticket.requesterName}
        email={ticket.requesterEmail}
      />

      <TicketCollaborators
        ticket={ticket}
        onUpdated={setTicket}
      />

      <TicketDescription
        description={ticket.description}
      />

      <TicketReplies
        replies={ticket.replies}
      />

      <TicketHistory
        events={ticket.events}
      />
      <TicketReplyForm
      ticketId={ticket.id}
      onUpdated={setTicket}
    />
    </div>
  );
}