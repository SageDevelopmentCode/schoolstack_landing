"use client";

import {
  formatParentChargeAmountLabel,
  formatParentChargeDueLine,
  formatParentChargeStatusBadge,
  type ChargeStatusBadgeTone,
} from "@/lib/tuition/charge-status-display";
import { buildChargeAdjustmentBreakdown, formatCents } from "@/lib/tuition/pricing";
import { chargeRemainingCents } from "@/lib/tuition/billing-splits";
import {
  PAY_AHEAD_REDUCTION_HINT,
  PAY_AHEAD_REDUCTION_LABEL,
} from "@/lib/tuition/tuition-pay-copy";
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
    case "info":
      return { backgroundColor: C.infoBg, color: C.info };
    case "accent":
      return { backgroundColor: C.accentLight, color: C.accent };
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
  const hasPayAheadReduction = breakdown.some(
    (line) => line.label === PAY_AHEAD_REDUCTION_LABEL,
  );
  const statusBadge = formatParentChargeStatusBadge(charge);
  const dueLine = formatParentChargeDueLine(charge);
  const showAutopayHint =
    autopayEnabled && UNPAID_CHARGE_STATUSES.has(charge.status) && remainingCents > 0;
  const canPay = charge.status !== "paid" && charge.status !== "void" && remainingCents > 0;

  return (
    <div
      data-testid="parent-billing-charge-row"
      data-charge-id={charge.id}
      className="grid grid-cols-1 gap-3 rounded-[15px] border px-4 py-4 text-sm transition-shadow lg:grid-cols-[1.2fr_0.8fr_0.6fr_auto] lg:items-center lg:gap-3"
      style={{
        backgroundColor: C.surface,
        border: `1px solid ${highlighted ? C.accent : C.border}`,
        boxShadow: highlighted ? `0 0 0 2px ${C.accentLight}` : C.shadowCard,
      }}
    >
      <div className="min-w-0">
        <p className="text-[13px] font-semibold" style={{ color: C.textPrimary }}>
          {charge.label}
        </p>
        <p className="mt-0.5 text-[11px]" style={{ color: C.textTertiary }}>
          {dueLine}
        </p>
        {showAutopayHint ? (
          <p
            className="mt-1 text-[11px]"
            style={{ color: C.textSecondary }}
            data-testid="parent-billing-charge-autopay-hint"
          >
            Autopay on due date
          </p>
        ) : null}
      </div>

      <div className="min-w-0 text-[11px] leading-relaxed" style={{ color: C.textSecondary }}>
        {showBreakdown ? (
          <div data-testid="parent-billing-charge-breakdown">
            {breakdown
              .filter((line) => line.kind !== "total")
              .map((line, index) => (
                <div key={`${line.kind}-${line.label}-${index}`}>
                  {line.label} {formatBreakdownAmount(line.amountCents)}
                </div>
              ))}
            {hasPayAheadReduction ? (
              <p
                className="mt-1 text-[10px] leading-snug"
                style={{ color: C.textTertiary }}
                data-testid="parent-billing-charge-pay-ahead-hint"
              >
                {PAY_AHEAD_REDUCTION_HINT}
              </p>
            ) : null}
          </div>
        ) : (
          <span style={{ color: C.textTertiary }}>—</span>
        )}
      </div>

      <div className="min-w-0">
        <p className="text-[13px] font-bold" style={{ color: C.textPrimary }}>
          {showBreakdown && totalLine
            ? formatCents(totalLine.amountCents)
            : amountDisplay.text}
        </p>
        <span
          className="mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold"
          style={badgeStyles(C, statusBadge.tone)}
          data-testid="parent-billing-charge-status-badge"
        >
          {statusBadge.label}
        </span>
      </div>

      <div className="flex w-full items-center justify-end lg:w-auto lg:justify-end">
        {canPay ? (
          <button
            type="button"
            onClick={() => {
              if (readOnly) return;
              onPay(charge.id);
            }}
            disabled={readOnly || payingChargeId === charge.id}
            aria-label={showAutopayHint ? "Pay early" : "Pay charge"}
            className="w-full rounded-lg px-2.5 py-1.5 text-[11px] font-bold disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            style={{ backgroundColor: C.accent, color: "#fff" }}
          >
            {payingChargeId === charge.id ? "…" : readOnly ? "Pay (preview)" : "Pay"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
