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
  onAutopayToggleRequest: (enabled: boolean) => void;
  nextChargeId: string | null;
  readOnly?: boolean;
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
  onAutopayToggleRequest,
  nextChargeId,
  readOnly = false,
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
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
                  Due {formatBillingDueDate(summary.nextCharge.dueDate)}
                </p>
                {autopayEnabled && summary.balanceDueCents > 0 ? (
                  <span
                    className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={{
                      backgroundColor: C.accentLight,
                      color: C.accent,
                    }}
                    data-testid="parent-billing-autopay-on-badge"
                  >
                    Autopay on
                  </span>
                ) : null}
              </div>
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
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs uppercase tracking-wide" style={{ color: C.textTertiary }}>
                Balance due
              </p>
              {summary.hasPendingSchedule && !showBreakdown ? (
                <ParentNeedsScheduleBadge C={C} label="Schedule needed" />
              ) : null}
            </div>
          )}
          <p className="text-3xl font-semibold mt-1" style={{ color: C.textPrimary }}>
            {formatCents(summary.balanceDueCents)}
          </p>
          {summary.familyTotalRemainingCents != null ? (
            <p className="text-sm mt-2" style={{ color: C.textSecondary }}>
              Family total remaining: {formatCents(summary.familyTotalRemainingCents)}
            </p>
          ) : null}
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
          {autopayEnabled && summary.nextCharge && summary.balanceDueCents > 0 ? (
            <p
              className="text-xs mt-2"
              style={{ color: C.textSecondary }}
              data-testid="parent-billing-pay-early-hint"
            >
              Autopay will charge your saved card on the due date. Pay early anytime if you
              prefer.
            </p>
          ) : null}
        </div>
        {summary.nextCharge && nextChargeId ? (
          <button
            type="button"
            disabled={readOnly || payingChargeId === nextChargeId}
            onClick={() => {
              if (readOnly) return;
              onPay(nextChargeId);
            }}
            className="inline-flex shrink-0 items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: C.accent, color: "#fff" }}
          >
            {payingChargeId === nextChargeId ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CreditCard className="w-4 h-4" />
            )}
            Pay now
            {readOnly ? " (preview)" : ""}
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
                    {child.balanceDueCents > 0 && child.nextCharge ? (
                      <span
                        className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium"
                        style={{
                          backgroundColor: C.accentLight,
                          color: C.accent,
                        }}
                      >
                        Due {formatBillingDueDate(child.nextCharge.dueDate)} ·{" "}
                        {formatCents(child.balanceDueCents)}
                      </span>
                    ) : child.balanceDueCents > 0 ? (
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

      <div
        className="flex items-center justify-between gap-4 rounded-lg px-4 py-3"
        style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
      >
        <div className="min-w-0">
          <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
            Autopay
          </p>
          <p className="text-xs mt-0.5" style={{ color: C.textSecondary }}>
            {autopayEnabled
              ? "Due charges are paid automatically with your saved card."
              : "Pay each charge manually in the parent portal."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={autopayEnabled}
          aria-label="Autopay"
          data-testid="parent-billing-autopay-toggle"
          disabled={readOnly}
          onClick={() => {
            if (readOnly) return;
            onAutopayToggleRequest(!autopayEnabled);
          }}
          className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: autopayEnabled ? C.accent : C.border,
          }}
        >
          <span
            className="inline-block h-5 w-5 rounded-full bg-white transition-transform"
            style={{
              transform: autopayEnabled ? "translateX(22px)" : "translateX(2px)",
            }}
          />
        </button>
      </div>
    </div>
  );
}
