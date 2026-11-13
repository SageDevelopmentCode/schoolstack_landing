"use client";

import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import ParentBillingDueCard from "@/components/school-parent/billing/ParentBillingDueCard";
import ParentBillingPaymentSettingsCard from "@/components/school-parent/billing/ParentBillingPaymentSettingsCard";
import ParentBillingPaymentHistoryRow from "@/components/school-parent/billing/ParentBillingPaymentHistoryRow";
import ParentBillingTaxCreditBanner from "@/components/school-parent/billing/ParentBillingTaxCreditBanner";
import ParentNeedsScheduleBadge from "@/components/school-parent/billing/ParentNeedsScheduleBadge";
import {
  GCard,
  GChip,
  GProgress,
  PANEL_TINTS,
  SPRINGY,
  G_FOCUS,
} from "@/components/school-parent/garden/ui";
import {
  childFirstNameFromFullName,
  type ParentBillingChildView,
  type ParentBillingFamilySummary,
} from "@/lib/tuition/parent-billing-summary";
import { formatCents } from "@/lib/tuition/pricing";
import { formatBillingDueDate } from "@/lib/tuition/due-date-display";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { ParentLastPaymentDaySummary, ParentTuitionPaymentRecord } from "@/lib/tuition/payments";
import type { SavedPaymentMethodSummary } from "@/lib/tuition/payment-methods";

const BILLING_ACTIVE_TOOLTIP =
  "Tuition billing is active — payment schedule confirmed";

