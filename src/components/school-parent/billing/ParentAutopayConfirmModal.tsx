"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  formatPaymentMethodLabel,
  type SavedPaymentMethodSummary,
} from "@/lib/tuition/payment-methods";

type ParentAutopayConfirmModalProps = {
  C: AdminThemeTokens;
  open: boolean;
  enabling: boolean;
  savedPaymentMethod: SavedPaymentMethodSummary | null;
  saving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ParentAutopayConfirmModal({
  C,
  open,
  enabling,
  savedPaymentMethod,
  saving,
  onConfirm,
  onCancel,
}: ParentAutopayConfirmModalProps) {
  const paymentLabel = formatPaymentMethodLabel(savedPaymentMethod);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={onCancel}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="autopay-confirm-title"
            className="relative w-full max-w-md rounded-xl p-5 flex flex-col gap-4"
            style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id="autopay-confirm-title"
                  className="text-lg font-semibold"
                  style={{ color: C.textPrimary }}
                >
                  {enabling ? "Turn on autopay?" : "Turn off autopay?"}
                </h2>
                <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
                  {enabling
                    ? "Your saved payment method will be charged automatically on each due date."
                    : "You will need to pay each tuition charge manually in the parent portal."}
                </p>
              </div>
              <button type="button" onClick={onCancel} aria-label="Close">
                <X className="w-5 h-5" style={{ color: C.textSecondary }} />
              </button>
            </div>

            {enabling ? (
              paymentLabel ? (
                <p
                  className="text-sm rounded-lg px-3 py-2"
                  style={{ backgroundColor: C.bg, color: C.textSecondary, border: `1px solid ${C.border}` }}
                >
                  Saved card: <span style={{ color: C.textPrimary }}>{paymentLabel}</span>
                </p>
              ) : (
                <p
                  className="text-sm rounded-lg px-3 py-2"
                  style={{
                    backgroundColor: C.accentLight,
                    color: C.textPrimary,
                    border: `1px solid ${C.border}`,
                  }}
                  data-testid="autopay-no-card-warning"
                >
                  Add a payment method before autopay can run. You can add a card below
                  without paying a charge.
                </p>
              )
            ) : null}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                style={getAdminButtonStyle(C, "secondary")}
                className="px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={saving}
                style={getAdminButtonStyle(C, "primary")}
                className="px-4 py-2 text-sm font-medium"
                data-testid="autopay-confirm-button"
              >
                {saving
                  ? "Saving…"
                  : enabling
                    ? "Turn on autopay"
                    : "Turn off autopay"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
