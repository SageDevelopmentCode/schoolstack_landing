"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, CreditCard, X } from "lucide-react";
import { formatFeeAmount } from "@/lib/admissions/application-form-schema";
import type { ChecklistPaymentLineItem } from "@/lib/admissions/enrollment-checklist-schema";
import {
  quoteProcessingFee,
  type CheckoutPaymentMethod,
} from "@/lib/stripe/processing-fee";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  formatPaymentMethodLabel,
  type SavedPaymentMethodSummary,
} from "@/lib/tuition/payment-methods";

type PaymentMethodSelectionModalProps = {
  C: AdminThemeTokens;
  open: boolean;
  onClose: () => void;
  netAmountCents: number;
  label: string;
  lineItems?: ChecklistPaymentLineItem[];
  variant?: "single" | "combined";
  loading?: boolean;
  error?: string | null;
  savedPaymentMethod?: SavedPaymentMethodSummary | null;
  beforeSummary?: ReactNode;
  confirmDisabled?: boolean;
  onConfirm: (method: CheckoutPaymentMethod) => void | Promise<void>;
};

function formatSavedCardExpiry(method: SavedPaymentMethodSummary | null): string | null {
  if (!method?.expMonth || !method?.expYear) return null;
  const month = String(method.expMonth).padStart(2, "0");
  const year = String(method.expYear).slice(-2);
  return `${month}/${year}`;
}

function MethodOption({
  C,
  selected,
  title,
  description,
  feeCents,
  icon: Icon,
  iconBackground,
  iconColor,
  onSelect,
}: {
  C: AdminThemeTokens;
  selected: boolean;
  title: string;
  description: string;
  feeCents: number;
  icon: typeof CreditCard;
  iconBackground: string;
  iconColor: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition"
      style={{
        borderColor: selected ? C.accent : C.border,
        backgroundColor: selected ? C.accentLight : "#FFFFFF",
        boxShadow: selected ? `0 0 0 1px ${C.accent}` : "none",
      }}
    >
      <span
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
        style={{
          borderColor: selected ? C.accent : C.border,
          backgroundColor: selected ? C.accent : "transparent",
        }}
        aria-hidden="true"
      >
        {selected ? (
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: "#FFFFFF" }}
          />
        ) : null}
      </span>
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: iconBackground }}
        aria-hidden="true"
      >
        <Icon className="h-4 w-4" style={{ color: iconColor }} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className="block text-sm font-semibold"
          style={{ color: C.textPrimary }}
        >
          {title}
        </span>
        <span
          className="mt-0.5 block text-xs"
          style={{ color: C.textSecondary }}
        >
          {description}
        </span>
      </span>
      <span
        className="shrink-0 text-xs tabular-nums"
        style={{ color: C.textTertiary }}
      >
        ~{formatFeeAmount(feeCents)} fee
      </span>
    </button>
  );
}

function PaymentSummary({
  C,
  label,
  lineItems,
  feeLabel,
  netAmountCents,
  processingFeeCents,
  grossAmountCents,
}: {
  C: AdminThemeTokens;
  label: string;
  lineItems?: ChecklistPaymentLineItem[];
  feeLabel: string;
  netAmountCents: number;
  processingFeeCents: number;
  grossAmountCents: number;
}) {
  return (
    <div
      id="payment-method-summary"
      className="rounded-lg border px-4 py-3"
      style={{
        borderColor: C.border,
        backgroundColor: C.elevated,
      }}
    >
      <div className="space-y-2 text-sm">
        {lineItems?.length ? (
          lineItems.map((lineItem) => (
            <div
              key={lineItem.id}
              className="flex items-baseline justify-between gap-4"
            >
              <span style={{ color: C.textSecondary }}>{lineItem.label}</span>
              <span className="tabular-nums" style={{ color: C.textPrimary }}>
                {formatFeeAmount(lineItem.amountCents)}
              </span>
            </div>
          ))
        ) : (
          <div className="flex items-baseline justify-between gap-4">
            <span style={{ color: C.textSecondary }}>{label}</span>
            <span className="tabular-nums" style={{ color: C.textPrimary }}>
              {formatFeeAmount(netAmountCents)}
            </span>
          </div>
        )}
        <div className="flex items-baseline justify-between gap-4">
          <span style={{ color: C.textSecondary }}>{feeLabel}</span>
          <span className="tabular-nums" style={{ color: C.textPrimary }}>
            {formatFeeAmount(processingFeeCents)}
          </span>
        </div>
      </div>
      <div
        className="my-3 border-t"
        style={{ borderColor: C.border }}
      />
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-semibold" style={{ color: C.textPrimary }}>
          Total due today
        </span>
        <span
          className="text-base font-semibold tabular-nums"
          style={{ color: C.accentDark }}
        >
          {formatFeeAmount(grossAmountCents)}
        </span>
      </div>
    </div>
  );
}

