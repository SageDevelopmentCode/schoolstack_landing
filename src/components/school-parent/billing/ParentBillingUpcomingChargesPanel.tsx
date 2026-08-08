"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import ParentBillingChargeRow from "@/components/school-parent/billing/ParentBillingChargeRow";
import { formatBillingDueDate } from "@/lib/tuition/due-date-display";
import { formatCents } from "@/lib/tuition/pricing";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { TuitionAdjustment, TuitionCharge } from "@/lib/tuition/types";

type ParentBillingUpcomingChargesPanelProps = {
  C: AdminThemeTokens;
  open: boolean;
  charges: TuitionCharge[];
  studentName?: string | null;
  totalRemainingCents?: number;
  adjustmentsByAssignment: Map<string, TuitionAdjustment[]>;
  payingChargeId: string | null;
  highlightedChargeId?: string | null;
  autopayEnabled: boolean;
  readOnly?: boolean;
  onClose: () => void;
  onPay: (chargeId: string) => void;
};

function sortChargesByDueDate(charges: TuitionCharge[]): TuitionCharge[] {
  return [...charges].sort((a, b) => {
    const dueCompare = a.dueDate.localeCompare(b.dueDate);
    if (dueCompare !== 0) return dueCompare;
    return (a.installmentNumber ?? 0) - (b.installmentNumber ?? 0);
  });
}

export function formatUpcomingChargesSummary(charges: TuitionCharge[]): string {
  if (charges.length === 0) return "";
  const sorted = sortChargesByDueDate(charges);
  const countLabel = `${charges.length} upcoming`;
  const nextDue = sorted[0]?.dueDate;
  if (!nextDue) return countLabel;
  return `${countLabel} · next due ${formatBillingDueDate(nextDue)}`;
}

export default function ParentBillingUpcomingChargesPanel({
  C,
  open,
  charges,
  studentName,
  totalRemainingCents = 0,
  adjustmentsByAssignment,
  payingChargeId,
  highlightedChargeId = null,
  autopayEnabled,
  readOnly = false,
  onClose,
  onPay,
}: ParentBillingUpcomingChargesPanelProps) {
  const scheduleCharges = sortChargesByDueDate(charges);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            id="parent-billing-upcoming-charges-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="parent-billing-upcoming-charges-title"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,40rem)] max-w-full flex-col overflow-hidden"
            style={{
              backgroundColor: C.surface,
              borderLeft: `1px solid ${C.border}`,
              boxShadow: C.shadowMedium,
            }}
            onClick={(event) => event.stopPropagation()}
            data-testid="parent-billing-upcoming-charges-panel"
          >
            <div
              className="flex items-start justify-between gap-3 border-b px-5 py-4"
              style={{ borderColor: C.border }}
            >
              <div className="min-w-0">
                <h2
                  id="parent-billing-upcoming-charges-title"
                  className="text-lg font-semibold"
                  style={{ color: C.textPrimary }}
                >
                  Upcoming charges
                </h2>
                {studentName ? (
                  <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
                    {studentName}
                  </p>
                ) : null}
                {totalRemainingCents > 0 ? (
                  <p
                    className="text-sm mt-1 font-medium"
                    style={{ color: C.accent }}
                    data-testid="parent-billing-upcoming-total-remaining"
                  >
                    Total remaining: {formatCents(totalRemainingCents)}
                  </p>
                ) : null}
              </div>
              <button type="button" onClick={onClose} aria-label="Close">
                <X className="w-5 h-5" style={{ color: C.textSecondary }} />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-5 py-4">
              {scheduleCharges.length > 0 ? (
                scheduleCharges.map((charge) => (
                  <ParentBillingChargeRow
                    key={charge.id}
                    C={C}
                    charge={charge}
                    adjustmentsForAssignment={
                      adjustmentsByAssignment.get(charge.assignmentId) ?? []
                    }
                    payingChargeId={payingChargeId}
                    highlighted={highlightedChargeId === charge.id}
                    autopayEnabled={autopayEnabled}
                    onPay={onPay}
                    readOnly={readOnly}
                  />
                ))
              ) : (
                <p className="text-sm" style={{ color: C.textTertiary }}>
                  No upcoming charges yet.
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
