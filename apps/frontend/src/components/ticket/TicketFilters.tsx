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
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
        <input
          type="search"
          value={filters.search}
          onChange={(event) =>
            onChange({
              search: event.target.value,
            })
          }
          placeholder="Search tickets..."
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />

        <select
          value={filters.status}
          onChange={(event) =>
            onChange({
              status: event.target.value as TicketStatus | "",
            })
          }
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        >
          <option value="">All statuses</option>

          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(event) =>
            onChange({
              priority:
                event.target.value as TicketPriority | "",
            })
          }
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        >
          <option value="">All priorities</option>

          {priorities.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={filters.category}
          onChange={(event) =>
            onChange({
              category: event.target.value,
            })
          }
          placeholder="Category"
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
        <select
        value={filters.assigneeId}
        onChange={(event) =>
            onChange({
            assigneeId: event.target.value,
            })
        }
        className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        >
        <option value="">All assignees</option>

        {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
            {agent.name}
            </option>
        ))}
        </select>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="text-sm text-slate-600">
          Sort by
        </label>

        <select
          value={filters.sortBy}
          onChange={(event) =>
            onChange({
              sortBy: event.target.value as TicketFilterState["sortBy"],
            })
          }
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="createdAt">Created date</option>
          <option value="priority">Priority</option>
          <option value="updatedAt">Last update</option>
        </select>

        <select
          value={filters.sortOrder}
          onChange={(event) =>
            onChange({
              sortOrder:
                event.target.value as TicketFilterState["sortOrder"],
            })
          }
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>

        <button
          type="button"
          onClick={() =>
            onChange({
              search: "",
              status: "",
              priority: "",
              category: "",
              assigneeId: "",
              sortBy: "createdAt",
              sortOrder: "desc",
              page: 1,
            })
          }
          className="ml-auto rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Clear filters
        </button>
      </div>
    </section>
  );
}