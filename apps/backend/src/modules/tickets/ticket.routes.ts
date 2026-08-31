import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  createTicket,
  listTickets,
  getTicketById,
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

export default router;