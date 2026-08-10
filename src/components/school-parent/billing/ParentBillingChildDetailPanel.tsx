"use client";

import { ChevronRight, CreditCard, Loader2, Wallet } from "lucide-react";
import ParentBillingChargeRow from "@/components/school-parent/billing/ParentBillingChargeRow";
import ParentBillingPaymentHistoryRow from "@/components/school-parent/billing/ParentBillingPaymentHistoryRow";
import ParentNeedsScheduleBadge from "@/components/school-parent/billing/ParentNeedsScheduleBadge";
import ParentTuitionPlanSelector from "@/components/school-parent/billing/ParentTuitionPlanSelector";
import { formatUpcomingChargesSummary } from "@/components/school-parent/billing/ParentBillingUpcomingChargesPanel";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import {
  childFirstNameFromFullName,
  type ParentBillingChildView,
} from "@/lib/tuition/parent-billing-summary";
import { formatCents } from "@/lib/tuition/pricing";
import { formatBillingDueDate } from "@/lib/tuition/due-date-display";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { TuitionAdjustment, TuitionCharge } from "@/lib/tuition/types";
import type { ParentTuitionPaymentRecord } from "@/lib/tuition/payments";
import {
  EXTRA_PAY_BUTTON_HINT,
  EXTRA_PAY_BUTTON_LABEL,
} from "@/lib/tuition/tuition-pay-copy";

type ParentBillingChildDetailPanelProps = {
  C: AdminThemeTokens;
  child: ParentBillingChildView;
  charges: TuitionCharge[];
  openCharges: TuitionCharge[];
  adjustmentsByAssignment: Map<string, TuitionAdjustment[]>;
  payments: ParentTuitionPaymentRecord[];
  payingChargeId: string | null;
  autopayEnabled: boolean;
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
  C,
  child,
  charges,
  openCharges,
  adjustmentsByAssignment,
  payments,
  payingChargeId,
  autopayEnabled,
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
  const scheduleCharges = sortChargesByDueDate(assignmentCharges);

  const childPayments = payments.filter(
    (payment) => payment.enrollmentId === child.childKey,
  );

  const canPay =
    child.balanceDueCents > 0 && child.nextChargeId != null && !readOnly;
  const canPayExtra =
    !readOnly &&
    child.nextChargeId != null &&
    child.totalRemainingCents > child.balanceDueCents;
  const isPaying = child.nextChargeId
    ? payingChargeId === child.nextChargeId
    : false;

  const upcomingSummary = formatUpcomingChargesSummary(openCharges);

  return (
    <div
      className="flex flex-col gap-5"
      data-testid="parent-billing-child-detail-panel"
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
            {child.studentName}
          </h2>
          {child.selectionItem || child.status === "needs_schedule" ? (
            <ParentNeedsScheduleBadge C={C} label="Schedule needed" />
          ) : null}
        </div>
        <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
          {planSubtitle}
          {child.totalRemainingCents > 0
            ? ` · ${formatCents(child.totalRemainingCents)} remaining`
            : ""}
        </p>
      </div>

      {child.balanceDueCents > 0 ? (
        <div
          className="rounded-xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
          data-testid={`parent-billing-child-due-card-${child.childKey}`}
        >
          <div>
            <p className="text-xs uppercase tracking-wide" style={{ color: C.textTertiary }}>
              Due now
            </p>
            <p className="text-2xl font-semibold mt-0.5" style={{ color: C.textPrimary }}>
              {formatCents(child.balanceDueCents)}
            </p>
            {child.nextCharge ? (
              <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
                Due {formatBillingDueDate(child.nextCharge.dueDate)}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canPay ? (
              <button
                type="button"
                disabled={isPaying}
                onClick={() => onPay(child.nextChargeId!)}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: C.accent, color: "#fff" }}
                data-testid={`parent-billing-child-pay-${child.childKey}`}
              >
                {isPaying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                Pay {formatCents(child.balanceDueCents)}
              </button>
            ) : null}
            {canPayExtra && onPayExtra ? (
              <button
                type="button"
                disabled={isPaying}
                onClick={() => onPayExtra(child.nextChargeId!)}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={getAdminButtonStyle(C, "secondary")}
                data-testid={`parent-billing-child-pay-extra-${child.childKey}`}
                title={EXTRA_PAY_BUTTON_HINT}
                aria-label={EXTRA_PAY_BUTTON_HINT}
              >
                <Wallet className="h-4 w-4 shrink-0" aria-hidden />
                {EXTRA_PAY_BUTTON_LABEL}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

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
          <h3 className="text-sm font-semibold mb-2" style={{ color: C.textPrimary }}>
            Payment schedule
          </h3>
          {scheduleCharges.length > 0 ? (
            <div className="flex flex-col gap-2">
              {scheduleCharges.slice(0, 4).map((charge) => (
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
              {scheduleCharges.length > 4 || openCharges.length > 0 ? (
                <button
                  type="button"
                  onClick={onOpenUpcomingCharges}
                  className="flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left text-sm transition-shadow"
                  style={{
                    backgroundColor: C.surface,
                    border: `1px solid ${C.border}`,
                  }}
                  data-testid="parent-billing-upcoming-charges-trigger"
                >
                  <div className="min-w-0">
                    <p className="font-medium" style={{ color: C.textPrimary }}>
                      {scheduleCharges.length > 4
                        ? "View full schedule"
                        : "View payment schedule"}
                    </p>
                    {upcomingSummary ? (
                      <p className="text-xs mt-0.5" style={{ color: C.textTertiary }}>
                        {upcomingSummary}
                      </p>
                    ) : null}
                  </div>
                  <ChevronRight
                    className="h-4 w-4 shrink-0"
                    style={{ color: C.textTertiary }}
                    aria-hidden
                  />
                </button>
              ) : null}
            </div>
          ) : (
            <p className="text-sm" style={{ color: C.textTertiary }}>
              No charges on the schedule yet.
            </p>
          )}
        </section>
      ) : null}

      <section>
        <h3 className="text-sm font-semibold mb-2" style={{ color: C.textPrimary }}>
          Payments for {firstName}
        </h3>
        {childPayments.length > 0 ? (
          <div className="flex flex-col gap-2">
            {childPayments.map((payment) => (
              <ParentBillingPaymentHistoryRow
                key={payment.id}
                C={C}
                payment={payment}
                onClick={() => onPaymentClick(payment.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: C.textTertiary }}>
            No payments yet for {firstName}.
          </p>
        )}
      </section>
    </div>
  );
}
