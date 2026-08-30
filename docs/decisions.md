# Decisions

Log the decisions that actually shaped this codebase — the ones where a real alternative existed and
you picked one. At least five entries. For each: what you chose, what you rejected, and why. At least
one entry must be a decision you later reversed — say what changed your mind. It can be any entry
below, not necessarily the last one; add a **Later reversed:** line to whichever one it is.



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

- **Chose:**
- **Rejected:**
- **Why:**

## Decision 4

- **Chose:**
- **Rejected:**
- **Why:**

## Decision 5

- **Chose:**
- **Rejected:**
- **Why:**
