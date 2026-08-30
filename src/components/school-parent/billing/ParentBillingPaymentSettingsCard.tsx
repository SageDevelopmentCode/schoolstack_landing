"use client";

import { Loader2 } from "lucide-react";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import {
  formatPaymentMethodLabel,
  type SavedPaymentMethodSummary,
} from "@/lib/tuition/payment-methods";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentBillingPaymentSettingsCardProps = {
  theme: ParentThemeTokens;
  autopayEnabled: boolean;
  savedPaymentMethod: SavedPaymentMethodSummary | null;
  paymentMethodLoading: boolean;
  onAutopayToggleRequest: (enabled: boolean) => void;
  onManagePaymentMethod: () => void;
  readOnly?: boolean;
};

export default function ParentBillingPaymentSettingsCard({
  theme,
  autopayEnabled,
  savedPaymentMethod,
  paymentMethodLoading,
  onAutopayToggleRequest,
  onManagePaymentMethod,
  readOnly = false,
}: ParentBillingPaymentSettingsCardProps) {
  const methodLabel = formatPaymentMethodLabel(savedPaymentMethod);

  return (
    <ParentCard
      theme={theme}
      variant="primary"
      className="!flex !h-full !flex-col !p-6"
      data-testid="parent-billing-family-settings"
    >
      <ParentSectionKicker theme={theme} light>
        Payment settings
      </ParentSectionKicker>

      <h3
        className="font-heading text-xl font-semibold"
        style={{ fontFamily: theme.fontDisplay, color: theme.white }}
      >
        {autopayEnabled ? "Autopay is on" : "Autopay is off"}
      </h3>

      <p className="mt-2 text-xs leading-relaxed" style={{ color: "#D6E6D9" }}>
        {autopayEnabled
          ? "Due charges are paid automatically with your saved card on each due date."
          : "Turn on automatic payments and we'll process each scheduled tuition payment on its due date."}
      </p>

      <div
        className="mt-3 flex items-center justify-between gap-3 border-t pt-3 text-[11px]"
        style={{ borderColor: "rgba(255,255,255,0.17)", color: "#D4E4D7" }}
        data-testid="parent-payment-method-card"
      >
        <span>Payment method</span>
        <button
          type="button"
          onClick={() => {
            if (readOnly) return;
            onManagePaymentMethod();
          }}
          disabled={readOnly || paymentMethodLoading}
          className="font-bold disabled:opacity-50"
          style={{ color: theme.white }}
          data-testid="parent-payment-method-manage"
        >
          {paymentMethodLoading ? (
            <Loader2 className="inline h-3 w-3 animate-spin" />
          ) : null}{" "}
          {methodLabel ? `${methodLabel} →` : "Add a card →"}
          {readOnly ? " (preview)" : ""}
        </button>
      </div>

      <ParentButton
        theme={theme}
        variant="soft"
        className="mt-4 w-full !bg-white !text-[#315E4F] sm:w-auto"
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
      </ParentButton>
    </ParentCard>
  );
}
