import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware.js";

import {
  getSlaAlerts,
  acknowledgeSlaAlertController,
} from "./sla.controller.js";

const router = Router();

router.get(
  "/alerts",
  authenticate,
  getSlaAlerts
);

router.post(
  "/alerts/:id/acknowledge",
  authenticate,
  acknowledgeSlaAlertController
);

export default router;