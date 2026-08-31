import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  createTicket,
  listTickets,
  getTicketById,
  updateTicket,
  updateTicketStatus,
} from "./ticket.controller.js";

const router = Router();

router.get(
  "/",
  authenticate,
  listTickets
);

router.get(
  "/:id",
  authenticate,
  getTicketById
);

router.post(
  "/",
  authenticate,
  createTicket
);

router.patch(
  "/:id",
  authenticate,
  updateTicket
);

router.patch(
  "/:id/status",
  authenticate,
  updateTicketStatus
);
export default router;