import {
  formatBillingDueDate,
  formatDueCountdown,
} from "./due-date-display";
import type { TuitionCharge } from "./types";

export type ChargeStatusBadgeTone = "success" | "neutral" | "warning" | "danger";

export type ChargeStatusBadge = {
  label: string;
  tone: ChargeStatusBadgeTone;
};

export function formatParentChargeStatusBadge(charge: TuitionCharge): ChargeStatusBadge {
  if (charge.chargeType === "late_fee") {
    return { label: "LATE FEE", tone: "warning" };
  }

  switch (charge.status) {
    case "paid":
      return { label: "PAID", tone: "success" };
    case "overdue":
      return { label: "OVERDUE", tone: "danger" };
    case "scheduled":
      return { label: "SCHEDULED", tone: "neutral" };
    case "sent":
      return { label: "SENT", tone: "neutral" };
    case "void":
      return { label: "VOID", tone: "neutral" };
    case "waived":
      return { label: "WAIVED", tone: "neutral" };
    default: {
      charge.status satisfies never;
      return { label: "UNKNOWN", tone: "neutral" };
    }
  }
}

export function formatParentChargeDueLine(
  charge: TuitionCharge,
  todayIso?: string,
): string {
  if (charge.status === "paid") {
    const paidDate = charge.paidAt
      ? formatBillingDueDate(charge.paidAt.slice(0, 10))
      : formatBillingDueDate(charge.dueDate);
    return `Paid ${paidDate}`;
  }

  const dueDateLabel = formatBillingDueDate(charge.dueDate);
  const countdown = formatDueCountdown(charge.dueDate, todayIso);

  if (charge.status === "overdue" || countdown.urgency === "overdue") {
    return `Due ${dueDateLabel} (${countdown.label})`;
  }

  return `Due ${dueDateLabel} (${countdown.label})`;
}
