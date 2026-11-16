"use client";

import { CreditCard, Loader2, Repeat } from "lucide-react";
import { GCard, gBtnButterSm } from "@/components/school-parent/garden/ui";
import {
  formatPaymentMethodLabel,
  type SavedPaymentMethodSummary,
} from "@/lib/tuition/payment-methods";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentBillingPaymentSettingsCardProps = {
  theme?: ParentThemeTokens;
  autopayEnabled: boolean;
  savedPaymentMethod: SavedPaymentMethodSummary | null;
  paymentMethodLoading: boolean;
  onAutopayToggleRequest: (enabled: boolean) => void;
  onManagePaymentMethod: () => void;
  readOnly?: boolean;
};

/** Autopay + saved card: the billing page's one dark card. */
export default function ParentBillingPaymentSettingsCard({
  autopayEnabled,
  savedPaymentMethod,
  paymentMethodLoading,
  onAutopayToggleRequest,
  onManagePaymentMethod,
  readOnly = false,
}: ParentBillingPaymentSettingsCardProps) {
  const methodLabel = formatPaymentMethodLabel(savedPaymentMethod);

  return (
    <GCard
      index={3}
      tone="dark"
      kicker="Payment settings"
      title={autopayEnabled ? "Autopay is on" : "Autopay is off"}
      headingLevel="h3"
      data-testid="parent-billing-family-settings"
      action={
        <span
          aria-hidden="true"
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
            autopayEnabled
              ? "bg-[var(--sf-butter)] text-[var(--sf-ink)]"
              : "bg-white/15 text-white/85"
          }`}
        >
          <Repeat className="h-3 w-3" />
          {autopayEnabled ? "On" : "Off"}
        </span>
      }
    >
      <p className="m-0 text-[13px] font-semibold leading-relaxed text-white/80">
        {autopayEnabled
          ? "Due charges are paid automatically with your saved card on each due date."
          : "Turn on automatic payments and we'll process each scheduled tuition payment on its due date."}
      </p>

      <div
        className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-white/12 px-3.5 py-3 text-[13px] text-white/80"
        data-testid="parent-payment-method-card"
      >
        <span className="inline-flex items-center gap-2 font-semibold">
          <CreditCard className="h-4 w-4 text-[var(--sf-butter)]" aria-hidden />
          Payment method
        </span>
        <button
          type="button"
          onClick={() => {
            if (readOnly) return;
            onManagePaymentMethod();
          }}
          disabled={readOnly || paymentMethodLoading}
          aria-busy={paymentMethodLoading || undefined}
          className="inline-flex items-center gap-1 rounded-md font-extrabold text-white hover:underline hover:underline-offset-4 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-butter)]/60"
          data-testid="parent-payment-method-manage"
        >
          {paymentMethodLoading ? (
            <Loader2 className="inline h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : null}{" "}
          {methodLabel ? `${methodLabel} →` : "Add a card →"}
          {readOnly ? " (preview)" : ""}
        </button>
      </div>

      <div className="mt-5">
        <button
          type="button"
          className={`${gBtnButterSm} w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto`}
          disabled={readOnly}
          onClick={() => {
            if (readOnly) return;
            onAutopayToggleRequest(!autopayEnabled);
          }}
          data-testid="parent-billing-autopay-toggle"
          aria-checked={autopayEnabled}
          role="switch"
        >
          {autopayEnabled ? "Manage autopay" : "Turn on autopay"}
        </button>
      </div>
    </GCard>
  );
}
