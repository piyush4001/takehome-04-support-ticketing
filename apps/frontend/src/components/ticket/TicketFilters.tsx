import {
  Archive,
  CalendarDays,
  ChevronDown,
  Filter,
  RotateCcw,
  Search,
  Tag,
  UserRound,
} from "lucide-react";

import type {
  TicketPriority,
  TicketStatus,
} from "../../types/ticket";
import type { TicketFilters as TicketFilterState } from "../../hooks/useTickets";

type TicketFiltersProps = {
  filters: TicketFilterState;
  onChange: (
    changes: Partial<TicketFilterState>
  ) => void;
  agents: {
    id: string;
    name: string;
    email: string;
  }[];
};

const statuses: TicketStatus[] = [
  "NEW",
  "OPEN",
  "PENDING",
  "RESOLVED",
  "CLOSED",
];

const priorities: TicketPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

export default function TicketFilters({
  filters,
  onChange,
  agents,
}: TicketFiltersProps) {
  const inputClassName =
    "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#173b67] focus:ring-2 focus:ring-[#173b67]/10";

  const selectClassName =
    "w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-9 text-sm text-slate-700 shadow-sm outline-none transition hover:border-slate-400 focus:border-[#173b67] focus:ring-2 focus:ring-[#173b67]/10";

  function handleClearFilters() {
    onChange({
      search: "",
      status: "",
      priority: "",
      category: "",
      assigneeId: "",
      archived: false,
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
    });
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#173b67]/10">
              <Filter className="h-4 w-4 text-[#173b67]" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Filter tickets
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Search and narrow down the ticket queue.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearFilters}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 sm:self-auto"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear filters
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {/* Active / Archived */}
        <div className="mb-5 flex rounded-lg border border-slate-200 bg-slate-100 p-1 sm:w-fit">
          <button
            type="button"
            onClick={() =>
              onChange({
                archived: false,
              })
            }
            className={`inline-flex min-w-25 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition ${
              !filters.archived
                ? "bg-white text-[#173b67] shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Tag className="h-4 w-4" />
            Active
          </button>

          <button
            type="button"
            onClick={() =>
              onChange({
                archived: true,
              })
            }
            className={`inline-flex min-w-25 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition ${
              filters.archived
                ? "bg-white text-[#173b67] shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Archive className="h-4 w-4" />
            Archived
          </button>
        </div>

        {/* Main filters */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <div className="lg:col-span-2">
            <label
              htmlFor="ticket-search"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Search
            </label>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                id="ticket-search"
                type="search"
                value={filters.search}
                onChange={(event) =>
                  onChange({
                    search: event.target.value,
                  })
                }
                placeholder="Search subject or description..."
                className={`${inputClassName} pl-10`}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="ticket-status"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Status
            </label>

            <div className="relative">
              <select
                id="ticket-status"
                value={filters.status}
                onChange={(event) =>
                  onChange({
                    status: event.target.value as TicketStatus | "",
                  })
                }
                className={selectClassName}
              >
                <option value="">All statuses</option>

                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label
              htmlFor="ticket-priority"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Priority
            </label>

            <div className="relative">
              <select
                id="ticket-priority"
                value={filters.priority}
                onChange={(event) =>
                  onChange({
                    priority: event.target.value as TicketPriority | "",
                  })
                }
                className={selectClassName}
              >
                <option value="">All priorities</option>

                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="ticket-category"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Category
            </label>

            <div className="relative">
              <Tag className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                id="ticket-category"
                type="text"
                value={filters.category}
                onChange={(event) =>
                  onChange({
                    category: event.target.value,
                  })
                }
                placeholder="Category"
                className={`${inputClassName} pl-10`}
              />
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label
              htmlFor="ticket-assignee"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Assignee
            </label>

            <div className="relative">
              <select
                id="ticket-assignee"
                value={filters.assigneeId}
                onChange={(event) =>
                  onChange({
                    assigneeId: event.target.value,
                  })
                }
                className={selectClassName}
              >
                <option value="">All assignees</option>

                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>

              <UserRound className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Sorting */}
        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-400" />

            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Sort by
            </span>
          </div>

          <div className="relative sm:min-w-42.5">
            <select
              value={filters.sortBy}
              onChange={(event) =>
                onChange({
                  sortBy:
                    event.target.value as TicketFilterState["sortBy"],
                })
              }
              className={selectClassName}
            >
              <option value="createdAt">Created date</option>
              <option value="priority">Priority</option>
              <option value="updatedAt">Last update</option>
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative sm:min-w-37.5">
            <select
              value={filters.sortOrder}
              onChange={(event) =>
                onChange({
                  sortOrder:
                    event.target.value as TicketFilterState["sortOrder"],
                })
              }
              className={selectClassName}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="hidden flex-1 sm:block" />

          <p className="text-xs text-slate-400">
            Filters update the ticket queue automatically.
          </p>
        </div>
      </div>
    </section>
  );
}