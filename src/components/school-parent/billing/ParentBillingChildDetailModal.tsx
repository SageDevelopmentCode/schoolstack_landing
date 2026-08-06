"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import ParentBillingChargeRow from "@/components/school-parent/billing/ParentBillingChargeRow";
import ParentBillingPaymentHistoryRow from "@/components/school-parent/billing/ParentBillingPaymentHistoryRow";
import {
  formatParentChargeAmountLabel,
  formatParentChargeDueLine,
  formatParentChargeStatusBadge,
  type ChargeStatusBadgeTone,
} from "@/lib/tuition/charge-status-display";
import { formatCents } from "@/lib/tuition/pricing";
import type { ParentBillingChildView } from "@/lib/tuition/parent-billing-summary";
import type { ParentTuitionPaymentRecord } from "@/lib/tuition/payments";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { TuitionAdjustment, TuitionCharge } from "@/lib/tuition/types";

type ParentBillingChildDetailModalProps = {
  C: AdminThemeTokens;
  open: boolean;
  child: ParentBillingChildView | null;
  charges: TuitionCharge[];
  payments: ParentTuitionPaymentRecord[];
  adjustmentsByAssignment: Map<string, TuitionAdjustment[]>;
  payingChargeId: string | null;
  autopayEnabled: boolean;
  badgeColorIndex: number;
  readOnly?: boolean;
  onClose: () => void;
  onPay: (chargeId: string) => void;
  onReviewSchedule?: () => void;
};

const OPEN_CHARGE_STATUSES = new Set(["scheduled", "sent", "overdue"]);

function badgeStyles(C: AdminThemeTokens, tone: ChargeStatusBadgeTone) {
  switch (tone) {
    case "success":
      return { backgroundColor: C.successBg, color: C.success };
    case "warning":
      return { backgroundColor: C.warningBg, color: C.warning };
    case "danger":
      return { backgroundColor: C.errorBg, color: C.error };
    default:
      return { backgroundColor: C.elevated, color: C.textSecondary };
  }
}

function ScheduleChargeRow({
  C,
  charge,
}: {
  C: AdminThemeTokens;
  charge: TuitionCharge;
}) {
  const statusBadge = formatParentChargeStatusBadge(charge);
  const badgeStyle = badgeStyles(C, statusBadge.tone);

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm"
      style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
      data-testid="parent-billing-schedule-row"
    >
      <div className="min-w-0">
        <p style={{ color: C.textPrimary }}>{charge.label}</p>
        <p className="text-xs mt-0.5" style={{ color: C.textTertiary }}>
          {formatParentChargeDueLine(charge)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span style={{ color: C.textPrimary }}>
          {formatParentChargeAmountLabel(charge)}
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={badgeStyle}
        >
          {statusBadge.label}
        </span>
      </div>
    </div>
  );
}

export default function ParentBillingChildDetailModal({
  C,
  open,
  child,
  charges,
  payments,
  adjustmentsByAssignment,
  payingChargeId,
  autopayEnabled,
  badgeColorIndex,
  readOnly = false,
  onClose,
  onPay,
  onReviewSchedule,
}: ParentBillingChildDetailModalProps) {
  if (!child) return null;

  const assignmentCharges = child.assignmentId
    ? charges.filter((charge) => charge.assignmentId === child.assignmentId)
    : [];
  const upcomingCharges = assignmentCharges.filter((charge) =>
    OPEN_CHARGE_STATUSES.has(charge.status),
  );
  const scheduleCharges = [...assignmentCharges].sort((a, b) => {
    const dueCompare = a.dueDate.localeCompare(b.dueDate);
    if (dueCompare !== 0) return dueCompare;
    return (a.installmentNumber ?? 0) - (b.installmentNumber ?? 0);
  });
  const childPayments = payments.filter(
    (payment) => payment.enrollmentId === child.childKey,
  );

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-safe sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="parent-billing-child-detail-title"
            className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl"
            style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            data-testid="parent-billing-child-detail-modal"
          >
            <div className="flex items-start justify-between gap-3 border-b px-5 py-4"
              style={{ borderColor: C.border }}
            >
              <div className="min-w-0">
                <h2
                  id="parent-billing-child-detail-title"
                  className="text-lg font-semibold"
                  style={{ color: C.textPrimary }}
                >
                  {child.studentName}
                </h2>
                <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
                  Annual {formatCents(child.annualTuitionCents)}
                  {child.balanceDueCents > 0
                    ? ` · Due now ${formatCents(child.balanceDueCents)}`
                    : ""}
                  {child.totalRemainingCents > child.balanceDueCents
                    ? ` · ${formatCents(child.totalRemainingCents)} remaining`
                    : ""}
                </p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close">
                <X className="w-5 h-5" style={{ color: C.textSecondary }} />
              </button>
            </div>

            <div className="flex flex-col gap-5 overflow-y-auto px-5 py-4">
              {child.status === "needs_schedule" ? (
                <div
                  className="rounded-lg px-4 py-3 text-sm"
                  style={{ backgroundColor: C.warningBg, border: `1px solid ${C.warningBorder}` }}
                >
                  <p className="font-medium" style={{ color: C.textPrimary }}>
                    Payment schedule needed
                  </p>
                  <p className="mt-1" style={{ color: C.textSecondary }}>
                    Choose an installment plan on the billing page to generate tuition
                    charges for {child.studentName.split(" ")[0]}.
                  </p>
                  {onReviewSchedule ? (
                    <button
                      type="button"
                      onClick={onReviewSchedule}
                      className="mt-3 inline-flex rounded-lg px-3 py-1.5 text-xs font-medium"
                      style={{ backgroundColor: C.warning, color: "#fff" }}
                    >
                      Review schedule options
                    </button>
                  ) : null}
                </div>
              ) : null}

              <section>
                <h3 className="text-sm font-semibold mb-2" style={{ color: C.textPrimary }}>
                  Upcoming charges
                </h3>
                <div className="flex flex-col gap-2">
                  {upcomingCharges.length > 0 ? (
                    upcomingCharges.map((charge) => (
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
                    ))
                  ) : (
                    <p className="text-sm" style={{ color: C.textTertiary }}>
                      No upcoming charges.
                    </p>
                  )}
                </div>
              </section>

              {scheduleCharges.length > 0 ? (
                <section>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: C.textPrimary }}>
                    Payment schedule
                  </h3>
                  <div className="flex flex-col gap-2">
                    {scheduleCharges.map((charge) => (
                      <ScheduleChargeRow key={charge.id} C={C} charge={charge} />
                    ))}
                  </div>
                </section>
              ) : null}

              <section>
                <h3 className="text-sm font-semibold mb-2" style={{ color: C.textPrimary }}>
                  Payment history
                </h3>
                {childPayments.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {childPayments.map((payment) => (
                      <ParentBillingPaymentHistoryRow
                        key={payment.id}
                        C={C}
                        payment={payment}
                        showStudentBadge={false}
                        badgeColorIndex={badgeColorIndex}
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
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
