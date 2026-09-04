# Plan

## 1. How did you break the work into sessions?

- **Foundation and authentication:** Set up the React/Vite frontend, Express/TypeScript backend, Prisma/PostgreSQL connection, JWT login, and role middleware.
- **Core tickets:** Built ticket creation, queue listing, detail views, editing, lifecycle transitions, archive/restore, and immutable history.
- **Collaboration and replies:** Added collaborators, internal notes, customer-visible replies, and the Pending/customer-reply SLA transition.
- **Finding tickets:** Added server-side search over subject and description, filters, sorting, pagination, and matching totals.
- **Bulk operations and CSV:** Added bulk close, supervisor-only bulk reassignment, per-ticket results, and filtered CSV export.
- **Dashboard and SLA alerts:** Added supervisor dashboard metrics, charts, response-time tracking, SLA evaluation, alerts, and acknowledgement.
- **UI polish and role-aware frontend:** Improved ticket and queue interfaces, added profile/logout, protected routes, and role-aware navigation and actions.
- **Documentation and deployment notes:** Recorded architecture and implementation decisions; deployment remains configuration-driven rather than tied to a hosting provider.

## 2. What order did you build in, and why that order?

The work followed the dependency chain: foundation/authentication came first, then core tickets and lifecycle rules, followed by collaboration, history, and replies. Search, filtering, and pagination were added once the queue query existed; bulk operations, the dashboard, and SLA alerts then built on the ticket and authorization model. UI polish and role-aware frontend behavior came last because they depend on stable API contracts and permission rules.

## 3. What did you estimate versus what it actually took?

The repository does not contain a detailed time estimate or session-by-session time log, so exact planned-versus-actual numbers are not available. Qualitatively, the core CRUD and ticket queue work followed the expected shape, while SLA timing, alert behavior, bulk operations, search edge cases, and role-aware UI required more iteration than the initial foundation. The final work history shows those cross-cutting features landing after the core ticket workflows.

## 4. What did you cut when you ran short?

The optional stretch features were intentionally not built: canned responses, customer satisfaction ratings, a public status page, free-form tags, an internal knowledge base, and automatic routing by category. A separate customer-facing portal and public customer authentication were also outside the assignment's internal support-operations scope. The application instead keeps customer-visible replies within the authenticated support interface and preserves the required server-side authorization boundary.
