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
import type { ParentLastPaymentDaySummary } from "@/lib/tuition/payments";
import ParentNeedsScheduleBadge from "@/components/school-parent/billing/ParentNeedsScheduleBadge";

type ParentBillingFamilyHeaderProps = {
  C: AdminThemeTokens;
  summary: ParentBillingFamilySummary;
  autopayEnabled: boolean;
  payingChargeId: string | null;
  payingCombined: boolean;
  onPay: (chargeId: string) => void;
  onPayCombined?: () => void;
  nextChargeId: string | null;
  familyPayNowLabel: string;
  chargesOnEarliestDueDate: number;
  lastPaymentSummary?: ParentLastPaymentDaySummary | null;
  showStudentOnLastPayment?: boolean;
  readOnly?: boolean;
};

function formatStudentNamesForLastPayment(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0]!;
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function countdownColor(C: AdminThemeTokens, urgency: DueCountdownUrgency): string {
  if (urgency === "overdue") return C.error;
  if (urgency === "urgent") return C.warning;
  if (urgency === "soon") return C.textSecondary;
  return C.textTertiary;
}

export default function ParentBillingFamilyHeader({
  C,
  summary,
  autopayEnabled,
  payingChargeId,
  payingCombined,
  onPay,
  onPayCombined,
  nextChargeId,
  familyPayNowLabel,
  chargesOnEarliestDueDate,
  lastPaymentSummary = null,
  showStudentOnLastPayment = false,
  readOnly = false,
}: ParentBillingFamilyHeaderProps) {
  const hasMultipleChildren = summary.children.length > 1;
  const showEstimatedAnnual =
    summary.hasPendingSchedule && summary.balanceDueCents === 0;
  const dueCountdown = summary.nextCharge
    ? formatDueCountdown(summary.nextCharge.dueDate)
    : null;
  const showDueCountdown =
    dueCountdown != null &&
    (dueCountdown.urgency === "overdue" || dueCountdown.urgency === "urgent");
  const useCombinedPay = chargesOnEarliestDueDate > 1 && onPayCombined != null;
  const familyPayDisabled =
    readOnly ||
    payingCombined ||
    (useCombinedPay ? false : payingChargeId === nextChargeId);
  const lastPaymentDateLabel = lastPaymentSummary?.paidAt
    ? formatBillingDueDate(lastPaymentSummary.paidAt.slice(0, 10))
    : null;
  const lastPaymentStudentLabel =
    showStudentOnLastPayment && lastPaymentSummary?.studentFirstNames.length
      ? ` for ${formatStudentNamesForLastPayment(lastPaymentSummary.studentFirstNames)}`
      : "";

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4"
      style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
      data-testid="parent-billing-summary"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {summary.nextCharge ? (
            <div className="flex flex-col gap-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className="flex flex-wrap items-center gap-x-2 text-sm font-medium"
                  style={{ color: C.textPrimary }}
                >
                  <span>Due {formatBillingDueDate(summary.nextCharge.dueDate)}</span>
                  {showDueCountdown ? (
                    <span
                      className="font-normal"
                      style={{ color: countdownColor(C, dueCountdown.urgency) }}
                      data-testid="parent-billing-due-countdown"
                    >
                      {dueCountdown.label}
                    </span>
                  ) : null}
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
              {hasMultipleChildren ? (
                <p className="text-xs mt-0.5" style={{ color: C.textTertiary }}>
                  Family total due
                </p>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs uppercase tracking-wide" style={{ color: C.textTertiary }}>
                Balance due
              </p>
              {summary.hasPendingSchedule && !hasMultipleChildren ? (
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
          {lastPaymentSummary && lastPaymentDateLabel ? (
            <div
              className="mt-2 inline-flex rounded-lg px-3 py-2 text-sm"
              style={{
                backgroundColor: C.successBg,
                color: C.success,
                border: `1px solid ${C.border}`,
              }}
              data-testid="parent-billing-last-payment-banner"
            >
              Last payment: {formatCents(lastPaymentSummary.amountCents)} on{" "}
              {lastPaymentDateLabel}
              {lastPaymentStudentLabel}
            </div>
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
        {summary.nextCharge && (useCombinedPay || nextChargeId) ? (
          <button
            type="button"
            disabled={familyPayDisabled}
            onClick={() => {
              if (readOnly) return;
              if (useCombinedPay) {
                onPayCombined?.();
                return;
              }
              if (nextChargeId) onPay(nextChargeId);
            }}
            className="inline-flex shrink-0 items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: C.accent, color: "#fff" }}
            data-testid="parent-billing-family-pay-now"
          >
            {payingCombined || payingChargeId === nextChargeId ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CreditCard className="w-4 h-4" />
            )}
            {familyPayNowLabel}
            {readOnly ? " (preview)" : ""}
          </button>
        ) : null}
      </div>
    </div>
  );
}
