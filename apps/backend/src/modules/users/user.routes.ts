import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware.js";
import { getAgentsController } from "./user.controller.js";

const router = Router();

router.get(
  "/agents",
  authenticate,
  getAgentsController
);

export default router;