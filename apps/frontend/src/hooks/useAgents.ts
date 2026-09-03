import { useEffect, useState } from "react";

import api from "../lib/api";
import type { AgentsResponse, TicketUser } from "../types/ticket";

export function useAgents() {
  const [agents, setAgents] = useState<TicketUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAgents() {
      try {
        const response =
          await api.get<AgentsResponse>("/users/agents");

        setAgents(response.data.data);
      } catch {
        setError("Unable to load agents.");
      } finally {
        setLoading(false);
      }
    }

    void fetchAgents();
  }, []);

  return {
    agents,
    loading,
    error,
  };
}