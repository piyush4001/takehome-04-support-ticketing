import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { authenticate } from "./middleware/auth.middleware.js";
import ticketRoutes from "./modules/tickets/ticket.routes.js";
import slaRoutes from "./modules/sla/sla.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import userRoutes from "./modules/users/user.routes.js";
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);

app.use(express.json());
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Support Ticketing API is running",
  });
});
app.get("/api/me", authenticate, (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/sla", slaRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use(errorMiddleware);

export default app;