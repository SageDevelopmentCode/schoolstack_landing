"use client";

import ParentBillingSidePanel from "@/components/school-parent/billing/ParentBillingSidePanel";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import { formatCents } from "@/lib/tuition/pricing";
import { getStudentBadgeColors } from "@/lib/tuition/student-badge-colors";
import type { TuitionPaymentReceiptDetail } from "@/lib/tuition/tuition-payment-receipt-detail";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentBillingPaymentReceiptPanelProps = {
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  open: boolean;
  receipt: TuitionPaymentReceiptDetail | null;
  studentColorMap: Map<string, number>;
  onClose: () => void;
};

function ReceiptRow({
  theme,
  label,
  value,
  emphasized = false,
}: {
  theme: ParentThemeTokens;
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 text-sm ${emphasized ? "font-semibold" : ""}`}
      style={{ color: emphasized ? theme.primary : theme.ink }}
    >
      <span style={{ color: emphasized ? theme.primary : theme.muted }}>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

export default function ParentBillingPaymentReceiptPanel({
  theme,
  C,
  open,
  receipt,
  studentColorMap,
  onClose,
}: ParentBillingPaymentReceiptPanelProps) {
  if (!receipt) return null;

  const uniqueStudents = [
    ...new Map(
      receipt.lineItems.map((item) => [item.enrollmentId ?? item.studentName, item]),
    ).values(),
  ];

  return (
    <ParentBillingSidePanel
      theme={theme}
      open={open}
      title="Payment receipt"
      subtitle={receipt.paidAtLabel}
      onClose={onClose}
      testId="parent-billing-payment-receipt-panel"
      panelId="parent-billing-payment-receipt-panel"
    >
      {uniqueStudents.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {uniqueStudents.map((item) => {
            const colorIndex = item.enrollmentId
              ? (studentColorMap.get(item.enrollmentId) ?? 0)
              : 0;
            const badgeColors = getStudentBadgeColors(C, colorIndex);

            return (
              <span
                key={`${item.studentName}-${item.enrollmentId ?? "student"}`}
                className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
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

      <ParentCard theme={theme} className="!p-4">
        <ParentSectionKicker theme={theme}>
          {receipt.isCombined ? "Charges paid" : "Charge"}
        </ParentSectionKicker>
        <div className="mt-3 space-y-3">
          {receipt.lineItems.map((item, index) => {
            const colorIndex = item.enrollmentId
              ? (studentColorMap.get(item.enrollmentId) ?? 0)
              : 0;
            const badgeColors = getStudentBadgeColors(C, colorIndex);

            return (
              <div
                key={`${item.chargeLabel}-${item.studentName}-${index}`}
                className="flex items-start justify-between gap-3 text-sm"
              >
                <div className="min-w-0">
                  <p style={{ color: theme.ink }}>
                    <span className="font-medium" style={{ color: badgeColors.color }}>
                      {item.studentName}
                    </span>
                    <span style={{ color: theme.muted }}> — </span>
                    {item.chargeLabel}
                  </p>
                </div>
                <span
                  className="shrink-0 font-medium tabular-nums"
                  style={{ color: theme.ink }}
                >
                  {formatCents(item.amountCents)}
                </span>
              </div>
            );
          })}
        </div>
      </ParentCard>

      {receipt.lumpSumBreakdown ? (
        <ParentCard
          theme={theme}
          className="!p-4"
          style={{
            backgroundColor: theme.infoBg,
            borderColor: theme.info,
          }}
        >
          <div data-testid="parent-billing-receipt-lump-sum">
          <p className="text-sm font-medium" style={{ color: theme.ink }}>
            Payment breakdown
          </p>
          <p className="mt-1 text-xs" style={{ color: theme.muted }}>
            {formatCents(receipt.lumpSumBreakdown.installmentCents)} installment ·{" "}
            {formatCents(receipt.lumpSumBreakdown.futureCents)} future
          </p>
          <p className="mt-1 text-xs" style={{ color: theme.muted }}>
            Future installments were recalculated.
          </p>
          </div>
        </ParentCard>
      ) : null}

      <section className="space-y-2">
        <ReceiptRow
          theme={theme}
          label="School amount"
          value={formatCents(receipt.schoolAmountCents)}
        />
        {receipt.processingFeeCents > 0 ? (
          <ReceiptRow
            theme={theme}
            label="Processing fee"
            value={formatCents(receipt.processingFeeCents)}
          />
        ) : null}
        <ReceiptRow
          theme={theme}
          label="Total paid"
          value={formatCents(receipt.totalPaidCents)}
          emphasized
        />
        <ReceiptRow
          theme={theme}
          label="Payment method"
          value={receipt.paymentMethodLabel}
        />
      </section>
    </ParentBillingSidePanel>
  );
}
