import { useParams } from "react-router-dom";

import { useTicketDetails } from "../hooks/useTicketDetails";

import TicketHeader from "../components/ticket/TicketHeader";
import TicketMeta from "../components/ticket/TicketMeta";
import TicketRequester from "../components/ticket/TicketRequester";
import TicketDescription from "../components/ticket/TicketDescription";
import TicketReplies from "../components/ticket/TicketReplies";
import TicketHistory from "../components/ticket/TicketHistory";
import TicketReplyForm from "../components/ticket/TicketReplyForm";
import TicketCollaborators from "../components/ticket/TicketCollaborators";

export default function TicketDetails() {
  const { id } = useParams<{ id: string }>();

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