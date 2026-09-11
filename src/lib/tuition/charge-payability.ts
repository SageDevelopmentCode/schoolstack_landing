import type { ChargeStatus, TuitionCharge } from "./types";

export const OPEN_CHARGE_STATUSES = new Set<ChargeStatus>([
  "scheduled",
  "sent",
  "overdue",
]);

export function isChargePayable(charge: Pick<TuitionCharge, "status">): boolean {
  return OPEN_CHARGE_STATUSES.has(charge.status);
}
