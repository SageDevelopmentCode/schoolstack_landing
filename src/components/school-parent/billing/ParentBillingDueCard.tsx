"use client";

import { CreditCard, Loader2 } from "lucide-react";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import ParentNeedsScheduleBadge from "@/components/school-parent/billing/ParentNeedsScheduleBadge";
import { formatCents } from "@/lib/tuition/pricing";
import {
  formatBillingDueDate,
  formatDueCountdown,
} from "@/lib/tuition/due-date-display";
import type { ParentBillingNextCharge } from "@/lib/tuition/parent-billing-summary";
import type { ParentLastPaymentDaySummary } from "@/lib/tuition/payments";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  EXTRA_PAY_BUTTON_LABEL,
} from "@/lib/tuition/tuition-pay-copy";

type ParentBillingDueCardProps = {
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  balanceDueCents: number;
  nextCharge: ParentBillingNextCharge | null;
  nextChargeId: string | null;
  payNowLabel: string;
  payingChargeId: string | null;
  payingCombined: boolean;
  chargesOnEarliestDueDate?: number;
  onPay: (chargeId: string) => void;
  onPayCombined?: () => void;
  canPayExtra?: boolean;
  onPayExtra?: (chargeId: string) => void;
  autopayEnabled?: boolean;
  hasMultipleChildren?: boolean;
  hasPendingSchedule?: boolean;
  familyTotalRemainingCents?: number | null;
  showEstimatedAnnual?: boolean;
  estimatedAnnualCents?: number;
  lastPaymentSummary?: ParentLastPaymentDaySummary | null;
  showLastPayment?: boolean;
  readOnly?: boolean;
  testId?: string;
  payButtonTestId?: string;
};

function formatStudentNamesForLastPayment(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0]!;
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

export default function ParentBillingDueCard({
  theme,
  C,
  balanceDueCents,
  nextCharge,
  nextChargeId,
  payNowLabel,
  payingChargeId,
  payingCombined,
  chargesOnEarliestDueDate = 1,
  onPay,
  onPayCombined,
  canPayExtra = false,
  onPayExtra,
  autopayEnabled = false,
  hasMultipleChildren = false,
  hasPendingSchedule = false,
  familyTotalRemainingCents = null,
  showEstimatedAnnual = false,
  estimatedAnnualCents = 0,
  lastPaymentSummary = null,
  showLastPayment = false,
  readOnly = false,
  testId = "parent-billing-summary",
  payButtonTestId = "parent-billing-family-pay-now",
}: ParentBillingDueCardProps) {
  const dueCountdown = nextCharge ? formatDueCountdown(nextCharge.dueDate) : null;
  const showDueCountdown =
    dueCountdown != null &&
    (dueCountdown.urgency === "overdue" || dueCountdown.urgency === "urgent");
  const useCombinedPay = chargesOnEarliestDueDate > 1 && onPayCombined != null;
  const payDisabled =
    readOnly ||
    payingCombined ||
    (useCombinedPay ? false : payingChargeId === nextChargeId);
  const isPaying = payingCombined || payingChargeId === nextChargeId;

  const lastPaymentDateLabel = lastPaymentSummary?.paidAt
    ? formatBillingDueDate(lastPaymentSummary.paidAt.slice(0, 10))
    : null;
  const lastPaymentStudentLabel =
    showLastPayment && lastPaymentSummary?.studentFirstNames.length
      ? ` for ${formatStudentNamesForLastPayment(lastPaymentSummary.studentFirstNames)}`
      : "";

  const dueLine = nextCharge
    ? `Due ${formatBillingDueDate(nextCharge.dueDate)}${
        showDueCountdown ? ` · ${dueCountdown!.label}` : ""
      }`
    : null;

  return (
    <ParentCard theme={theme} variant="today" className="!p-6" data-testid={testId}>
      <ParentSectionKicker theme={theme}>Next payment</ParentSectionKicker>

      {nextCharge ? (
        <div className="flex flex-wrap items-center gap-2">
          {autopayEnabled && balanceDueCents > 0 ? (
            <ParentChip theme={theme} tone="info">
              Autopay on
            </ParentChip>
          ) : null}
          {hasPendingSchedule && !hasMultipleChildren ? (
            <ParentNeedsScheduleBadge C={C} label="Schedule needed" />
          ) : null}
        </div>
      ) : null}

      <p
        className="font-heading text-[clamp(2rem,5vw,2.5rem)] font-semibold leading-[0.95] tracking-[-0.04em]"
        style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
      >
        {formatCents(balanceDueCents)}
      </p>

      {dueLine ? (
        <p className="mb-4 mt-1 text-[13px]" style={{ color: theme.muted }}>
          {dueLine}
          {hasMultipleChildren && balanceDueCents > 0 ? " · Family total due" : ""}
        </p>
      ) : (
        <p className="mb-4 mt-1 text-[13px]" style={{ color: theme.muted }}>
          No payment due right now
        </p>
      )}

      {familyTotalRemainingCents != null && familyTotalRemainingCents > 0 ? (
        <p className="mb-4 text-[13px]" style={{ color: theme.muted }}>
          Family total remaining: {formatCents(familyTotalRemainingCents)}
        </p>
      ) : null}

      {showEstimatedAnnual && estimatedAnnualCents > 0 ? (
        <p className="mb-4 text-[13px]" style={{ color: theme.muted }}>
          Estimated annual tuition: {formatCents(estimatedAnnualCents)}
        </p>
      ) : null}

      {lastPaymentSummary && lastPaymentDateLabel ? (
        <div
          className="mb-4 inline-flex rounded-lg px-3 py-2 text-sm"
          style={{
            backgroundColor: theme.successBg,
            color: theme.success,
            border: `1px solid ${theme.line}`,
          }}
          data-testid="parent-billing-last-payment-banner"
        >
          Last payment: {formatCents(lastPaymentSummary.amountCents)} on{" "}
          {lastPaymentDateLabel}
          {lastPaymentStudentLabel}
        </div>
      ) : null}

      {autopayEnabled && nextCharge && balanceDueCents > 0 ? (
        <p
          className="mb-4 text-xs"
          style={{ color: theme.muted }}
          data-testid="parent-billing-pay-early-hint"
        >
          Autopay will charge your saved card on the due date. Pay early anytime if you
          prefer.
        </p>
      ) : null}

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
        {nextCharge && (useCombinedPay || nextChargeId) ? (
          <ParentButton
            theme={theme}
            variant="primary"
            disabled={payDisabled}
            onClick={() => {
              if (readOnly) return;
              if (useCombinedPay) {
                onPayCombined?.();
                return;
              }
              if (nextChargeId) onPay(nextChargeId);
            }}
            className="inline-flex w-full items-center justify-center gap-2 sm:w-auto"
            data-testid={payButtonTestId}
          >
            {isPaying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            {payNowLabel}
            {readOnly ? " (preview)" : ""}
          </ParentButton>
        ) : null}
        {canPayExtra && onPayExtra && nextChargeId && !readOnly ? (
          <ParentButton
            theme={theme}
            variant="outline"
            disabled={isPaying}
            onClick={() => onPayExtra(nextChargeId)}
            className="w-full sm:w-auto"
          >
            {EXTRA_PAY_BUTTON_LABEL}
          </ParentButton>
        ) : null}
      </div>
    </ParentCard>
  );
}
