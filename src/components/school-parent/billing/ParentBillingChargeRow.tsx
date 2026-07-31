"use client";

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
  onPay: (chargeId: string) => void;
  readOnly?: boolean;
};

function formatBreakdownAmount(amountCents: number): string {
  if (amountCents < 0) {
    return `−${formatCents(Math.abs(amountCents))}`;
  }
  return formatCents(amountCents);
}

export default function ParentBillingChargeRow({
  C,
  charge,
  adjustmentsForAssignment,
  payingChargeId,
  highlighted = false,
  onPay,
  readOnly = false,
}: ParentBillingChargeRowProps) {
  const breakdown = buildChargeAdjustmentBreakdown({
    baseAmountCents: charge.baseAmountCents,
    amountCents: charge.amountCents,
    adjustments: adjustmentsForAssignment,
  });

  const remainingCents = chargeRemainingCents(charge);
  const showBreakdown = charge.baseAmountCents !== charge.amountCents;
  const totalLine = breakdown.find((line) => line.kind === "total");

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
        <p style={{ color: C.textPrimary }}>{charge.label}</p>
        <p className="text-xs mt-0.5" style={{ color: C.textTertiary }}>
          Due {charge.dueDate} · {charge.status}
        </p>
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
          <span className="font-medium" style={{ color: C.textPrimary }}>
            {formatCents(remainingCents)}
          </span>
        ) : null}
        {charge.status !== "paid" && charge.status !== "void" && !readOnly ? (
          <button
            type="button"
            onClick={() => onPay(charge.id)}
            disabled={payingChargeId === charge.id}
            className="text-xs font-medium px-2 py-1 rounded disabled:opacity-60"
            style={{ backgroundColor: C.accentLight, color: C.accent }}
          >
            {payingChargeId === charge.id ? "…" : "Pay"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
