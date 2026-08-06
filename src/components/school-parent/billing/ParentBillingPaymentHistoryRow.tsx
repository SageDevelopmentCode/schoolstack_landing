"use client";

import { formatBillingDueDate } from "@/lib/tuition/due-date-display";
import { formatCents } from "@/lib/tuition/pricing";
import type { ParentTuitionPaymentRecord } from "@/lib/tuition/payments";
import { getStudentBadgeColors } from "@/lib/tuition/student-badge-colors";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ParentBillingPaymentHistoryRowProps = {
  C: AdminThemeTokens;
  payment: ParentTuitionPaymentRecord;
  showStudentBadge?: boolean;
  badgeColorIndex?: number;
};

function formatTuitionPaymentMethodLabel(
  paymentMethodType: ParentTuitionPaymentRecord["paymentMethodType"],
): string | null {
  if (paymentMethodType === "card") return "Card";
  if (paymentMethodType === "us_bank_account") return "Bank account";
  return null;
}

export default function ParentBillingPaymentHistoryRow({
  C,
  payment,
  showStudentBadge = false,
  badgeColorIndex = 0,
}: ParentBillingPaymentHistoryRowProps) {
  const paymentMethodLabel = formatTuitionPaymentMethodLabel(
    payment.paymentMethodType,
  );
  const badgeColors = getStudentBadgeColors(C, badgeColorIndex);

  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm"
      style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
      data-testid="parent-billing-payment-history-row"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {showStudentBadge && payment.studentFirstName ? (
            <span
              className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{
                backgroundColor: badgeColors.backgroundColor,
                color: badgeColors.color,
              }}
              data-testid="parent-billing-payment-student-badge"
            >
              For {payment.studentFirstName}
            </span>
          ) : null}
          <p style={{ color: C.textPrimary }}>
            {payment.label ?? "Tuition payment"}
          </p>
        </div>
        <p className="text-xs mt-0.5" style={{ color: C.textTertiary }}>
          {payment.paidAt
            ? formatBillingDueDate(payment.paidAt.slice(0, 10))
            : payment.status}
          {paymentMethodLabel ? ` · ${paymentMethodLabel}` : ""}
        </p>
      </div>
      <span className="shrink-0 font-medium" style={{ color: C.textPrimary }}>
        {formatCents(payment.amountCents)}
      </span>
    </div>
  );
}
