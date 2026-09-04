# Decisions

## Decision 1

* **Chose:** Use a modular monolith with React + TypeScript, Node.js + Express + TypeScript, Prisma, and PostgreSQL.
* **Rejected:** A microservices architecture.
* **Why:** The assignment has a roughly 12-hour budget. A modular monolith keeps the system simple to develop, test, deploy, and explain while still allowing us to separate concerns such as authentication, tickets, replies, SLA, and dashboard logic.

## Decision 2

* **Chose:** Store the ticket's complete immutable history in a single `TicketEvent` table.
* **Rejected:** Using separate history tables for status changes, assignments, and other ticket activity, or reconstructing history from the current ticket state.
* **Why:** The assignment requires a timeline containing every status change, reassignment, and reply that cannot be edited or deleted. A single append-only event stream makes the timeline straightforward to query chronologically and preserves the historical record independently of the ticket's current state.

## Decision 3

- **Chose:** Enforce authentication, role checks, and ticket ownership/collaboration authorization on the server with JWT middleware and service-level checks.
- **Rejected:** Relying on frontend role checks or hidden buttons as the permission boundary.
- **Why:** The browser controls presentation only; the backend must independently protect dashboard access, ticket operations, replies, collaborators, and SLA acknowledgement actions.

## Decision 4

- **Chose:** Keep exactly one primary assignee on `Ticket` and model additional agents through the `TicketCollaborator` many-to-many join table.
- **Rejected:** Multiple equal assignees or a list/JSON field embedded in `Ticket`.
- **Why:** The queue needs a clear owner for assignment and SLA visibility, while the join table supports many collaborators, composite uniqueness, relational queries, and ticket-level authorization.

## Decision 5

- **Chose:** Store `responseTargetSeconds`, `responseElapsedSeconds`, and `slaRunningSince` on `Ticket` to represent the response SLA as accumulated active time plus a current running segment.
- **Rejected:** Recalculating the entire response duration from ticket timestamps on every request, which would not represent Pending pauses cleanly.
- **Why:** Persisted active-time state makes the Pending pause explicit, lets Open resume from the accumulated value, and gives the SLA worker a stable state to evaluate.
- **Later reversed:** The initial customer-reply implementation reopened Pending and started a new running segment, but it still allowed the ordinary first-response path to interfere with that state. During implementation review, it was changed to preserve elapsed time explicitly, exclude that path for a Pending customer reply, validate `PENDING → OPEN`, and record the automatic status event in the same transaction.
