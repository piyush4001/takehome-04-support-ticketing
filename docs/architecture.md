# Architecture

## 1. What are the moving pieces, and how do they talk to each other?

The frontend is a React and TypeScript single-page application using React Router for navigation, Axios for API calls, and Tailwind CSS for the interface. It stores the JWT and current user profile in browser storage and sends the JWT as a Bearer token with authenticated requests.

The backend is an Express API. Routes receive HTTP requests, authentication middleware verifies the JWT, and module controllers pass validated input to services. Ticket, reply, collaborator, dashboard, and SLA services apply authorization and business rules. Prisma is the database access layer and reads and writes the ticketing data in PostgreSQL. Ticket history is stored as immutable events, while replies and SLA alerts have their own records.

The SLA worker is started by the backend server. It periodically finds active tickets whose response clocks are running and calls the SLA service to create at-risk or breached alerts without requiring a browser request.

## 2. Where does each piece run?

The frontend runs as a Vite development server during development and can be built into static assets for hosting. The backend runs as a Node.js process using Express. PostgreSQL runs as the database identified by the backend's `DATABASE_URL`; the repository does not prescribe a particular hosting provider. The SLA worker runs in the same Node.js backend process as a scheduled interval.

## 3. What is the request path for one representative user action, end to end?

For login, the user submits credentials in the React login page, which sends `POST /api/auth/login` through Axios. The Express auth route validates the request and the auth service looks up the user through Prisma in PostgreSQL and verifies the password with bcrypt. The service returns a JWT containing the user ID and role plus the user profile. The frontend stores those values, uses the role to choose the initial route, and renders the authenticated application. Later requests include the JWT; authentication middleware verifies it before the relevant controller and service perform authorization, business logic, and Prisma queries, after which the JSON response updates the React UI.

## 4. What did you decide not to build, and why?

There is no separate customer-facing portal or public customer authentication flow; customer-visible replies are created through the authenticated support interface because the assignment focuses on internal ticket operations. There is no external queue or event-streaming system; the SLA worker uses the backend's scheduled interval and PostgreSQL state, which is sufficient for this take-home application's scope. Optional stretch features such as canned responses, satisfaction ratings, a public status page, tagging, a knowledge base, and automatic category routing were not implemented because they are explicitly outside the required goals.
