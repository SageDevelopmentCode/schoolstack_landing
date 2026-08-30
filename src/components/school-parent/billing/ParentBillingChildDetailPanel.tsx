"use client";

import { ChevronRight } from "lucide-react";
import ParentBillingChargeRow from "@/components/school-parent/billing/ParentBillingChargeRow";
import ParentBillingDueCard from "@/components/school-parent/billing/ParentBillingDueCard";
import ParentBillingPaymentHistoryRow from "@/components/school-parent/billing/ParentBillingPaymentHistoryRow";
import ParentBillingPaymentSettingsCard from "@/components/school-parent/billing/ParentBillingPaymentSettingsCard";
import ParentNeedsScheduleBadge from "@/components/school-parent/billing/ParentNeedsScheduleBadge";
import ParentTuitionPlanSelector from "@/components/school-parent/billing/ParentTuitionPlanSelector";
import { formatUpcomingChargesSummary } from "@/components/school-parent/billing/ParentBillingUpcomingChargesPanel";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import {
  childFirstNameFromFullName,
  type ParentBillingChildView,
} from "@/lib/tuition/parent-billing-summary";
import { formatCents } from "@/lib/tuition/pricing";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { TuitionAdjustment, TuitionCharge } from "@/lib/tuition/types";
import type { ParentTuitionPaymentRecord } from "@/lib/tuition/payments";
import type { SavedPaymentMethodSummary } from "@/lib/tuition/payment-methods";

type ParentBillingChildDetailPanelProps = {
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  child: ParentBillingChildView;
  charges: TuitionCharge[];
  openCharges: TuitionCharge[];
  adjustmentsByAssignment: Map<string, TuitionAdjustment[]>;
  payments: ParentTuitionPaymentRecord[];
  payingChargeId: string | null;
  autopayEnabled: boolean;
  savedPaymentMethod: SavedPaymentMethodSummary | null;
  paymentMethodLoading: boolean;
  onAutopayToggleRequest: (enabled: boolean) => void;
  onManagePaymentMethod: () => void;
  readOnly?: boolean;
  onPay: (chargeId: string) => void;
  onPayExtra?: (chargeId: string) => void;
  onScheduleComplete: () => void;
  onOpenUpcomingCharges: () => void;
  onPaymentClick: (paymentId: string) => void;
};

function sortChargesByDueDate(charges: TuitionCharge[]): TuitionCharge[] {
  return [...charges].sort((a, b) => {
    const dueCompare = a.dueDate.localeCompare(b.dueDate);
    if (dueCompare !== 0) return dueCompare;
    return (a.installmentNumber ?? 0) - (b.installmentNumber ?? 0);
  });
}

