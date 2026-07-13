import { formatFeeAmount } from "@/lib/admissions/application-form-schema";
import type { ChecklistPaymentLineItem } from "@/lib/admissions/enrollment-checklist-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type PaymentFeeBreakdownListProps = {
  C: AdminThemeTokens;
  lineItems: ChecklistPaymentLineItem[];
  totalCents: number;
  compact?: boolean;
};

export default function PaymentFeeBreakdownList({
  C,
  lineItems,
  totalCents,
  compact = false,
}: PaymentFeeBreakdownListProps) {
  return (
    <div className={compact ? "space-y-2 text-sm" : "space-y-3"}>
      {lineItems.map((lineItem) => (
        <div
          key={lineItem.id}
          className="flex items-baseline justify-between gap-4"
        >
          <span style={{ color: C.textSecondary }}>{lineItem.label}</span>
          <span className="tabular-nums" style={{ color: C.textPrimary }}>
            {formatFeeAmount(lineItem.amountCents)}
          </span>
        </div>
      ))}
      <div
        className={compact ? "border-t pt-2" : "border-t pt-3"}
        style={{ borderColor: C.border }}
      />
      <div className="flex items-baseline justify-between gap-4">
        <span
          className={compact ? "text-sm font-semibold" : "font-semibold"}
          style={{ color: C.textPrimary }}
        >
          Total
        </span>
        <span
          className={`tabular-nums ${compact ? "text-sm font-semibold" : "text-lg font-semibold"}`}
          style={{ color: C.textPrimary }}
        >
          {formatFeeAmount(totalCents)}
        </span>
      </div>
    </div>
  );
}
