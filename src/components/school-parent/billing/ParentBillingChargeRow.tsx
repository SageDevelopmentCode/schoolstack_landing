"use client";

import {
  formatParentChargeAmountLabel,
  formatParentChargeDueLine,
  formatParentChargeStatusBadge,
  type ChargeStatusBadgeTone,
} from "@/lib/tuition/charge-status-display";
import { buildChargeAdjustmentBreakdown, formatCents } from "@/lib/tuition/pricing";
import { chargeRemainingCents } from "@/lib/tuition/billing-splits";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { TuitionAdjustment, TuitionCharge } from "@/lib/tuition/types";

type ParentBillingChargeRowProps = {
  C: AdminThemeTokens;
  charge: TuitionCharge;
  adjustmentsForAssignment: TuitionAdjustment[];
  payingChargeId: string | null;
  highlighted?: boolean;
  autopayEnabled?: boolean;
  onPay: (chargeId: string) => void;
  readOnly?: boolean;
};

const UNPAID_CHARGE_STATUSES = new Set(["scheduled", "sent", "overdue"]);

function formatBreakdownAmount(amountCents: number): string {
  if (amountCents < 0) {
    return `−${formatCents(Math.abs(amountCents))}`;
  }
  return formatCents(amountCents);
}

function badgeStyles(C: AdminThemeTokens, tone: ChargeStatusBadgeTone) {
  switch (tone) {
    case "success":
      return { backgroundColor: C.successBg, color: C.success };
    case "warning":
      return { backgroundColor: C.warningBg, color: C.warning };
    case "danger":
      return { backgroundColor: C.errorBg, color: C.error };
    default:
      return { backgroundColor: C.elevated, color: C.textSecondary };
  }
}

export default function ParentBillingChargeRow({
  C,
  charge,
  adjustmentsForAssignment,
  payingChargeId,
  highlighted = false,
  autopayEnabled = false,
  onPay,
  readOnly = false,
}: ParentBillingChargeRowProps) {
  const breakdown = buildChargeAdjustmentBreakdown({
    baseAmountCents: charge.baseAmountCents,
    amountCents: charge.amountCents,
    adjustments: adjustmentsForAssignment,
  });

  const remainingCents = chargeRemainingCents(charge);
  const amountDisplay = formatParentChargeAmountLabel(charge);
  const showBreakdown =
    charge.chargeType !== "late_fee" && charge.baseAmountCents !== charge.amountCents;
  const totalLine = breakdown.find((line) => line.kind === "total");
  const statusBadge = formatParentChargeStatusBadge(charge);
  const dueLine = formatParentChargeDueLine(charge);
  const showAutopayHint =
    autopayEnabled && UNPAID_CHARGE_STATUSES.has(charge.status) && remainingCents > 0;

  return (
    <div
      data-testid="parent-billing-charge-row"
      data-charge-id={charge.id}
      className="flex items-start justify-between gap-3 px-4 py-3 rounded-lg text-sm transition-shadow"
      style={{
        backgroundColor: C.surface,
        border: `1px solid ${highlighted ? C.accent : C.border}`,
        boxShadow: highlighted ? `0 0 0 2px ${C.accentLight}` : undefined,
      }}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p style={{ color: C.textPrimary }}>{charge.label}</p>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide"
            style={badgeStyles(C, statusBadge.tone)}
            data-testid="parent-billing-charge-status-badge"
          >
            {statusBadge.label}
          </span>
        </div>
        <p className="text-xs mt-0.5" style={{ color: C.textTertiary }}>
          {dueLine}
        </p>
        {showAutopayHint ? (
          <p
            className="text-xs mt-1"
            style={{ color: C.textSecondary }}
            data-testid="parent-billing-charge-autopay-hint"
          >
            Autopay on due date
          </p>
        ) : null}
        {showBreakdown ? (
          <div
            className="mt-2 space-y-1 text-xs"
            data-testid="parent-billing-charge-breakdown"
          >
            {breakdown
              .filter((line) => line.kind !== "total")
              .map((line, index) => (
                <div
                  key={`${line.kind}-${line.label}-${index}`}
                  className="flex items-center justify-between gap-3"
                >
                  <span style={{ color: C.textSecondary }}>{line.label}</span>
                  <span
                    style={{
                      color:
                        line.kind === "adjustment" ? C.textSecondary : C.textPrimary,
                    }}
                  >
                    {formatBreakdownAmount(line.amountCents)}
                  </span>
                </div>
              ))}
            {totalLine ? (
              <div
                className="flex items-center justify-between gap-3 pt-1 font-medium"
                style={{ color: C.textPrimary }}
              >
                <span>{totalLine.label}</span>
                <span>{formatCents(totalLine.amountCents)}</span>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2 pt-0.5">
        {!showBreakdown ? (
          <span
            className="font-medium"
            style={{ color: amountDisplay.isPaid ? C.success : C.textPrimary }}
          >
            {amountDisplay.text}
          </span>
        ) : null}
        {charge.status !== "paid" && charge.status !== "void" ? (
          <button
            type="button"
            onClick={() => {
              if (readOnly) return;
              onPay(charge.id);
            }}
            disabled={readOnly || payingChargeId === charge.id}
            aria-label={showAutopayHint ? "Pay early" : "Pay charge"}
            className="text-xs font-medium px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: C.accentLight, color: C.accent }}
          >
            {payingChargeId === charge.id ? "…" : readOnly ? "Pay (preview)" : "Pay"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