export default function ParentBillingChildDetailPanel({
  theme,
  C,
  child,
  charges,
  openCharges,
  adjustmentsByAssignment,
  payments,
  payingChargeId,
  autopayEnabled,
  savedPaymentMethod,
  paymentMethodLoading,
  onAutopayToggleRequest,
  onManagePaymentMethod,
  readOnly = false,
  onPay,
  onPayExtra,
  onScheduleComplete,
  onOpenUpcomingCharges,
  onPaymentClick,
}: ParentBillingChildDetailPanelProps) {
  const firstName = childFirstNameFromFullName(child.studentName);
  const planSubtitle =
    child.paymentPlanLabel ?? `Annual ${formatCents(child.annualTuitionCents)}`;

  const assignmentCharges = child.assignmentId
    ? charges.filter((charge) => charge.assignmentId === child.assignmentId)
    : [];
  const upcomingCharges = sortChargesByDueDate(openCharges);

  const childPayments = payments.filter(
    (payment) => payment.enrollmentId === child.childKey,
  );

  const canPayExtra =
    !readOnly &&
    child.nextChargeId != null &&
    child.totalRemainingCents > child.balanceDueCents;

  const upcomingSummary = formatUpcomingChargesSummary(openCharges);

  return (
    <div
      className="flex flex-col gap-8"
      data-testid="parent-billing-child-detail-panel"
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm" style={{ color: theme.muted }}>
          {planSubtitle}
          {child.totalRemainingCents > 0
            ? ` · ${formatCents(child.totalRemainingCents)} remaining`
            : ""}
        </p>
        {child.selectionItem || child.status === "needs_schedule" ? (
          <ParentNeedsScheduleBadge C={C} label="Schedule needed" />
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_0.75fr]">
        <ParentBillingDueCard
          theme={theme}
          C={C}
          balanceDueCents={child.balanceDueCents}
          nextCharge={child.nextCharge}
          nextChargeId={child.nextChargeId}
          payNowLabel={
            child.balanceDueCents > 0
              ? `Pay ${formatCents(child.balanceDueCents)}`
              : "Pay"
          }
          payingChargeId={payingChargeId}
          payingCombined={false}
          onPay={onPay}
          canPayExtra={canPayExtra}
          onPayExtra={onPayExtra}
          autopayEnabled={autopayEnabled}
          hasPendingSchedule={child.status === "needs_schedule"}
          readOnly={readOnly}
          testId={`parent-billing-child-due-card-${child.childKey}`}
          payButtonTestId={`parent-billing-child-pay-${child.childKey}`}
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

      {child.selectionItem ? (
        <div id="parent-tuition-plan-selector">
          <ParentTuitionPlanSelector
            C={C}
            context={child.selectionItem.context}
            studentName={child.studentName}
            onComplete={onScheduleComplete}
            readOnly={readOnly}
          />
        </div>
      ) : child.status === "needs_schedule" ? (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{
            backgroundColor: C.warningBg,
            border: `1px solid ${C.warningBorder}`,
          }}
        >
          <p className="font-medium" style={{ color: C.textPrimary }}>
            Payment schedule needed
          </p>
          <p className="mt-1" style={{ color: C.textSecondary }}>
            Choose an installment plan to generate tuition charges for {firstName}.
          </p>
        </div>
      ) : null}

      {!child.selectionItem ? (
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <ParentDisplayHeading theme={theme} as="h2" size="section" className="!text-[21px]">
              Payment schedule
            </ParentDisplayHeading>
            {upcomingCharges.length > 4 ? (
              <button
                type="button"
                onClick={onOpenUpcomingCharges}
                className="inline-flex items-center gap-1 text-[13px] font-bold"
                style={{ color: theme.primary }}
                data-testid="parent-billing-upcoming-charges-trigger-inline"
              >
                View full schedule →
              </button>
            ) : null}
          </div>
          {upcomingCharges.length > 0 ? (
            <div className="flex flex-col gap-2">
              {upcomingCharges.slice(0, 4).map((charge) => (
                <ParentBillingChargeRow
                  key={charge.id}
                  C={C}
                  charge={charge}
                  adjustmentsForAssignment={
                    adjustmentsByAssignment.get(charge.assignmentId) ?? []
                  }
                  payingChargeId={payingChargeId}
                  autopayEnabled={autopayEnabled}
                  onPay={onPay}
                  readOnly={readOnly}
                />
              ))}
              {upcomingCharges.length > 4 ? (
                <button
                  type="button"
                  onClick={onOpenUpcomingCharges}
                  className="flex w-full items-center justify-between gap-3 rounded-[15px] border px-4 py-3 text-left text-sm transition-shadow"
                  style={{
                    backgroundColor: theme.white,
                    borderColor: theme.line,
                    boxShadow: theme.shadowCard,
                  }}
                  data-testid="parent-billing-upcoming-charges-trigger-card"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[13px]" style={{ color: theme.ink }}>
                      View full schedule
                    </p>
                    {upcomingSummary ? (
                      <p className="mt-0.5 text-xs" style={{ color: theme.muted }}>
                        {upcomingSummary}
                      </p>
                    ) : null}
                  </div>
                  <ChevronRight
                    className="h-4 w-4 shrink-0"
                    style={{ color: theme.muted }}
                    aria-hidden
                  />
                </button>
              ) : null}
              <p
                className="text-sm"
                style={{ color: theme.muted }}
                data-testid="parent-billing-upcoming-total-remaining"
              >
                {formatCents(child.totalRemainingCents)} remaining on schedule
              </p>
            </div>
          ) : (
            <p className="text-sm" style={{ color: theme.muted }}>
              {assignmentCharges.length > 0
                ? "No upcoming charges."
                : "No charges on the schedule yet."}
            </p>
          )}
        </section>
      ) : null}

      <section>
        <ParentDisplayHeading theme={theme} as="h2" size="section" className="!text-[21px] mb-3">
          Payments for {firstName}
        </ParentDisplayHeading>
        {childPayments.length > 0 ? (
          <div className="flex flex-col gap-2">
            {childPayments.map((payment) => (
              <ParentBillingPaymentHistoryRow
                key={payment.id}
                C={C}
                theme={theme}
                payment={payment}
                onClick={() => onPaymentClick(payment.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: theme.muted }}>
            No payments yet for {firstName}.
          </p>
        )}
      </section>
    </div>
  );
}
