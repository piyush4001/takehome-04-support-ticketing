# Submission

## Links

- **GitHub repository:** https://github.com/piyush4001/takehome-04-support-ticketing.git

- **Live application:** https://takehome-04-support-ticketing.vercel.app

## Notes for the reviewer

This is a full-stack support ticketing application with separate supervisor and agent roles.

The frontend is deployed on Vercel and the backend is deployed on Render.

The backend API is available at:

https://takehome-04-support-ticketing.onrender.com

The application is connected to a hosted PostgreSQL database on Supabase and is seeded with realistic demo data.

The Render free tier may sleep when idle, so the first API request after a period of inactivity may take a little longer than subsequent requests.

The application includes role-aware navigation and actions. Supervisor users have access to supervisor-level operations such as dashboard access and bulk reassignment, while agents see the workflows available to their role.

Server-side authorization remains the final security boundary.

## Demo credentials

All demo accounts use the password:

`Password123!`

| Role | Email | Password |
|------|-------|----------|
| Supervisor | supervisor@example.com | Password123! |
| Supervisor | morgan.supervisor@example.com | Password123! |
| Agent | alice@example.com | Password123! |
| Agent | bob@example.com | Password123! |
| Agent | charlie@example.com | Password123! |
| Agent | diana@example.com | Password123! |

## Stack

| Layer | What you used | Why |
|-------|---------------|-----|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Lucide React | Fast component-based UI development with type safety and a lightweight utility-first styling approach |
| Backend | Node.js, Express, TypeScript, Prisma, Zod, JWT, bcrypt | Clear API/module separation, server-side validation, authentication and authorization |
| Database | PostgreSQL with Supabase | Managed relational database with strong relational constraints and easy Prisma integration |
| Hosting | Vercel + Render + Supabase | Simple deployment split between frontend, backend and managed database |

## Goal checklist

| # | Goal | Status | Notes |
|---|------|--------|-------|
| 1 | Accounts and roles | Done | Supervisor and agent authentication, JWT-based server authorization, role-aware frontend navigation and role-specific actions are implemented. Supervisor-only operations such as bulk reassignment are protected server-side. |
| 2 | Tickets | Done | Ticket creation, editing, archiving and restoring are implemented. Archived tickets are excluded from the default queue while remaining accessible to authorized users with their history preserved. Archived tickets are read-only until restored. |
| 3 | Replies | Done | Replies support authors, timestamps, customer-visible replies and internal notes. Replies are ordered in ticket detail and recorded in the immutable event timeline. Reply edit/delete operations are not exposed. |
| 4 | Lifecycle | Done | The ticket lifecycle is enforced server-side with valid and invalid transition handling. Pending pauses the SLA clock, customer responses reopen pending tickets and resume the clock, and closed tickets can be reopened within the defined window. SLA behavior is integrated with lifecycle transitions. |
| 5 | Collaborators | Done | Tickets have one primary assignee and multiple collaborators. Collaborators can access and update tickets according to server-side authorization, with duplicate/primary-collaborator protection and collaborator history events. |
| 6 | Finding | Done | Server-side search, filtering, sorting, pagination and total counts are implemented. Search covers ticket subject and description, with filters for status, priority, category and assignee. The same server-side filtering logic is reused for CSV export. |
| 7 | Bulk operations and CSV | Done | Bulk close, bulk reassignment with per-ticket authorization/results, and CSV export of the current filtered queue are implemented. CSV export is available independently of ticket selection. |
| 8 | Dashboard | Done | Supervisor dashboard includes open, pending, resolved-this-week and SLA-breach metrics, status and agent breakdowns, and an 8-week resolved-ticket chart. Dashboard access is role-protected. |
| 9 | Immutable history | Done | Status changes, assignments, replies, collaborator changes, archive/restore actions and other important changes are recorded as ticket events with actors and timestamps. Event and reply mutation/deletion routes are not exposed, preserving the application-level immutable history model. |
| 10 | SLA alerts | Done | At-risk and breached SLA alerts are generated and surfaced through the alerts area and navigation count. Assigned users can acknowledge alerts, and reopened/rebreached tickets generate the appropriate alert sequence. |

## How much time did you actually spend?

Approximately one focused week of development across multiple sessions, including backend implementation, frontend integration, UI polish, database setup, deployment, testing and documentation.

The work was completed incrementally rather than as one final implementation, with meaningful features committed as they were completed.

## What would you do next, with another 12 hours?

With another 12 hours, I would focus primarily on strengthening the existing implementation rather than adding major new functionality.

1. Expand automated test coverage around authorization, lifecycle transitions, collaborators, bulk operations and SLA behavior.

2. Add more integration/E2E coverage for the main supervisor and agent workflows.

3. Perform additional production-level verification across the deployed frontend, backend and database.

4. Improve observability and error reporting for easier debugging of production issues.

5. Review performance around large ticket queues, server-side filtering and dashboard aggregation.

6. Improve documentation with additional architecture diagrams and operational/deployment notes.

7. Perform a final accessibility and responsive-design pass across the main workflows.

8. Refine smaller UX details based on reviewer feedback and real-world usage.

## What are you least happy with in this codebase, and why?

The area I am least happy with is the SLA/lifecycle implementation.

The ticket lifecycle, response clock, Pending pause, reopening behavior and SLA alerts interact closely, so a seemingly small state transition can affect multiple pieces of state. The implementation now covers the required workflow, but this area has the highest domain complexity and would benefit from additional automated tests and further simplification of the underlying state/time calculations.

I am also less satisfied with the overall automated test coverage than with the feature implementation itself. The application has been manually verified during development and the frontend/backend builds pass, but a larger dedicated automated test suite would provide stronger protection for authorization, lifecycle and time-based SLA invariants.

Given more time, I would prioritize strengthening those areas before introducing additional product features.