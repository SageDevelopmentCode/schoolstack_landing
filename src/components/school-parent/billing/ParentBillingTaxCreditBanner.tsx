"use client";

import { Landmark } from "lucide-react";
import { GIcon, gBtnOutlineSm, gLinkSm } from "@/components/school-parent/garden/ui";
import { EXTRA_PAY_BANNER_CTA } from "@/lib/tuition/tuition-pay-copy";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ParentBillingTaxCreditBannerProps = {
  /** Kept for call-site compatibility; the note uses Garden tokens. */
  C?: AdminThemeTokens;
  chargeId: string | null;
  readOnly?: boolean;
  onDismiss: () => void;
  onApplyTaxCredit: (chargeId: string) => void;
};

/** Butter note offering the tax-credit / lump-sum payment path. */
export default function ParentBillingTaxCreditBanner({
  chargeId,
  readOnly = false,
  onDismiss,
  onApplyTaxCredit,
}: ParentBillingTaxCreditBannerProps) {
  return (
    <div
      className="relative flex flex-col gap-3 rounded-[16px] bg-[var(--sf-butter)] p-4 pt-5 shadow-[0_10px_20px_-14px_rgba(43,36,29,0.55)] sm:flex-row sm:items-center sm:gap-4 sm:p-5"
      data-testid="parent-billing-tax-credit-banner"
    >
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-0 h-3.5 w-12 -translate-x-1/2 -translate-y-1/2 rotate-2 rounded-sm bg-white/75"
      />
      <GIcon size="sm">
        <Landmark />
      </GIcon>
      <div className="min-w-0 flex-1">
        <p className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">
          Using Idaho Parent Choice Tax Credit?
        </p>
        <p className="m-0 mt-0.5 text-[13px] font-semibold leading-snug text-[var(--sf-ink)]/70">
          Apply a tax credit or lump sum on a child&apos;s tuition payment. Remaining
          monthly payments will be recalculated automatically.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {chargeId && !readOnly ? (
          <button
            type="button"
            onClick={() => onApplyTaxCredit(chargeId)}
            className={gBtnOutlineSm}
          >
            {EXTRA_PAY_BANNER_CTA}
          </button>
        ) : null}
        <button type="button" className={gLinkSm} onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
