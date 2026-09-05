import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

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
  archived: boolean;
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
  archived: false,
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  pageSize: 5,
};

type TicketCacheEntry = {
  tickets: Ticket[];
  pagination: TicketListResponse["data"]["pagination"];
};

const ticketCache = new Map<string, TicketCacheEntry>();

function createCacheKey(filters: TicketFilters) {
  return JSON.stringify({
    search: filters.search.trim(),
    status: filters.status,
    priority: filters.priority,
    category: filters.category,
    assigneeId: filters.assigneeId,
    archived: filters.archived,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    page: filters.page,
    pageSize: filters.pageSize,
  });
}

function getCachedTickets(
  filters: TicketFilters
): TicketCacheEntry | undefined {
  return ticketCache.get(createCacheKey(filters));
}

export function useTickets(
  initialFilters?: Partial<TicketFilters>
) {
  const [filters, setFilters] = useState<TicketFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  const cachedData = getCachedTickets(filters);

  const [tickets, setTickets] = useState<Ticket[]>(
    () => cachedData?.tickets ?? []
  );

  const [pagination, setPagination] =
    useState<TicketListResponse["data"]["pagination"]>(
      () =>
        cachedData?.pagination ?? {
          page: 1,
          pageSize: DEFAULT_FILTERS.pageSize,
          total: 0,
          totalPages: 0,
        }
    );

  const [loading, setLoading] = useState(
    () => !cachedData
  );

  const [error, setError] = useState("");

  const requestIdRef = useRef(0);

  const fetchTickets = useCallback(
    async (force = false) => {
      const cacheKey = createCacheKey(filters);
      const cached = ticketCache.get(cacheKey);

      if (cached && !force) {
        setTickets(cached.tickets);
        setPagination(cached.pagination);
        setLoading(false);
        setError("");
        return;
      }

      const requestId = ++requestIdRef.current;

      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        params.set("page", String(filters.page));
        params.set("pageSize", String(filters.pageSize));
        params.set("sortBy", filters.sortBy);
        params.set("sortOrder", filters.sortOrder);
        params.set("archived", String(filters.archived));

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

        const nextData: TicketCacheEntry = {
          tickets: response.data.data.tickets,
          pagination: response.data.data.pagination,
        };

        ticketCache.set(cacheKey, nextData);

        // Ignore an older request if the user has already
        // changed filters and a newer request is active.
        if (requestId !== requestIdRef.current) {
          return;
        }

        setTickets(nextData.tickets);
        setPagination(nextData.pagination);
      } catch {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setError("Unable to load tickets.");
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [filters]
  );

  useEffect(() => {
    const cached = getCachedTickets(filters);

    if (cached) {
      setTickets(cached.tickets);
      setPagination(cached.pagination);
      setLoading(false);
      setError("");
      return;
    }

    // This effect intentionally starts the request
    // when ticket filters change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchTickets();
  }, [filters, fetchTickets]);

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

  const refetch = useCallback(() => {
    return fetchTickets(true);
  }, [fetchTickets]);

  return {
    tickets,
    pagination,
    filters,
    loading,
    error,
    updateFilters,
    setPage,
    refetch,
  };
}