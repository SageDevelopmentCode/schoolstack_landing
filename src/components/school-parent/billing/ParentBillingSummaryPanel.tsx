"use client";

import { CheckCircle2, ChevronRight } from "lucide-react";
import ParentBillingDueCard from "@/components/school-parent/billing/ParentBillingDueCard";
import ParentBillingPaymentSettingsCard from "@/components/school-parent/billing/ParentBillingPaymentSettingsCard";
import ParentBillingPaymentHistoryRow from "@/components/school-parent/billing/ParentBillingPaymentHistoryRow";
import ParentBillingTaxCreditBanner from "@/components/school-parent/billing/ParentBillingTaxCreditBanner";
import ParentNeedsScheduleBadge from "@/components/school-parent/billing/ParentNeedsScheduleBadge";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
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
  readOnly?: boolean;
  onPay: (chargeId: string) => void;
  onPayCombined?: () => void;
  onSelectChild: (childKey: string) => void;
  onAutopayToggleRequest: (enabled: boolean) => void;
  onManagePaymentMethod: () => void;
  onPaymentClick: (paymentId: string) => void;
};

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
  readOnly = false,
  onPay,
  onPayCombined,
  onSelectChild,
  onAutopayToggleRequest,
  onManagePaymentMethod,
  onPaymentClick,
}: ParentBillingSummaryPanelProps) {
  return (
    <div
      className="flex flex-col gap-8"
      data-testid="parent-billing-summary-panel"
    >
      {showTaxCreditBanner && onDismissTaxCreditBanner && onApplyTaxCredit ? (
        <ParentBillingTaxCreditBanner
          C={C}
          chargeId={taxCreditChargeId}
          readOnly={readOnly}
          onDismiss={onDismissTaxCreditBanner}
          onApplyTaxCredit={onApplyTaxCredit}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_0.75fr]">
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
          readOnly={readOnly}
          testId="parent-billing-summary"
        />
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

      {childViews.length > 1 ? (
        <section>
          <ParentDisplayHeading theme={theme} as="h2" size="section" className="!text-[21px] mb-3">
            By student
          </ParentDisplayHeading>
          <div className="flex flex-col gap-2">
            {childViews.map((child) => {
              const firstName = childFirstNameFromFullName(child.studentName);

              return (
                <button
                  key={child.childKey}
                  type="button"
                  onClick={() => onSelectChild(child.childKey)}
                  className="flex items-center justify-between gap-3 rounded-[15px] border px-4 py-3 text-left text-sm transition-colors"
                  style={{
                    backgroundColor: theme.white,
                    borderColor: theme.line,
                  }}
                >
                  <div className="min-w-0">
                    <p
                      className="flex items-center gap-1.5 font-semibold text-[13px]"
                      style={{ color: theme.ink }}
                    >
                      {firstName}
                      {child.status === "ready" ? (
                        <span
                          className="inline-flex shrink-0"
                          title={BILLING_ACTIVE_TOOLTIP}
                          aria-label={BILLING_ACTIVE_TOOLTIP}
                        >
                          <CheckCircle2
                            className="h-3.5 w-3.5"
                            style={{ color: theme.success }}
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
                            backgroundColor: theme.primaryLight,
                            color: theme.primary,
                          }}
                        >
                          Due {formatBillingDueDate(child.nextCharge.dueDate)} ·{" "}
                          {formatCents(child.balanceDueCents)}
                        </span>
                      ) : child.balanceDueCents > 0 ? (
                        <span
                          className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium"
                          style={{
                            backgroundColor: theme.primaryLight,
                            color: theme.primary,
                          }}
                        >
                          Due {formatCents(child.balanceDueCents)}
                        </span>
                      ) : null}
                      <span className="text-xs" style={{ color: theme.muted }}>
                        {child.paymentPlanLabel ??
                          `Annual ${formatCents(child.annualTuitionCents)}`}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className="h-4 w-4 shrink-0"
                    style={{ color: theme.muted }}
                    aria-hidden
                  />
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <section data-testid="parent-billing-all-family-payments">
        <ParentDisplayHeading theme={theme} as="h2" size="section" className="!text-[21px] mb-3">
          All family payments
        </ParentDisplayHeading>
        {payments.length > 0 ? (
          <div className="flex flex-col gap-2">
            {payments.map((payment) => (
              <ParentBillingPaymentHistoryRow
                key={payment.id}
                C={C}
                theme={theme}
                payment={payment}
                showStudentBadge
                badgeColorIndex={
                  studentColorMap.get(payment.enrollmentId ?? "") ?? 0
                }
                onClick={() => onPaymentClick(payment.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: theme.muted }}>
            No payments yet.
          </p>
        )}
      </section>
    </div>
  );
}
