import { chargeRemainingCents } from "./billing-splits";
import type { ChargeStatus, TuitionCharge } from "./types";

const OPEN_CHARGE_STATUSES = new Set<ChargeStatus>([
  "scheduled",
  "sent",
  "overdue",
]);

export class ChargeWaiveError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 400, code = "invalid_charge") {
    super(message);
    this.name = "ChargeWaiveError";
    this.status = status;
    this.code = code;
  }
}

export function validateChargeCanBeWaived(charge: TuitionCharge): void {
  if (
    charge.status === "paid" ||
    charge.status === "void" ||
    charge.status === "waived"
  ) {
    throw new ChargeWaiveError(
      `Charge is already ${charge.status}.`,
      400,
      "invalid_status",
    );
  }

  if (chargeRemainingCents(charge) <= 0) {
    throw new ChargeWaiveError(
      "Charge has no remaining balance to waive.",
      400,
      "no_balance",
    );
  }

  if (charge.paidCents > 0) {
    throw new ChargeWaiveError(
      "Partially paid charges cannot be waived.",
      400,
      "partially_paid",
    );
  }

  if (charge.chargeType === "late_fee") {
    if (!OPEN_CHARGE_STATUSES.has(charge.status)) {
      throw new ChargeWaiveError("Late fee is not open.", 400, "invalid_status");
    }
    return;
  }

  if (charge.chargeType === "tuition") {
    if (charge.status !== "overdue") {
      throw new ChargeWaiveError(
        "Only overdue tuition charges can be waived.",
        400,
        "not_overdue",
      );
    }
    return;
  }

  throw new ChargeWaiveError(
    "This charge type cannot be waived.",
    400,
    "unsupported_type",
  );
}

export function filterLateFeesLinkedToSourceCharge(
  rows: Array<{ id: string; metadata?: unknown }>,
  sourceChargeId: string,
): string[] {
  return rows
    .filter((row) => {
      const metadata = row.metadata;
      if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
        return false;
      }
      return (
        (metadata as Record<string, unknown>).sourceChargeId === sourceChargeId
      );
    })
    .map((row) => String(row.id));
}
