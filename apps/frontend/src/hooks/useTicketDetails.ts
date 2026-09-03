import { useCallback, useEffect, useState } from "react";
import api from "../lib/api";
import type {
  TicketDetails as TicketDetailsType,
  TicketDetailsResponse,
} from "../types/ticket";

export function useTicketDetails(id?: string) {
  const [ticket, setTicket] =
    useState<TicketDetailsType | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTicket = useCallback(async () => {
    if (!id) {
      setError("Ticket ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await api.get<TicketDetailsResponse>(
          `/tickets/${id}`
        );

      setTicket(response.data.data);
    } catch {
      setError("Unable to load this ticket.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchTicket();
  }, [fetchTicket]);

  return {
    ticket,
    setTicket,
    loading,
    error,
    refetch: fetchTicket,
  };
}