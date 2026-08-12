import { computeAdjustedAmountCents, formatAdjustmentSummary, type PricingAdjustment } from "./pricing";
import type { TuitionAdjustment, TuitionCharge } from "./types";

export type AdjustmentImpactScenario =
  | "no_charges"
  | "all_paid"
  | "partial_paid"
  | "none_paid";

export type AdjustmentImpactInstallment = {
  label: string;
  amountCents: number;
};

export type AdjustmentImpactUpcomingInstallment = {
  label: string;
  currentAmountCents: number;
  newAmountCents: number;
};

export type AdjustmentImpactPreview = {
  scenario: AdjustmentImpactScenario;
  paidInstallments: AdjustmentImpactInstallment[];
  upcomingInstallments: AdjustmentImpactUpcomingInstallment[];
  totals: {
    paidCents: number;
    remainingBeforeCents: number;
    remainingAfterCents: number;
    annualSavingsCents: number;
  };
};

const LOCKED_CHARGE_STATUSES = new Set(["paid", "waived"]);
const UPCOMING_CHARGE_STATUSES = new Set(["scheduled", "sent", "overdue"]);

function toPricingAdjustments(
  adjustments: Array<
    Pick<
      TuitionAdjustment,
      | "adjustmentType"
      | "valuePercent"
      | "valueCents"
      | "priority"
      | "scope"
      | "status"
    >
  >,
): PricingAdjustment[] {
  return adjustments
    .filter((adjustment) => adjustment.status === "active")
    .map((adjustment) => ({
      adjustmentType: adjustment.adjustmentType,
      valuePercent: adjustment.valuePercent,
      valueCents: adjustment.valueCents,
      priority: adjustment.priority,
      scope: adjustment.scope,
    }));
}

function tuitionCharges(charges: TuitionCharge[]): TuitionCharge[] {
  return charges.filter((charge) => charge.chargeType === "tuition");
}

export function computeAdjustmentImpactPreview(input: {
  charges: TuitionCharge[];
  baseAmountCents: number;
  existingAdjustments: TuitionAdjustment[];
  draftAdjustment: PricingAdjustment;
}): AdjustmentImpactPreview {
  const tuition = tuitionCharges(input.charges);

  if (tuition.length === 0) {
    return {
      scenario: "no_charges",
      paidInstallments: [],
      upcomingInstallments: [],
      totals: {
        paidCents: 0,
        remainingBeforeCents: 0,
        remainingAfterCents: 0,
        annualSavingsCents: 0,
      },
    };
  }

  const existingPricing = toPricingAdjustments(input.existingAdjustments);
  const allPricing = [...existingPricing, input.draftAdjustment];

  const paidInstallments: AdjustmentImpactInstallment[] = [];
  const upcomingInstallments: AdjustmentImpactUpcomingInstallment[] = [];

  let paidCents = 0;
  let remainingBeforeCents = 0;
  let remainingAfterCents = 0;

  for (const charge of tuition) {
    if (LOCKED_CHARGE_STATUSES.has(charge.status)) {
      paidInstallments.push({
        label: charge.label,
        amountCents: charge.amountCents,
      });
      paidCents += charge.amountCents;
      continue;
    }

    if (!UPCOMING_CHARGE_STATUSES.has(charge.status)) {
      continue;
    }

    const chargeBase = charge.baseAmountCents || input.baseAmountCents;
    const currentAmountCents = charge.amountCents;
    const newAmountCents = computeAdjustedAmountCents(chargeBase, allPricing);

    upcomingInstallments.push({
      label: charge.label,
      currentAmountCents,
      newAmountCents,
    });
    remainingBeforeCents += currentAmountCents;
    remainingAfterCents += newAmountCents;
  }

  const annualSavingsCents = Math.max(0, remainingBeforeCents - remainingAfterCents);

  let scenario: AdjustmentImpactScenario;
  if (upcomingInstallments.length === 0 && paidInstallments.length > 0) {
    scenario = "all_paid";
  } else if (paidInstallments.length > 0) {
    scenario = "partial_paid";
  } else {
    scenario = "none_paid";
  }

  if (scenario === "none_paid" && upcomingInstallments.length === 0) {
    scenario = "no_charges";
  }

  return {
    scenario,
    paidInstallments,
    upcomingInstallments,
    totals: {
      paidCents,
      remainingBeforeCents,
      remainingAfterCents,
      annualSavingsCents,
    },
  };
}

export function formatActiveAdjustmentsList(adjustments: TuitionAdjustment[]): string {
  return adjustments
    .filter((adjustment) => adjustment.status === "active")
    .map((adjustment) =>
      formatAdjustmentSummary(
        adjustment.adjustmentType,
        adjustment.valuePercent,
        adjustment.valueCents,
        adjustment.reason,
      ),
    )
    .join(", ");
}

const ADJUSTMENT_SOURCE_LABELS: Record<TuitionAdjustment["source"], string> = {
  manual: "Manual",
  rule: "Automatic",
  checklist_response: "Checklist",
  import: "Import",
};

function formatAdjustmentTypeLabel(
  adjustment: Pick<TuitionAdjustment, "adjustmentType" | "valuePercent" | "valueCents">,
): string {
  switch (adjustment.adjustmentType) {
    case "percent_discount":
      return `${adjustment.valuePercent ?? 0}% off`;
    case "fixed_discount":
      return `$${((adjustment.valueCents ?? 0) / 100).toFixed(2)} off`;
    case "custom_amount":
      return `$${((adjustment.valueCents ?? 0) / 100).toFixed(2)}/installment`;
    case "waiver":
      return "Waived";
    default:
      return "Adjustment";
  }
}

export function formatAdjustmentDetailLine(adjustment: TuitionAdjustment): string {
  const sourceLabel = ADJUSTMENT_SOURCE_LABELS[adjustment.source] ?? adjustment.source;
  return [
    formatAdjustmentTypeLabel(adjustment),
    adjustment.reason,
    sourceLabel,
  ].join(" · ");
}

export function formatAssignmentAdjustmentBadgeLabel(
  adjustments: TuitionAdjustment[],
): string | null {
  const active = adjustments.filter((adjustment) => adjustment.status === "active");
  if (active.length === 0) return null;
  if (active.length === 1) {
    const adjustment = active[0]!;
    return formatAdjustmentSummary(
      adjustment.adjustmentType,
      adjustment.valuePercent,
      adjustment.valueCents,
      adjustment.reason,
    );
  }
  return `${active.length} adjustments`;
}
