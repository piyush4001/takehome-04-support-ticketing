import { useCallback, useEffect, useState } from "react";

import api from "../lib/api";
import type {
  Ticket,
  TicketListResponse,
  TicketPriority,
  TicketStatus,
} from "../types/ticket";

export type TicketFilters = {
  search: string;
  status: TicketStatus | "";
  priority: TicketPriority | "";
  category: string;
  assigneeId: string;
  sortBy: "createdAt" | "priority" | "updatedAt";
  sortOrder: "asc" | "desc";
  page: number;
  pageSize: number;
};

const DEFAULT_FILTERS: TicketFilters = {
  search: "",
  status: "",
  priority: "",
  category: "",
  assigneeId: "",
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  pageSize: 5,
};

export function useTickets(initialFilters?: Partial<TicketFilters>) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pagination, setPagination] =
    useState<TicketListResponse["data"]["pagination"]>({
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
    });

  const [filters, setFilters] = useState<TicketFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      params.set("page", String(filters.page));
      params.set("pageSize", String(filters.pageSize));
      params.set("sortBy", filters.sortBy);
      params.set("sortOrder", filters.sortOrder);

      if (filters.search.trim()) {
        params.set("search", filters.search.trim());
      }

      if (filters.status) {
        params.set("status", filters.status);
      }

      if (filters.priority) {
        params.set("priority", filters.priority);
      }

      if (filters.category) {
        params.set("category", filters.category);
      }

      if (filters.assigneeId) {
        params.set("assigneeId", filters.assigneeId);
      }

      const response = await api.get<TicketListResponse>(
        `/tickets?${params.toString()}`
      );

      setTickets(response.data.data.tickets);
      setPagination(response.data.data.pagination);
    } catch {
      setError("Unable to load tickets.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void fetchTickets();
  }, [fetchTickets]);

  function updateFilters(
    changes: Partial<TicketFilters>
  ) {
    setFilters((current) => ({
      ...current,
      ...changes,
      page:
        changes.page !== undefined
          ? changes.page
          : 1,
    }));
  }

  function setPage(page: number) {
    setFilters((current) => ({
      ...current,
      page,
    }));
  }

  return {
    tickets,
    pagination,
    filters,
    loading,
    error,
    updateFilters,
    setPage,
    refetch: fetchTickets,
  };
}