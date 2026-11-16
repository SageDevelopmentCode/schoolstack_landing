"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarClock, CreditCard, Loader2, PartyPopper } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import ParentNeedsScheduleBadge from "@/components/school-parent/billing/ParentNeedsScheduleBadge";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import { GCard, GChip, gBtnOutlineSm, gBtnPop } from "@/components/school-parent/garden/ui";
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

/** DOM id of the "Next payment" card (the setup tracker scrolls here). */
export const PARENT_BILLING_NEXT_PAYMENT_ID = "parent-billing-next-payment";

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
  /** Pay button is the page's one toy button unless another step owns it. */
  primary?: boolean;
  /** Brief "payment received" state after returning from checkout. */
  paymentReceived?: boolean;
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

/** "Next payment" card: the billing page's primary task. */
export default function ParentBillingDueCard({
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
  primary = true,
  paymentReceived = false,
  readOnly = false,
  testId = "parent-billing-summary",
  payButtonTestId = "parent-billing-family-pay-now",
}: ParentBillingDueCardProps) {
  const reduce = useReducedMotion() === true;
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
    ? `Due ${formatBillingDueDate(nextCharge.dueDate)}`
    : null;
  const nothingDue = balanceDueCents <= 0;

  return (
    <GCard
      index={1}
      id={PARENT_BILLING_NEXT_PAYMENT_ID}
      kicker="Next payment"
      title={
        !nothingDue ? "Ready to pay" : hasPendingSchedule ? "Nothing due yet" : "All caught up"
      }
      data-testid={testId}
      action={
        nextCharge ? (
          <div className="flex flex-wrap items-center gap-2">
            {autopayEnabled && balanceDueCents > 0 ? (
              <GChip tone="info">Autopay on</GChip>
            ) : null}
            {hasPendingSchedule && !hasMultipleChildren ? (
              <ParentNeedsScheduleBadge C={C} label="Schedule needed" />
            ) : null}
          </div>
        ) : null
      }
    >
      <AnimatePresence initial={false}>
        {paymentReceived ? (
          <motion.div
            key="received"
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: PORTAL_EASE }}
            className="overflow-hidden"
          >
            <div
              className="mb-4 flex items-center gap-3 rounded-[16px] bg-[var(--sf-mint)] px-4 py-3"
              role="status"
            >
              <PartyPopper className="h-5 w-5 shrink-0 text-[var(--sf-forest)]" aria-hidden />
              <p className="m-0 text-sm font-extrabold text-[var(--sf-forest)]">
                Payment received. Your balance has been updated.
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        <p className="sf-display m-0 text-[2.8rem] leading-none text-[var(--sf-ink)] tabular-nums">
          {formatCents(balanceDueCents)}
        </p>
        {showDueCountdown ? (
          <GChip
            tone={dueCountdown!.urgency === "overdue" ? "alert" : "warning"}
            className="mb-1.5"
          >
            <CalendarClock className="h-3.5 w-3.5" aria-hidden />
            {dueCountdown!.label}
          </GChip>
        ) : null}
      </div>

      <div className="mt-2 flex flex-col gap-1 text-[13px] font-semibold text-[var(--sf-soft)]">
        <p className="m-0">
          {dueLine ?? "No payment due right now"}
          {dueLine && hasMultipleChildren && balanceDueCents > 0 ? " · Family total due" : ""}
        </p>
        {familyTotalRemainingCents != null && familyTotalRemainingCents > 0 ? (
          <p className="m-0">
            Family total remaining: {formatCents(familyTotalRemainingCents)}
          </p>
        ) : null}
        {showEstimatedAnnual && estimatedAnnualCents > 0 ? (
          <p className="m-0">
            Estimated annual tuition: {formatCents(estimatedAnnualCents)}
          </p>
        ) : null}
      </div>

      {lastPaymentSummary && lastPaymentDateLabel ? (
        <div
          className="mt-4 inline-flex items-center gap-2 self-start rounded-full bg-[var(--sf-mint)] py-1.5 pl-1.5 pr-3.5 text-[13px] font-bold text-[var(--sf-forest)]"
          data-testid="parent-billing-last-payment-banner"
        >
          <Tick className="h-6 w-6" color="var(--sf-forest)" fill="#fff" />
          <span>
            Last payment: {formatCents(lastPaymentSummary.amountCents)} on{" "}
            {lastPaymentDateLabel}
            {lastPaymentStudentLabel}
          </span>
        </div>
      ) : null}

      {autopayEnabled && nextCharge && balanceDueCents > 0 ? (
        <p
          className="m-0 mt-4 text-[13px] font-semibold text-[var(--sf-soft)]"
          data-testid="parent-billing-pay-early-hint"
        >
          Autopay will charge your saved card on the due date. Pay early anytime if you
          prefer.
        </p>
      ) : null}

      {(nextCharge && (useCombinedPay || nextChargeId)) ||
      (canPayExtra && onPayExtra && nextChargeId && !readOnly) ? (
        <div className="mt-5 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          {nextCharge && (useCombinedPay || nextChargeId) ? (
            <button
              type="button"
              disabled={payDisabled}
              aria-busy={isPaying || undefined}
              onClick={() => {
                if (readOnly) return;
                if (useCombinedPay) {
                  onPayCombined?.();
                  return;
                }
                if (nextChargeId) onPay(nextChargeId);
              }}
              className={`${primary ? gBtnPop : gBtnOutlineSm} w-full sm:w-auto`}
              data-testid={payButtonTestId}
              data-pay-primary=""
            >
              {isPaying ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <CreditCard className="h-4 w-4" aria-hidden />
              )}
              {payNowLabel}
              {readOnly ? " (preview)" : ""}
            </button>
          ) : null}
          {canPayExtra && onPayExtra && nextChargeId && !readOnly ? (
            <button
              type="button"
              disabled={isPaying}
              onClick={() => onPayExtra(nextChargeId)}
              className={`${gBtnOutlineSm} w-full sm:w-auto`}
            >
              {EXTRA_PAY_BUTTON_LABEL}
            </button>
          ) : null}
          {!readOnly && nextCharge ? (
            <span className="text-xs font-semibold text-[var(--sf-soft)] sm:ml-1">
              Card or bank · secure checkout
            </span>
          ) : null}
        </div>
      ) : null}
    </GCard>
  );
}