export default function PaymentMethodSelectionModal({
  C,
  open,
  onClose,
  netAmountCents,
  label,
  lineItems,
  variant = "single",
  loading = false,
  error = null,
  savedPaymentMethod = null,
  beforeSummary = null,
  confirmDisabled = false,
  onConfirm,
}: PaymentMethodSelectionModalProps) {
  const [selectedMethod, setSelectedMethod] =
    useState<CheckoutPaymentMethod>("card");

  const canQuoteFees = open && netAmountCents > 0;

  const cardQuote = useMemo(() => {
    if (!canQuoteFees) {
      return {
        netAmountCents: Math.max(0, netAmountCents),
        processingFeeCents: 0,
        grossAmountCents: Math.max(0, netAmountCents),
        paymentMethod: "card" as const,
      };
    }
    return quoteProcessingFee(netAmountCents, "card");
  }, [canQuoteFees, netAmountCents]);
  const achQuote = useMemo(() => {
    if (!canQuoteFees) {
      return {
        netAmountCents: Math.max(0, netAmountCents),
        processingFeeCents: 0,
        grossAmountCents: Math.max(0, netAmountCents),
        paymentMethod: "us_bank_account" as const,
      };
    }
    return quoteProcessingFee(netAmountCents, "us_bank_account");
  }, [canQuoteFees, netAmountCents]);

  useEffect(() => {
    if (open) {
      queueMicrotask(() => setSelectedMethod("card"));
    }
  }, [open]);

  const selectedQuote =
    selectedMethod === "card" ? cardQuote : achQuote;
  const feeLabel =
    selectedMethod === "card" ? "Card fee" : "Bank fee";
  const isCombined = variant === "combined";
  const savedCardLabel = formatPaymentMethodLabel(savedPaymentMethod);
  const savedCardExpiry = formatSavedCardExpiry(savedPaymentMethod);
  const showSavedCardHint =
    selectedMethod === "card" && savedCardLabel != null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-end justify-center p-4 pb-safe sm:items-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}
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
            aria-describedby={
              isCombined
                ? "payment-method-summary payment-method-combined-note payment-method-disclaimer"
                : "payment-method-summary payment-method-disclaimer"
            }
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="payment-method-title"
                  className="text-lg font-semibold"
                  style={{ color: C.accentDark }}
                >
                  How would you like to pay?
                </h2>
                <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
                  {label}
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

            {beforeSummary}

            <div className="space-y-2">
              <MethodOption
                C={C}
                selected={selectedMethod === "card"}
                title="Card"
                description="Debit or credit card"
                feeCents={cardQuote.processingFeeCents}
                icon={CreditCard}
                iconBackground="#EFF6FF"
                iconColor="#2563EB"
                onSelect={() => setSelectedMethod("card")}
              />
              <MethodOption
                C={C}
                selected={selectedMethod === "us_bank_account"}
                title="Bank account"
                description="Pay from your US bank"
                feeCents={achQuote.processingFeeCents}
                icon={Building2}
                iconBackground="#ECFDF3"
                iconColor="#16A34A"
                onSelect={() => setSelectedMethod("us_bank_account")}
              />
            </div>

            {showSavedCardHint ? (
              <div
                className="mt-4 rounded-lg border px-4 py-3 text-sm"
                style={{
                  borderColor: C.border,
                  backgroundColor: C.elevated,
                }}
                data-testid="payment-method-saved-card-hint"
              >
                <p style={{ color: C.textPrimary }}>
                  Card on file: {savedCardLabel}
                  {savedCardExpiry ? ` · Expires ${savedCardExpiry}` : ""}
                </p>
                <p className="mt-1 text-xs" style={{ color: C.textSecondary }}>
                  You&apos;ll confirm this card (or choose another) on the next screen.
                </p>
              </div>
            ) : null}

            <div className="mt-4">
              <PaymentSummary
                C={C}
                label={label}
                lineItems={lineItems}
                feeLabel={feeLabel}
                netAmountCents={selectedQuote.netAmountCents}
                processingFeeCents={selectedQuote.processingFeeCents}
                grossAmountCents={selectedQuote.grossAmountCents}
              />
            </div>

            {isCombined ? (
              <p
                id="payment-method-combined-note"
                className="mt-3 text-sm leading-relaxed"
                style={{ color: C.textSecondary }}
              >
                You&apos;ll be charged once for all children listed above. One processing
                fee applies for the whole family instead of paying separately for each
                child.
              </p>
            ) : null}

            <p
              id="payment-method-disclaimer"
              className="mt-3 text-xs leading-relaxed"
              style={{ color: C.textTertiary }}
            >
              Fees are estimated for US card and bank payments.
            </p>

            {error ? (
              <p
                className="mt-3 text-sm"
                style={{ color: C.error }}
                data-testid="payment-method-error"
                role="alert"
              >
                {error}
              </p>
            ) : null}

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
                disabled={loading || confirmDisabled}
                className="rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: C.accent }}
              >
                {loading
                  ? "Redirecting…"
                  : `Continue — ${formatFeeAmount(selectedQuote.grossAmountCents)}`}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
