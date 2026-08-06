"use client";

import { CheckCircle2, ChevronRight, CreditCard, Loader2 } from "lucide-react";
import { formatCents } from "@/lib/tuition/pricing";
import {
  childFirstNameFromFullName,
  type ParentBillingFamilySummary,
} from "@/lib/tuition/parent-billing-summary";
import {
  formatBillingDueDate,
  formatDueCountdown,
  type DueCountdownUrgency,
} from "@/lib/tuition/due-date-display";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentTuitionPaymentRecord } from "@/lib/tuition/payments";
import ParentNeedsScheduleBadge from "@/components/school-parent/billing/ParentNeedsScheduleBadge";

const BILLING_ACTIVE_TOOLTIP =
  "Tuition billing is active — payment schedule confirmed";

type ParentBillingSummaryCardProps = {
  C: AdminThemeTokens;
  summary: ParentBillingFamilySummary;
  autopayEnabled: boolean;
  payingChargeId: string | null;
  payingCombined: boolean;
  onPay: (chargeId: string) => void;
  onPayCombined?: () => void;
  onAutopayToggleRequest: (enabled: boolean) => void;
  onSelectChild?: (childKey: string) => void;
  nextChargeId: string | null;
  familyPayNowLabel: string;
  chargesOnEarliestDueDate: number;
  mostRecentPayment?: ParentTuitionPaymentRecord | null;
  showStudentOnLastPayment?: boolean;
  readOnly?: boolean;
};

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
  payingCombined,
  onPay,
  onPayCombined,
  onAutopayToggleRequest,
  onSelectChild,
  nextChargeId,
  familyPayNowLabel,
  chargesOnEarliestDueDate,
  mostRecentPayment = null,
  showStudentOnLastPayment = false,
  readOnly = false,
}: ParentBillingSummaryCardProps) {
  const showBreakdown = summary.children.length > 1;
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
  const lastPaymentDateLabel = mostRecentPayment?.paidAt
    ? formatBillingDueDate(mostRecentPayment.paidAt.slice(0, 10))
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
          {mostRecentPayment && lastPaymentDateLabel ? (
            <div
              className="mt-2 inline-flex rounded-lg px-3 py-2 text-sm"
              style={{
                backgroundColor: C.successBg,
                color: C.success,
                border: `1px solid ${C.border}`,
              }}
              data-testid="parent-billing-last-payment-banner"
            >
              Last payment: {formatCents(mostRecentPayment.amountCents)} on{" "}
              {lastPaymentDateLabel}
              {showStudentOnLastPayment && mostRecentPayment.studentFirstName
                ? ` for ${mostRecentPayment.studentFirstName}`
                : ""}
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

      {showBreakdown ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wide" style={{ color: C.textTertiary }}>
            By student
          </p>
          <div className="flex flex-col gap-2">
            {summary.children.map((child) => {
              const canPay =
                child.balanceDueCents > 0 &&
                child.nextChargeId != null &&
                !readOnly;
              const isPaying = child.nextChargeId
                ? payingChargeId === child.nextChargeId
                : false;

              return (
                <div
                  key={child.childKey}
                  className="flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm"
                  style={{
                    backgroundColor: C.bg,
                    border: `1px solid ${C.border}`,
                  }}
                  data-testid={`parent-billing-child-summary-${child.childKey}`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectChild?.(child.childKey)}
                    className="min-w-0 flex flex-1 text-left rounded-md -m-1 p-1 transition-opacity hover:opacity-80"
                    data-testid={`parent-billing-child-summary-select-${child.childKey}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        className="flex items-center gap-1.5 font-medium"
                        style={{ color: C.textPrimary }}
                      >
                        {childFirstNameFromFullName(child.studentName)}
                        {child.status === "ready" ? (
                          <span
                            className="inline-flex shrink-0"
                            title={BILLING_ACTIVE_TOOLTIP}
                            aria-label={BILLING_ACTIVE_TOOLTIP}
                          >
                            <CheckCircle2
                              className="h-3.5 w-3.5"
                              style={{ color: C.success }}
                              aria-hidden
                            />
                          </span>
                        ) : null}
                        {child.status === "needs_schedule" ? (
                          <ParentNeedsScheduleBadge C={C} label="Schedule needed" />
                        ) : null}
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
                          {child.paymentPlanLabel ??
                            `Annual ${formatCents(child.annualTuitionCents)}`}
                        </span>
                      </div>
                    </div>
                  </button>
                  <div className="flex shrink-0 items-center gap-2">
                    {canPay ? (
                      <button
                        type="button"
                        disabled={isPaying}
                        onClick={(event) => {
                          event.stopPropagation();
                          onPay(child.nextChargeId!);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: C.accent, color: "#fff" }}
                        data-testid={`parent-billing-child-pay-${child.childKey}`}
                      >
                        {isPaying ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CreditCard className="h-3.5 w-3.5" />
                        )}
                        Pay {formatCents(child.balanceDueCents)}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => onSelectChild?.(child.childKey)}
                      className="rounded-md p-1 transition-opacity hover:opacity-80"
                      aria-label={`View ${childFirstNameFromFullName(child.studentName)} billing details`}
                      data-testid={`parent-billing-child-summary-chevron-${child.childKey}`}
                    >
                      <ChevronRight
                        className="h-4 w-4 shrink-0"
                        style={{ color: C.textTertiary }}
                        aria-hidden
                      />
                    </button>
                  </div>
                </div>
              );
            })}
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
