import type { TicketStatus } from "../../generated/prisma/enums.js";
import { AppError } from "../../utils/app.error.js";

export const ALLOWED_STATUS_TRANSITIONS: Record<
  TicketStatus,
  TicketStatus[]
> = {
  NEW: ["OPEN"],
  OPEN: ["PENDING", "RESOLVED"],
  PENDING: ["OPEN"],
  RESOLVED: ["CLOSED"],
  CLOSED: ["OPEN"],
};

export function validateStatusTransition(
  currentStatus: TicketStatus,
  nextStatus: TicketStatus
) {
  if (
    !ALLOWED_STATUS_TRANSITIONS[currentStatus].includes(
      nextStatus
    )
  ) {
    throw new AppError(
      400,
      `Invalid status transition: ${currentStatus} → ${nextStatus}`
    );
  }
}