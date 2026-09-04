# AI prompts

The entries below are in development order.

## Project foundation and core ticket workflows

### Prompt

**History-based summary:** Set up the React/Vite frontend, Express/TypeScript backend, Prisma/PostgreSQL integration, initial schema, authentication foundation, server-side ticket listing, ticket details, authorization, and lifecycle management. Keep the system modular and aligned with the take-home requirements.

### What you got

The project was established as a modular monolith. Prisma models and the initial migration were added, followed by JWT authentication, server-side queue listing, ticket detail access checks, lifecycle transitions, and the basic React ticket experience.

### What you corrected

The later implementation tightened behavior around archive/restore, ticket editing, history metadata, and dashboard access as those workflows were exercised. The commit history shows these were incremental corrections rather than a change to the overall architecture.

## Authentication and authorization

### Prompt

**History-based summary:** Implement authentication and authorization for AGENT and SUPERVISOR users. Keep permission checks on the server and enforce ticket access based on supervisor role, primary assignment, or collaboration.

### What you got

JWT login, Express authentication middleware, role middleware, ticket resource authorization, and supervisor-only dashboard checks were implemented. The API became the security boundary while the frontend could use the same role information for presentation.

### What you corrected

The later role-aware frontend work added protected routes and hid supervisor-only navigation/actions, but deliberately kept the backend checks intact. This avoided treating UI visibility as authorization.

## Replies, collaborators, and immutable history

### Prompt

**History-based summary:** Add replies with internal-note and customer-visible types, collaborator management, and a chronological immutable ticket timeline. Record replies, status changes, assignments, and collaboration changes as audit events.

### What you got

`Reply` and `TicketCollaborator` models, service transactions, reply and collaborator routes, ticket detail panels, and the `TicketEvent` timeline were added. Reply visibility is represented by `ReplyType`, and event records preserve actor and old/new values where relevant.

### What you corrected

The implementation kept reply/event records append-only and used transactions for paired data and history writes. Later review also ensured an automatic Pending-to-Open transition would create its own status event rather than silently changing the ticket.

## Bulk operations and CSV export

### Prompt

**History-based summary:** Implement bulk ticket close and reassignment plus CSV export, using the existing queue filters and returning a per-ticket result when a batch contains ineligible tickets.

### What you got

Bulk close and reassignment endpoints, service-level eligibility checks, frontend selection and result panels, pagination, and filtered CSV export were added. Reassignment was restricted to supervisors on the server, while bulk close preserved per-ticket lifecycle and ownership decisions.

### What you corrected

The UI was later adjusted so agents do not see the supervisor-only bulk reassignment action. Bulk close remained available because agent eligibility is ticket-specific and the backend continues to return the authoritative result.

## SLA alerts and response lifecycle

### Prompt

**History-based summary:** Add priority-based response targets, active response-time tracking, a periodic SLA worker, at-risk/breached alerts, acknowledgement, and the dashboard metrics needed to expose SLA state.

### What you got

SLA target and elapsed-time fields were added to `Ticket`; the worker evaluates running NEW/OPEN tickets every minute; alerts use breach sequences and a uniqueness constraint; and the dashboard and alerts frontend consume the calculated state.

### What you corrected

When the lifecycle requirement was reviewed, the prompt explicitly required that Pending pause the clock and a customer reply reopen it server-side. The reply implementation was corrected to preserve accumulated elapsed time, resume a new active segment, record `PENDING → OPEN`, keep internal notes in Pending, and avoid duplicate alerts.

## Server-side search, filtering, and pagination

### Prompt

Implement ticket search in the existing queue. Search subject and description with Prisma/database-level, case-insensitive partial matching; combine it with status, priority, category, assignee, sorting, pagination, authorization, and the total count. Preserve the existing frontend fetch flow and do not filter a complete dataset in the browser.

### What you got

The existing list API was extended through its query schema and `buildTicketWhere` predicate. The frontend sent `search` through `useTickets`, while `findMany` and `count` used the same database filter.

### What you corrected

The first result was incomplete for the stated contract: whitespace-only input did not behave like an empty search, and the predicate also matched requester name and email. Review changed validation to trim blank values to no filter and restricted matching to case-insensitive `contains` on only `subject` and `description`. This is the clearest wrong-output-to-correction example in the retained development history.

## Profile, logout, and role-aware frontend

### Prompt

Implement frontend profile, logout, protected routes, and role-aware UI without redesigning the application or weakening backend authorization. Reuse the existing JWT/login flow, support refresh, route supervisors to Dashboard, route agents to Tickets, and hide only actions that are clearly supervisor-only.

### What you got

The login response now supplies a persisted typed user profile, an auth context clears token and user state on logout, protected routes redirect to `/login`, and Profile displays name, email, and role. Dashboard and bulk reassignment are supervisor-only in the UI; ticket-level actions remain available where backend authorization is ticket-specific.

### What you corrected

The first auth-context implementation combined provider and hook exports, which violated the project's Fast Refresh lint rule. It was split into provider, context, and hook modules; a React 19 `ReactNode` typing issue and a Windows filename-casing collision were also fixed before the frontend build and focused lint passed.

Overall, AI was used for implementation, debugging, refactoring, and UI polish. Human review of the code, repository history, build output, lint output, and assignment requirements determined which results were accepted and which were corrected.
