"use client";

import { ChevronRight } from "lucide-react";
import { formatBillingDueDate } from "@/lib/tuition/due-date-display";
import { formatCents } from "@/lib/tuition/pricing";
import type { ParentTuitionPaymentRecord } from "@/lib/tuition/payments";
import { formatTuitionPaymentMethodLabel } from "@/lib/tuition/tuition-payment-receipt-detail";
import { getStudentBadgeColors } from "@/lib/tuition/student-badge-colors";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentBillingPaymentHistoryRowProps = {
  C: AdminThemeTokens;
  theme?: ParentThemeTokens;
  payment: ParentTuitionPaymentRecord;
  showStudentBadge?: boolean;
  badgeColorIndex?: number;
  onClick?: () => void;
};

export default function ParentBillingPaymentHistoryRow({
  C,
  theme,
  payment,
  showStudentBadge = false,
  badgeColorIndex = 0,
  onClick,
}: ParentBillingPaymentHistoryRowProps) {
  const paymentMethodLabel = formatTuitionPaymentMethodLabel(payment);
  const badgeColors = getStudentBadgeColors(C, badgeColorIndex);
  const displayAmountCents =
    payment.chargedAmountCents ?? payment.amountCents;

  const surfaceColor = theme?.white ?? C.surface;
  const borderColor = theme?.line ?? C.border;
  const shadow = theme?.shadowCard ?? C.shadowCard;
  const radius = theme?.radiusCard ?? "0.5rem";
  const textPrimary = theme?.ink ?? C.textPrimary;
  const textTertiary = theme?.muted ?? C.textTertiary;
  const accentColor = theme?.primary ?? C.accent;
  const successColor = theme?.success ?? C.success;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition-colors"
      style={{
        backgroundColor: surfaceColor,
        border: `1px solid ${borderColor}`,
        borderRadius: radius,
        boxShadow: shadow,
        cursor: onClick ? "pointer" : "default",
      }}
      onMouseEnter={(event) => {
        if (!onClick) return;
        event.currentTarget.style.borderColor = accentColor;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.borderColor = borderColor;
      }}
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
          <p style={{ color: textPrimary }}>
            {payment.label ?? "Tuition payment"}
          </p>
        </div>
        <p className="text-xs mt-0.5" style={{ color: textTertiary }}>
          {payment.paidAt
            ? formatBillingDueDate(payment.paidAt.slice(0, 10))
            : payment.status}
          {` · ${paymentMethodLabel}`}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="font-semibold tabular-nums" style={{ color: successColor }}>
          {formatCents(displayAmountCents)}
        </span>
        {onClick ? (
          <ChevronRight
            className="h-4 w-4"
            style={{ color: textTertiary }}
            aria-hidden
          />
        ) : null}
      </div>
    </button>
  );
}
