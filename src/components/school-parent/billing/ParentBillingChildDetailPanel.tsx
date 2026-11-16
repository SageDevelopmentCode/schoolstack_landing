"use client";

import type { ReactNode } from "react";
import { ArrowRight, CalendarDays, ChevronRight, CircleAlert } from "lucide-react";
import ParentBillingChargeRow from "@/components/school-parent/billing/ParentBillingChargeRow";
import ParentBillingDueCard from "@/components/school-parent/billing/ParentBillingDueCard";
import ParentBillingPaymentHistoryRow from "@/components/school-parent/billing/ParentBillingPaymentHistoryRow";
import ParentBillingPaymentSettingsCard from "@/components/school-parent/billing/ParentBillingPaymentSettingsCard";
import ParentNeedsScheduleBadge from "@/components/school-parent/billing/ParentNeedsScheduleBadge";
import ParentTuitionPlanSelector from "@/components/school-parent/billing/ParentTuitionPlanSelector";
import { formatUpcomingChargesSummary } from "@/components/school-parent/billing/ParentBillingUpcomingChargesPanel";
import {
  GCard,
  GChip,
  GIcon,
  SPRINGY,
  G_FOCUS,
  gLinkSm,
} from "@/components/school-parent/garden/ui";
import {
  childFirstNameFromFullName,
  type ParentBillingChildView,
} from "@/lib/tuition/parent-billing-summary";
import { formatCents } from "@/lib/tuition/pricing";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { TuitionAdjustment, TuitionCharge } from "@/lib/tuition/types";
import type { ParentTuitionPaymentRecord } from "@/lib/tuition/payments";
import type { PaymentRecord } from "@/lib/stripe/application-payments";
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
  pendingPaymentByChargeId?: Map<string, PaymentRecord>;
  savedPaymentMethod: SavedPaymentMethodSummary | null;
  paymentMethodLoading: boolean;
  onAutopayToggleRequest: (enabled: boolean) => void;
  onManagePaymentMethod: () => void;
  /** Tuition setup tracker, shown at the top of the rail. */
  setupCard?: ReactNode;
  paymentReceived?: boolean;
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

/** One student's tuition: plan step (if needed), next payment, schedule, payments. */
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
  pendingPaymentByChargeId = new Map(),
  savedPaymentMethod,
  paymentMethodLoading,
  onAutopayToggleRequest,
  onManagePaymentMethod,
  setupCard = null,
  paymentReceived = false,
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
  const choosingPlan = child.selectionItem != null;

  const dueCard = (
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
      primary={!choosingPlan}
      paymentReceived={paymentReceived}
      readOnly={readOnly}
      testId={`parent-billing-child-due-card-${child.childKey}`}
      payButtonTestId={`parent-billing-child-pay-${child.childKey}`}
    />
  );

  return (
    <div className="flex flex-col gap-5" data-testid="parent-billing-child-detail-panel">
      <div className="flex flex-wrap items-center gap-2">
        <GChip tone="neutral" className="!px-3 !py-1 !text-[13px]">
          {planSubtitle}
          {child.totalRemainingCents > 0
            ? ` · ${formatCents(child.totalRemainingCents)} remaining`
            : ""}
        </GChip>
        {child.selectionItem || child.status === "needs_schedule" ? (
          <ParentNeedsScheduleBadge C={C} label="Schedule needed" />
        ) : null}
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
        <div className="flex min-w-0 flex-col gap-5">
          {child.selectionItem ? (
            <ParentTuitionPlanSelector
              C={C}
              theme={theme}
              context={child.selectionItem.context}
              studentName={child.studentName}
              onComplete={onScheduleComplete}
              readOnly={readOnly}
            />
          ) : child.status === "needs_schedule" ? (
            <div className="flex items-start gap-3 rounded-[16px] bg-[var(--sf-butter)] p-4">
              <GIcon size="sm">
                <CircleAlert />
              </GIcon>
              <div className="min-w-0">
                <p className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">
                  Payment schedule needed
                </p>
                <p className="m-0 mt-0.5 text-[13px] font-semibold text-[var(--sf-ink)]/70">
                  Choose an installment plan to generate tuition charges for {firstName}.
                </p>
              </div>
            </div>
          ) : null}
          {dueCard}
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

      {!child.selectionItem ? (
        <GCard
          index={4}
          kicker="Upcoming"
          title="Payment schedule"
          action={
            upcomingCharges.length > 4 ? (
              <button
                type="button"
                onClick={onOpenUpcomingCharges}
                className={gLinkSm}
                data-testid="parent-billing-upcoming-charges-trigger-inline"
              >
                View full schedule →
              </button>
            ) : null
          }
        >
          {upcomingCharges.length > 0 ? (
            <div className="flex flex-col gap-2.5">
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
                  pendingCheckoutPayment={
                    pendingPaymentByChargeId.get(charge.id) ?? null
                  }
                  onPay={onPay}
                  readOnly={readOnly}
                />
              ))}
              {upcomingCharges.length > 4 ? (
                <button
                  type="button"
                  onClick={onOpenUpcomingCharges}
                  className={`group relative flex w-full items-center gap-3.5 rounded-[14px] bg-[var(--sf-sky)] p-4 pt-5 text-left shadow-[0_10px_20px_-14px_rgba(43,36,29,0.55)] hover:-translate-y-0.5 ${SPRINGY} ${G_FOCUS}`}
                  data-testid="parent-billing-upcoming-charges-trigger-card"
                >
                  <span
                    aria-hidden="true"
                    className="absolute left-1/2 top-0 h-3.5 w-12 -translate-x-1/2 -translate-y-1/2 rotate-2 rounded-sm bg-white/75"
                  />
                  <GIcon size="sm">
                    <CalendarDays />
                  </GIcon>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-extrabold text-[var(--sf-ink)]">
                      View full schedule
                    </span>
                    {upcomingSummary ? (
                      <span className="block truncate text-[13px] font-semibold text-[var(--sf-ink)]/65">
                        {upcomingSummary}
                      </span>
                    ) : null}
                  </span>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/60 transition-transform duration-300 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </button>
              ) : null}
              <p
                className="m-0 mt-1 inline-flex items-center gap-1.5 text-[13px] font-extrabold text-[var(--sf-ink)]/70"
                data-testid="parent-billing-upcoming-total-remaining"
              >
                <ArrowRight className="h-3.5 w-3.5 text-[var(--sf-clay-deep)]" aria-hidden />
                {formatCents(child.totalRemainingCents)} remaining on schedule
              </p>
            </div>
          ) : (
            <p className="m-0 text-[15px] font-semibold text-[var(--sf-soft)]">
              {assignmentCharges.length > 0
                ? "No upcoming charges."
                : "No charges on the schedule yet."}
            </p>
          )}
        </GCard>
      ) : null}

      <GCard index={5} kicker="History" title={`Payments for ${firstName}`}>
        {childPayments.length > 0 ? (
          <ul className="sf-paper -mx-1 flex flex-col rounded-xl px-1">
            {childPayments.map((payment) => (
              <li key={payment.id}>
                <ParentBillingPaymentHistoryRow
                  C={C}
                  theme={theme}
                  payment={payment}
                  onClick={() => onPaymentClick(payment.id)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 text-[15px] font-semibold text-[var(--sf-soft)]">
            No payments yet for {firstName}.
          </p>
        )}
      </GCard>
    </div>
  );
}
