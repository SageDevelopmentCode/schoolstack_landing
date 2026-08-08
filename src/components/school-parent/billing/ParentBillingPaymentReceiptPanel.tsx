"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { formatCents } from "@/lib/tuition/pricing";
import { getStudentBadgeColors } from "@/lib/tuition/student-badge-colors";
import type { TuitionPaymentReceiptDetail } from "@/lib/tuition/tuition-payment-receipt-detail";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ParentBillingPaymentReceiptPanelProps = {
  C: AdminThemeTokens;
  open: boolean;
  receipt: TuitionPaymentReceiptDetail | null;
  studentColorMap: Map<string, number>;
  onClose: () => void;
};

function ReceiptRow({
  C,
  label,
  value,
  emphasized = false,
}: {
  C: AdminThemeTokens;
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 ${emphasized ? "font-semibold" : ""}`}
      style={{ color: emphasized ? C.accent : C.textPrimary }}
    >
      <span style={{ color: emphasized ? C.accent : C.textSecondary }}>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

export default function ParentBillingPaymentReceiptPanel({
  C,
  open,
  receipt,
  studentColorMap,
  onClose,
}: ParentBillingPaymentReceiptPanelProps) {
  return (
    <AnimatePresence>
      {open && receipt ? (
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
            id="parent-billing-payment-receipt-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="parent-billing-payment-receipt-title"
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
            data-testid="parent-billing-payment-receipt-panel"
          >
            <div
              className="flex items-start justify-between gap-3 border-b px-5 py-4"
              style={{ borderColor: C.border }}
            >
              <div className="min-w-0">
                <h2
                  id="parent-billing-payment-receipt-title"
                  className="text-lg font-semibold"
                  style={{ color: C.textPrimary }}
                >
                  Payment receipt
                </h2>
                <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
                  {receipt.paidAtLabel}
                </p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close">
                <X className="w-5 h-5" style={{ color: C.textSecondary }} />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
              {receipt.lineItems.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {[
                    ...new Map(
                      receipt.lineItems.map((item) => [
                        item.enrollmentId ?? item.studentName,
                        item,
                      ]),
                    ).values(),
                  ].map((item) => {
                    const colorIndex = item.enrollmentId
                      ? (studentColorMap.get(item.enrollmentId) ?? 0)
                      : 0;
                    const badgeColors = getStudentBadgeColors(C, colorIndex);

                    return (
                      <span
                        key={`${item.studentName}-${item.enrollmentId ?? "student"}`}
                        className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: badgeColors.backgroundColor,
                          color: badgeColors.color,
                        }}
                      >
                        {item.studentName}
                      </span>
                    );
                  })}
                </div>
              ) : null}

              <section
                className="rounded-lg border p-4 space-y-3 text-sm"
                style={{ borderColor: C.border, backgroundColor: C.elevated }}
              >
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.textTertiary }}>
                  {receipt.isCombined ? "Charges paid" : "Charge"}
                </p>
                <div className="space-y-2">
                  {receipt.lineItems.map((item, index) => {
                    const colorIndex = item.enrollmentId
                      ? (studentColorMap.get(item.enrollmentId) ?? 0)
                      : 0;
                    const badgeColors = getStudentBadgeColors(C, colorIndex);

                    return (
                      <div
                        key={`${item.chargeLabel}-${item.studentName}-${index}`}
                        className="flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p style={{ color: C.textPrimary }}>
                            <span
                              className="font-medium"
                              style={{ color: badgeColors.color }}
                            >
                              {item.studentName}
                            </span>
                            <span style={{ color: C.textSecondary }}> — </span>
                            {item.chargeLabel}
                          </p>
                        </div>
                        <span
                          className="shrink-0 font-medium tabular-nums"
                          style={{ color: C.textPrimary }}
                        >
                          {formatCents(item.amountCents)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {receipt.lumpSumBreakdown ? (
                <section
                  className="rounded-lg border p-3 text-xs"
                  style={{
                    borderColor: C.infoBorder,
                    backgroundColor: C.infoBg,
                  }}
                  data-testid="parent-billing-receipt-lump-sum"
                >
                  <p className="font-medium" style={{ color: C.textPrimary }}>
                    Payment breakdown
                  </p>
                  <p className="mt-1" style={{ color: C.textSecondary }}>
                    {formatCents(receipt.lumpSumBreakdown.installmentCents)} installment ·{" "}
                    {formatCents(receipt.lumpSumBreakdown.futureCents)} future
                  </p>
                  <p className="mt-1" style={{ color: C.textTertiary }}>
                    Future installments were recalculated.
                  </p>
                </section>
              ) : null}

              <section className="space-y-2 text-sm">
                <ReceiptRow
                  C={C}
                  label="School amount"
                  value={formatCents(receipt.schoolAmountCents)}
                />
                {receipt.processingFeeCents > 0 ? (
                  <ReceiptRow
                    C={C}
                    label="Processing fee"
                    value={formatCents(receipt.processingFeeCents)}
                  />
                ) : null}
                <ReceiptRow
                  C={C}
                  label="Total paid"
                  value={formatCents(receipt.totalPaidCents)}
                  emphasized
                />
                <ReceiptRow
                  C={C}
                  label="Payment method"
                  value={receipt.paymentMethodLabel}
                />
              </section>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
