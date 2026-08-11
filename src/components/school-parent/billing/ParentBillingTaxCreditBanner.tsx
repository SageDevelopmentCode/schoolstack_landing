"use client";

import { EXTRA_PAY_BANNER_CTA } from "@/lib/tuition/tuition-pay-copy";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ParentBillingTaxCreditBannerProps = {
  C: AdminThemeTokens;
  chargeId: string | null;
  readOnly?: boolean;
  onDismiss: () => void;
  onApplyTaxCredit: (chargeId: string) => void;
};

export default function ParentBillingTaxCreditBanner({
  C,
  chargeId,
  readOnly = false,
  onDismiss,
  onApplyTaxCredit,
}: ParentBillingTaxCreditBannerProps) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-3"
      style={{
        backgroundColor: C.accentLight,
        border: `1px solid ${C.border}`,
      }}
      data-testid="parent-billing-tax-credit-banner"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
            Using Idaho Parent Choice Tax Credit?
          </p>
          <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
            Apply a tax credit or lump sum on a child&apos;s tuition payment. Remaining
            monthly payments will be recalculated automatically.
          </p>
        </div>
        <button
          type="button"
          className="text-xs shrink-0"
          style={{ color: C.textSecondary }}
          onClick={onDismiss}
        >
          Dismiss
        </button>
      </div>
      {chargeId && !readOnly ? (
        <button
          type="button"
          onClick={() => onApplyTaxCredit(chargeId)}
          className="inline-flex self-start px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: C.accent, color: "#fff" }}
        >
          {EXTRA_PAY_BANNER_CTA}
        </button>
      ) : null}
    </div>
  );
}