type ParentBillingSummaryPanelProps = {
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  summary: ParentBillingFamilySummary;
  childViews: ParentBillingChildView[];
  payments: ParentTuitionPaymentRecord[];
  studentColorMap: Map<string, number>;
  autopayEnabled: boolean;
  payingChargeId: string | null;
  payingCombined: boolean;
  savedPaymentMethod: SavedPaymentMethodSummary | null;
  paymentMethodLoading: boolean;
  nextChargeId: string | null;
  familyPayNowLabel: string;
  chargesOnEarliestDueDate: number;
  lastPaymentSummary?: ParentLastPaymentDaySummary | null;
  showTaxCreditBanner?: boolean;
  taxCreditChargeId?: string | null;
  onDismissTaxCreditBanner?: () => void;
  onApplyTaxCredit?: (chargeId: string) => void;
  /** Tuition setup tracker, shown at the top of the rail. */
  setupCard?: ReactNode;
  paymentReceived?: boolean;
  readOnly?: boolean;
  onPay: (chargeId: string) => void;
  onPayCombined?: () => void;
  onSelectChild: (childKey: string) => void;
  onAutopayToggleRequest: (enabled: boolean) => void;
  onManagePaymentMethod: () => void;
  onPaymentClick: (paymentId: string) => void;
};

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Family view: next payment + settings, each student, then all payments. */
export default function ParentBillingSummaryPanel({
  theme,
  C,
  summary,
  childViews,
  payments,
  studentColorMap,
  autopayEnabled,
  payingChargeId,
  payingCombined,
  savedPaymentMethod,
  paymentMethodLoading,
  nextChargeId,
  familyPayNowLabel,
  chargesOnEarliestDueDate,
  lastPaymentSummary = null,
  showTaxCreditBanner = false,
  taxCreditChargeId = null,
  onDismissTaxCreditBanner,
  onApplyTaxCredit,
  setupCard = null,
  paymentReceived = false,
  readOnly = false,
  onPay,
  onPayCombined,
  onSelectChild,
  onAutopayToggleRequest,
  onManagePaymentMethod,
  onPaymentClick,
}: ParentBillingSummaryPanelProps) {
  return (
    <div className="flex flex-col gap-5" data-testid="parent-billing-summary-panel">
      <div className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
        <div className="flex min-w-0 flex-col gap-5">
          {showTaxCreditBanner && onDismissTaxCreditBanner && onApplyTaxCredit ? (
            <ParentBillingTaxCreditBanner
              C={C}
              chargeId={taxCreditChargeId}
              readOnly={readOnly}
              onDismiss={onDismissTaxCreditBanner}
              onApplyTaxCredit={onApplyTaxCredit}
            />
          ) : null}
          <ParentBillingDueCard
            theme={theme}
            C={C}
            balanceDueCents={summary.balanceDueCents}
            nextCharge={summary.nextCharge}
            nextChargeId={nextChargeId}
            payNowLabel={familyPayNowLabel}
            payingChargeId={payingChargeId}
            payingCombined={payingCombined}
            chargesOnEarliestDueDate={chargesOnEarliestDueDate}
            onPay={onPay}
            onPayCombined={onPayCombined}
            autopayEnabled={autopayEnabled}
            hasMultipleChildren={childViews.length > 1}
            hasPendingSchedule={summary.hasPendingSchedule}
            familyTotalRemainingCents={summary.familyTotalRemainingCents}
            showEstimatedAnnual={
              summary.hasPendingSchedule && summary.balanceDueCents === 0
            }
            estimatedAnnualCents={summary.annualTuitionCents}
            lastPaymentSummary={lastPaymentSummary}
            showLastPayment
            paymentReceived={paymentReceived}
            readOnly={readOnly}
            testId="parent-billing-summary"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          {setupCard}
          <ParentBillingPaymentSettingsCard
            theme={theme}
            autopayEnabled={autopayEnabled}
            savedPaymentMethod={savedPaymentMethod}
            paymentMethodLoading={paymentMethodLoading}
            onAutopayToggleRequest={onAutopayToggleRequest}
            onManagePaymentMethod={onManagePaymentMethod}
            readOnly={readOnly}
          />
        </div>
      </div>

      {childViews.length > 1 ? (
        <GCard index={4} kicker="Each student" title="By student">
          <ul className="grid gap-3 sm:grid-cols-2">
            {childViews.map((child, index) => {
              const firstName = childFirstNameFromFullName(child.studentName);
              const paidCents = Math.max(
                0,
                child.annualTuitionCents - child.totalRemainingCents,
              );
              const showProgress =
                child.status === "ready" && child.annualTuitionCents > 0;

              return (
                <li key={child.childKey}>
                  <button
                    type="button"
                    onClick={() => onSelectChild(child.childKey)}
                    className={`group flex h-full w-full flex-col gap-3 rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-4 text-left hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/30 hover:bg-white ${SPRINGY} ${G_FOCUS}`}
                  >
                    <span className="flex w-full items-center gap-3">
                      <span
                        aria-hidden="true"
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-2 ring-[var(--sf-ink)] ${PANEL_TINTS[index % PANEL_TINTS.length]}`}
                      >
                        <span className="sf-display text-base text-[var(--sf-ink)]/75">
                          {initials(child.studentName)}
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="sf-display text-[1.2rem] leading-tight text-[var(--sf-ink)]">
                            {firstName}
                          </span>
                          {child.status === "ready" ? (
                            <span
                              className="inline-flex shrink-0"
                              title={BILLING_ACTIVE_TOOLTIP}
                              aria-label={BILLING_ACTIVE_TOOLTIP}
                            >
                              <Tick
                                className="h-5 w-5"
                                color="var(--sf-forest)"
                                fill="var(--sf-mint)"
                              />
                            </span>
                          ) : null}
                          {child.status === "needs_schedule" ? (
                            <ParentNeedsScheduleBadge C={C} label="Schedule needed" />
                          ) : null}
                        </span>
                        <span className="mt-0.5 block text-[13px] font-semibold text-[var(--sf-soft)]">
                          {child.paymentPlanLabel ??
                            `Annual ${formatCents(child.annualTuitionCents)}`}
                        </span>
                      </span>
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/40 transition-transform duration-300 group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </span>

                    {child.balanceDueCents > 0 ? (
                      <GChip tone="alert">
                        {child.nextCharge
                          ? `Due ${formatBillingDueDate(child.nextCharge.dueDate)} · ${formatCents(child.balanceDueCents)}`
                          : `Due ${formatCents(child.balanceDueCents)}`}
                      </GChip>
                    ) : null}

                    {showProgress ? (
                      <span className="block w-full">
                        <GProgress
                          value={paidCents}
                          total={child.annualTuitionCents}
                          done={child.totalRemainingCents === 0}
                          label={`${firstName}'s tuition paid so far`}
                        />
                        <span className="mt-1.5 block text-xs font-bold text-[var(--sf-ink)]/60">
                          {child.totalRemainingCents > 0
                            ? `${formatCents(child.totalRemainingCents)} left this year`
                            : "Paid in full for the year"}
                        </span>
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </GCard>
      ) : null}

      <GCard
        index={5}
        kicker="History"
        title="All family payments"
        data-testid="parent-billing-all-family-payments"
        action={
          payments.length > 0 ? (
            <GChip tone="neutral">
              {payments.length} on file
            </GChip>
          ) : null
        }
      >
        {payments.length > 0 ? (
          <ul className="sf-paper -mx-1 flex flex-col rounded-xl px-1">
            {payments.map((payment) => (
              <li key={payment.id}>
                <ParentBillingPaymentHistoryRow
                  C={C}
                  theme={theme}
                  payment={payment}
                  showStudentBadge
                  badgeColorIndex={studentColorMap.get(payment.enrollmentId ?? "") ?? 0}
                  onClick={() => onPaymentClick(payment.id)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 text-[15px] font-semibold text-[var(--sf-soft)]">
            No payments yet.
          </p>
        )}
      </GCard>
    </div>
  );
}
