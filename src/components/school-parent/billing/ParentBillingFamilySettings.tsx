"use client";

import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import ParentPaymentMethodCard from "@/components/school-parent/billing/ParentPaymentMethodCard";
import type { SavedPaymentMethodSummary } from "@/lib/tuition/payment-methods";

type ParentBillingFamilySettingsProps = {
  C: AdminThemeTokens;
  autopayEnabled: boolean;
  savedPaymentMethod: SavedPaymentMethodSummary | null;
  paymentMethodLoading: boolean;
  onAutopayToggleRequest: (enabled: boolean) => void;
  onManagePaymentMethod: () => void;
  readOnly?: boolean;
};

export default function ParentBillingFamilySettings({
  C,
  autopayEnabled,
  savedPaymentMethod,
  paymentMethodLoading,
  onAutopayToggleRequest,
  onManagePaymentMethod,
  readOnly = false,
}: ParentBillingFamilySettingsProps) {
  return (
    <div className="flex flex-col gap-4" data-testid="parent-billing-family-settings">
      <ParentPaymentMethodCard
        C={C}
        savedPaymentMethod={savedPaymentMethod}
        loading={paymentMethodLoading}
        onManage={onManagePaymentMethod}
        readOnly={readOnly}
      />

      <div
        className="flex items-center justify-between gap-4 rounded-xl px-4 py-3"
        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
      >
        <div className="min-w-0">
          <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
            Autopay
          </p>
          <p className="text-xs mt-0.5" style={{ color: C.textSecondary }}>
            {autopayEnabled
              ? "Due charges are paid automatically with your saved card."
              : "Pay each charge manually in the parent portal."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={autopayEnabled}
          aria-label="Autopay"
          data-testid="parent-billing-autopay-toggle"
          disabled={readOnly}
          onClick={() => {
            if (readOnly) return;
            onAutopayToggleRequest(!autopayEnabled);
          }}
          className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: autopayEnabled ? C.accent : C.border,
          }}
        >
          <span
            className="inline-block h-5 w-5 rounded-full bg-white transition-transform"
            style={{
              transform: autopayEnabled ? "translateX(22px)" : "translateX(2px)",
            }}
          />
        </button>
      </div>
    </div>
  );
}
