"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, CreditCard, X } from "lucide-react";
import { formatFeeAmount } from "@/lib/admissions/application-form-schema";
import {
  paymentMethodLabel,
  quoteProcessingFee,
  type CheckoutPaymentMethod,
} from "@/lib/stripe/processing-fee";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type PaymentMethodSelectionModalProps = {
  C: AdminThemeTokens;
  open: boolean;
  onClose: () => void;
  netAmountCents: number;
  label: string;
  loading?: boolean;
  onConfirm: (method: CheckoutPaymentMethod) => void | Promise<void>;
};

function MethodOption({
  C,
  selected,
  title,
  description,
  feeCents,
  totalCents,
  icon: Icon,
  onSelect,
}: {
  C: AdminThemeTokens;
  selected: boolean;
  title: string;
  description: string;
  feeCents: number;
  totalCents: number;
  icon: typeof CreditCard;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full rounded-lg border px-4 py-3 text-left transition"
      style={{
        borderColor: selected ? C.accent : C.border,
        backgroundColor: selected ? C.accentLight : "#FFFFFF",
        boxShadow: selected ? `0 0 0 1px ${C.accent}` : "none",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md"
          style={{
            backgroundColor: selected ? "#FFFFFF" : C.elevated,
            color: C.accent,
          }}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
            {title}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: C.textSecondary }}>
            {description}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <span style={{ color: C.textSecondary }}>
              Processing fee: {formatFeeAmount(feeCents)}
            </span>
            <span className="font-medium" style={{ color: C.textPrimary }}>
              Total: {formatFeeAmount(totalCents)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function PaymentMethodSelectionModal({
  C,
  open,
  onClose,
  netAmountCents,
  label,
  loading = false,
  onConfirm,
}: PaymentMethodSelectionModalProps) {
  const [selectedMethod, setSelectedMethod] =
    useState<CheckoutPaymentMethod>("card");

  const cardQuote = useMemo(
    () => quoteProcessingFee(netAmountCents, "card"),
    [netAmountCents],
  );
  const achQuote = useMemo(
    () => quoteProcessingFee(netAmountCents, "us_bank_account"),
    [netAmountCents],
  );

  useEffect(() => {
    if (open) {
      setSelectedMethod("card");
    }
  }, [open]);

  const selectedQuote =
    selectedMethod === "card" ? cardQuote : achQuote;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-end justify-center p-4 sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="w-full max-w-lg rounded-xl border p-5 shadow-xl"
            style={{
              borderColor: C.border,
              backgroundColor: C.surface,
              color: C.textPrimary,
            }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-method-title"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="payment-method-title"
                  className="text-lg font-semibold"
                  style={{ color: C.accentDark }}
                >
                  Choose payment method
                </h2>
                <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
                  {label} · School amount {formatFeeAmount(netAmountCents)}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-sm p-1"
                style={{ color: C.textTertiary }}
                aria-label="Close"
                disabled={loading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <MethodOption
                C={C}
                selected={selectedMethod === "card"}
                title={paymentMethodLabel("card")}
                description="Pay with Visa, Mastercard, Amex, or Discover."
                feeCents={cardQuote.processingFeeCents}
                totalCents={cardQuote.grossAmountCents}
                icon={CreditCard}
                onSelect={() => setSelectedMethod("card")}
              />
              <MethodOption
                C={C}
                selected={selectedMethod === "us_bank_account"}
                title={paymentMethodLabel("us_bank_account")}
                description="Pay directly from a US bank account."
                feeCents={achQuote.processingFeeCents}
                totalCents={achQuote.grossAmountCents}
                icon={Building2}
                onSelect={() => setSelectedMethod("us_bank_account")}
              />
            </div>

            <p className="mt-4 text-xs leading-relaxed" style={{ color: C.textTertiary }}>
              Processing fees are estimates based on US domestic card and ACH rates.
              International cards may incur higher fees.
            </p>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-md border px-4 py-2 text-sm font-medium"
                style={{ borderColor: C.border, color: C.textPrimary }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void onConfirm(selectedMethod)}
                disabled={loading}
                className="rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: C.accent }}
              >
                {loading
                  ? "Redirecting…"
                  : `Pay ${formatFeeAmount(selectedQuote.grossAmountCents)}`}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
