import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  createTicket,
  listTickets,
} from "./ticket.controller.js";

const router = Router();

router.get(
  "/",
  authenticate,
  listTickets
);

router.post(
  "/",
  authenticate,
  createTicket
);

export default router;