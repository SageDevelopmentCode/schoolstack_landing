import type { AdjustmentType, TuitionAdjustment, TuitionRateTier } from "./types";

export type TuitionInputMode = "annual" | "monthly";

export function tuitionInputToAnnualCents(
  amount: number,
  mode: TuitionInputMode,
): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return mode === "monthly"
    ? Math.round(amount * 12 * 100)
    : Math.round(amount * 100);
}

export function annualCentsToTuitionInput(
  amountCents: number,
  mode: TuitionInputMode,
): number {
  if (amountCents <= 0) return 0;
  return mode === "monthly" ? amountCents / 12 / 100 : amountCents / 100;
}

export type PricingAdjustment = Pick<
  TuitionAdjustment,
  "adjustmentType" | "valuePercent" | "valueCents" | "priority" | "scope"
>;

export function computeAdjustedAmountCents(
  baseAmountCents: number,
  adjustments: PricingAdjustment[],
): number {
  if (baseAmountCents <= 0) return 0;

  const installmentAdjustments = adjustments
    .filter((a) => a.scope === "installment" || a.scope === "annual_total")
    .sort((a, b) => a.priority - b.priority);

  let amount = baseAmountCents;

  for (const adjustment of installmentAdjustments) {
    amount = applySingleAdjustment(amount, adjustment);
  }

  return Math.max(0, amount);
}

export function applySingleAdjustment(
  amountCents: number,
  adjustment: Pick<PricingAdjustment, "adjustmentType" | "valuePercent" | "valueCents">,
): number {
  switch (adjustment.adjustmentType) {
    case "percent_discount": {
      const pct = adjustment.valuePercent ?? 0;
      return Math.round(amountCents * (1 - pct / 100));
    }
    case "fixed_discount": {
      const discount = adjustment.valueCents ?? 0;
      return Math.max(0, amountCents - discount);
    }
    case "custom_amount":
      return Math.max(0, adjustment.valueCents ?? 0);
    case "waiver":
      return 0;
    default:
      return amountCents;
  }
}

export function formatAdjustmentSummary(
  adjustmentType: AdjustmentType,
  valuePercent: number | null,
  valueCents: number | null,
  reason: string,
): string {
  switch (adjustmentType) {
    case "percent_discount":
      return `${valuePercent ?? 0}% ${reason.toLowerCase()}`;
    case "fixed_discount":
      return `$${((valueCents ?? 0) / 100).toFixed(0)} off · ${reason}`;
    case "custom_amount":
      return reason;
    case "waiver":
      return `Waived · ${reason}`;
    default:
      return reason;
  }
}

export type ChargeBreakdownLineKind = "base" | "adjustment" | "total";

export type ChargeBreakdownLine = {
  kind: ChargeBreakdownLineKind;
  label: string;
  amountCents: number;
};

export function buildChargeAdjustmentBreakdown(input: {
  baseAmountCents: number;
  amountCents: number;
  adjustments: Pick<
    TuitionAdjustment,
    | "adjustmentType"
    | "valuePercent"
    | "valueCents"
    | "priority"
    | "scope"
    | "reason"
    | "status"
  >[];
}): ChargeBreakdownLine[] {
  const { baseAmountCents, amountCents } = input;

  const applicable = input.adjustments
    .filter((adjustment) => adjustment.status === "active")
    .filter(
      (adjustment) =>
        adjustment.scope === "installment" || adjustment.scope === "annual_total",
    )
    .sort((a, b) => a.priority - b.priority);

  const hasAdjustment = baseAmountCents !== amountCents || applicable.length > 0;

  if (!hasAdjustment) {
    return [{ kind: "total", label: "You pay", amountCents }];
  }

  const lines: ChargeBreakdownLine[] = [
    { kind: "base", label: "Base amount", amountCents: baseAmountCents },
  ];

  let running = baseAmountCents;
  for (const adjustment of applicable) {
    const next = applySingleAdjustment(running, adjustment);
    const delta = next - running;
    if (delta !== 0) {
      lines.push({
        kind: "adjustment",
        label: formatAdjustmentSummary(
          adjustment.adjustmentType,
          adjustment.valuePercent,
          adjustment.valueCents,
          adjustment.reason,
        ),
        amountCents: delta,
      });
    }
    running = next;
  }

  lines.push({ kind: "total", label: "You pay", amountCents: amountCents });
  return lines;
}

export function annualCentsFromTiers(
  tiers: Pick<TuitionRateTier, "amountCents" | "isDefault">[],
): number {
  if (tiers.length === 0) return 0;
  const defaultTier = tiers.find((tier) => tier.isDefault) ?? tiers[0];
  return defaultTier.amountCents;
}

export function formatTierAmountRange(
  tiers: Pick<TuitionRateTier, "amountCents">[],
  mode: TuitionInputMode,
): string | null {
  if (tiers.length === 0) return null;

  const amounts = tiers
    .map((tier) => tier.amountCents)
    .filter((amount) => amount > 0)
    .sort((a, b) => a - b);

  if (amounts.length === 0) return null;

  const min = amounts[0];
  const max = amounts[amounts.length - 1];

  if (mode === "monthly") {
    const minMonthly = Math.round(min / 12);
    const maxMonthly = Math.round(max / 12);
    if (minMonthly === maxMonthly) {
      return `${formatCents(minMonthly)}/mo`;
    }
    return `${formatCents(minMonthly)}–${formatCents(maxMonthly)}/mo`;
  }

  if (min === max) {
    return `${formatCents(min)}/yr`;
  }
  return `${formatCents(min)}–${formatCents(max)}/yr`;
}

export function formatCents(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
