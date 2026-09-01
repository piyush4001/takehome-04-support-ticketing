import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  createTicket,
  listTickets,
  getTicketById,
  updateTicket,
  updateTicketStatus,
} from "./ticket.controller.js";
import {
  createReply,
} from "./reply.controller.js";
import {
  addCollaborator,
  removeCollaborator,
} from "./collaborator.controller.js";

import {
  bulkReassign,
  bulkClose,
} from "./bulk.controller.js";
import {
  exportTicketsCsvController,
} from "./ticket.controller.js";
const router = Router();

router.get(
  "/",
  authenticate,
  listTickets
);

router.get(
  "/export/csv",
  authenticate,
  exportTicketsCsvController
);
router.post(
  "/bulk/reassign",
  authenticate,
  bulkReassign
);

router.post(
  "/bulk/close",
  authenticate,
  bulkClose
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

router.post(
  "/:id/replies",
  authenticate,
  createReply
);

router.post(
  "/:id/collaborators",
  authenticate,
  addCollaborator
);

router.delete(
  "/:id/collaborators/:userId",
  authenticate,
  removeCollaborator
);

export default router;