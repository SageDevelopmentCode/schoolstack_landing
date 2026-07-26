"use client";

import { CreditCard, Loader2 } from "lucide-react";
import { formatCents } from "@/lib/tuition/pricing";
import type { ParentBillingFamilySummary } from "@/lib/tuition/parent-billing-summary";
import {
  formatBillingDueDate,
  formatDueCountdown,
  type DueCountdownUrgency,
} from "@/lib/tuition/due-date-display";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import ParentNeedsScheduleBadge from "@/components/school-parent/billing/ParentNeedsScheduleBadge";

type ParentBillingSummaryCardProps = {
  C: AdminThemeTokens;
  summary: ParentBillingFamilySummary;
  autopayEnabled: boolean;
  payingChargeId: string | null;
  onPay: (chargeId: string) => void;
  onAutopayToggle: () => void;
  nextChargeId: string | null;
};

function childFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

function statusLabel(status: ParentBillingFamilySummary["children"][number]["status"]) {
  if (status === "needs_schedule") return "Schedule needed";
  if (status === "ready") return "Active";
  return "Not assigned";
}

function countdownColor(C: AdminThemeTokens, urgency: DueCountdownUrgency): string {
  if (urgency === "overdue") return C.error;
  if (urgency === "urgent") return C.warning;
  if (urgency === "soon") return C.textSecondary;
  return C.textTertiary;
}

export default function ParentBillingSummaryCard({
  C,
  summary,
  autopayEnabled,
  payingChargeId,
  onPay,
  onAutopayToggle,
  nextChargeId,
}: ParentBillingSummaryCardProps) {
  const showBreakdown = summary.children.length > 1;
  const showEstimatedAnnual =
    summary.hasPendingSchedule && summary.balanceDueCents === 0;
  const dueCountdown = summary.nextCharge
    ? formatDueCountdown(summary.nextCharge.dueDate)
    : null;

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-5"
      style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
      data-testid="parent-billing-summary"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {summary.nextCharge ? (
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
                Due {formatBillingDueDate(summary.nextCharge.dueDate)}
              </p>
              {dueCountdown ? (
                <p
                  className="text-xs"
                  style={{ color: countdownColor(C, dueCountdown.urgency) }}
                >
                  {dueCountdown.label}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-xs uppercase tracking-wide" style={{ color: C.textTertiary }}>
              Balance due
            </p>
          )}
          <p className="text-3xl font-semibold mt-1" style={{ color: C.textPrimary }}>
            {formatCents(summary.balanceDueCents)}
          </p>
          {summary.totalRemainingCents > summary.balanceDueCents ? (
            <p className="text-sm mt-2" style={{ color: C.textSecondary }}>
              Total remaining: {formatCents(summary.totalRemainingCents)}
            </p>
          ) : null}
          {showEstimatedAnnual ? (
            <p className="text-sm mt-2" style={{ color: C.textSecondary }}>
              Estimated annual tuition: {formatCents(summary.annualTuitionCents)}
            </p>
          ) : null}
        </div>
        {summary.nextCharge && nextChargeId ? (
          <button
            type="button"
            disabled={payingChargeId === nextChargeId}
            onClick={() => onPay(nextChargeId)}
            className="inline-flex shrink-0 items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: C.accent, color: "#fff" }}
          >
            {payingChargeId === nextChargeId ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CreditCard className="w-4 h-4" />
            )}
            Pay now
          </button>
        ) : null}
      </div>

      {showBreakdown ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wide" style={{ color: C.textTertiary }}>
            By student
          </p>
          <div className="flex flex-col gap-2">
            {summary.children.map((child) => (
              <div
                key={child.childKey}
                className="flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm"
                style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
                data-testid={`parent-billing-child-summary-${child.childKey}`}
              >
                <div className="min-w-0">
                  <p className="font-medium" style={{ color: C.textPrimary }}>
                    {childFirstName(child.studentName)}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {child.balanceDueCents > 0 ? (
                      <span
                        className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium"
                        style={{
                          backgroundColor: C.accentLight,
                          color: C.accent,
                        }}
                      >
                        Due {formatCents(child.balanceDueCents)}
                      </span>
                    ) : null}
                    <span className="text-xs" style={{ color: C.textTertiary }}>
                      Annual {formatCents(child.annualTuitionCents)}
                    </span>
                  </div>
                </div>
                {child.status === "needs_schedule" ? (
                  <ParentNeedsScheduleBadge C={C} label="Schedule needed" />
                ) : (
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={{
                      backgroundColor: C.elevated,
                      color: C.textSecondary,
                    }}
                  >
                    {statusLabel(child.status)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <label className="flex items-center gap-2 text-sm" style={{ color: C.textSecondary }}>
        <input type="checkbox" checked={autopayEnabled} onChange={onAutopayToggle} />
        Enable autopay for due charges
      </label>
    </div>
  );
}
