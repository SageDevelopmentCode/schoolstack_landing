"use client";

import { CheckCircle2, ChevronRight } from "lucide-react";
import ParentBillingFamilyHeader from "@/components/school-parent/billing/ParentBillingFamilyHeader";
import ParentBillingFamilySettings from "@/components/school-parent/billing/ParentBillingFamilySettings";
import ParentBillingPaymentHistoryRow from "@/components/school-parent/billing/ParentBillingPaymentHistoryRow";
import ParentBillingTaxCreditBanner from "@/components/school-parent/billing/ParentBillingTaxCreditBanner";
import ParentNeedsScheduleBadge from "@/components/school-parent/billing/ParentNeedsScheduleBadge";
import {
  childFirstNameFromFullName,
  type ParentBillingChildView,
  type ParentBillingFamilySummary,
} from "@/lib/tuition/parent-billing-summary";
import { formatCents } from "@/lib/tuition/pricing";
import { formatBillingDueDate } from "@/lib/tuition/due-date-display";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentLastPaymentDaySummary, ParentTuitionPaymentRecord } from "@/lib/tuition/payments";
import type { SavedPaymentMethodSummary } from "@/lib/tuition/payment-methods";

const BILLING_ACTIVE_TOOLTIP =
  "Tuition billing is active — payment schedule confirmed";

const SECTION_HEADING_CLASS = "text-base font-semibold mb-3";

type ParentBillingSummaryPanelProps = {
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

      <ParentBillingFamilyHeader
        C={C}
        summary={summary}
        autopayEnabled={autopayEnabled}
        payingChargeId={payingChargeId}
        payingCombined={payingCombined}
        onPay={onPay}
        onPayCombined={onPayCombined}
        nextChargeId={nextChargeId}
        familyPayNowLabel={familyPayNowLabel}
        chargesOnEarliestDueDate={chargesOnEarliestDueDate}
        lastPaymentSummary={lastPaymentSummary}
        showStudentOnLastPayment
        readOnly={readOnly}
      />

      {childViews.length > 1 ? (
        <section>
          <h2 className={SECTION_HEADING_CLASS} style={{ color: C.textPrimary }}>
            By student
          </h2>
          <div className="flex flex-col gap-2">
            {childViews.map((child) => {
              const firstName = childFirstNameFromFullName(child.studentName);

              return (
                <button
                  key={child.childKey}
                  type="button"
                  onClick={() => onSelectChild(child.childKey)}
                  className="flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-left text-sm transition-colors"
                  style={{
                    backgroundColor: C.surface,
                    border: `1px solid ${C.border}`,
                  }}
                  data-testid={`parent-billing-summary-child-row-${child.childKey}`}
                >
                  <div className="min-w-0">
                    <p
                      className="flex items-center gap-1.5 font-medium"
                      style={{ color: C.textPrimary }}
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
                  <ChevronRight
                    className="h-4 w-4 shrink-0"
                    style={{ color: C.textTertiary }}
                    aria-hidden
                  />
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <section data-testid="parent-billing-payment-autopay-section">
        <h2 className={SECTION_HEADING_CLASS} style={{ color: C.textPrimary }}>
          Payment & autopay
        </h2>
        <ParentBillingFamilySettings
          C={C}
          autopayEnabled={autopayEnabled}
          savedPaymentMethod={savedPaymentMethod}
          paymentMethodLoading={paymentMethodLoading}
          onAutopayToggleRequest={onAutopayToggleRequest}
          onManagePaymentMethod={onManagePaymentMethod}
          readOnly={readOnly}
          showPaymentMethodLabel={false}
        />
      </section>

      <section data-testid="parent-billing-all-family-payments">
        <h2 className={SECTION_HEADING_CLASS} style={{ color: C.textPrimary }}>
          All family payments
        </h2>
        {payments.length > 0 ? (
          <div className="flex flex-col gap-2">
            {payments.map((payment) => (
              <ParentBillingPaymentHistoryRow
                key={payment.id}
                C={C}
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
          <p className="text-sm" style={{ color: C.textTertiary }}>
            No payments yet.
          </p>
        )}
      </section>
    </div>
  );
}
