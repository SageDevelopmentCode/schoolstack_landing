"use client";

import { CreditCard, Loader2 } from "lucide-react";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  formatPaymentMethodLabel,
  type SavedPaymentMethodSummary,
} from "@/lib/tuition/payment-methods";

type ParentPaymentMethodCardProps = {
  C: AdminThemeTokens;
  savedPaymentMethod: SavedPaymentMethodSummary | null;
  loading: boolean;
  onManage: () => void;
  readOnly?: boolean;
};

function formatExpiry(method: SavedPaymentMethodSummary | null): string | null {
  if (!method?.expMonth || !method?.expYear) return null;
  const month = String(method.expMonth).padStart(2, "0");
  const year = String(method.expYear).slice(-2);
  return `${month}/${year}`;
}

export default function ParentPaymentMethodCard({
  C,
  savedPaymentMethod,
  loading,
  onManage,
  readOnly = false,
}: ParentPaymentMethodCardProps) {
  const label = formatPaymentMethodLabel(savedPaymentMethod);
  const expiry = formatExpiry(savedPaymentMethod);

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-3"
      style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
      data-testid="parent-payment-method-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide" style={{ color: C.textTertiary }}>
            Payment method
          </p>
          {label ? (
            <p className="text-sm font-medium mt-1" style={{ color: C.textPrimary }}>
              {label}
              {expiry ? (
                <span className="font-normal" style={{ color: C.textSecondary }}>
                  {" "}
                  · Expires {expiry}
                </span>
              ) : null}
            </p>
          ) : (
            <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
              No payment method on file
            </p>
          )}
          <p className="text-xs mt-1" style={{ color: C.textTertiary }}>
            Used for autopay and online tuition payments.
          </p>
        </div>
        <CreditCard className="w-5 h-5 shrink-0" style={{ color: C.textTertiary }} />
      </div>

      <button
        type="button"
        onClick={() => {
          if (readOnly) return;
          onManage();
        }}
        disabled={readOnly || loading}
        style={getAdminButtonStyle(C, label ? "secondary" : "primary")}
        className="self-start inline-flex items-center gap-2 px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid="parent-payment-method-manage"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {label ? "Update card" : "Add card"}
        {readOnly ? " (preview)" : ""}
      </button>
    </div>
  );
}
