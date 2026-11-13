"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Check, CreditCard, Loader2, Lock, X } from "lucide-react";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import {
  GKicker,
  G_FOCUS,
  gBtnOutlineSm,
  gBtnPopSm,
} from "@/components/school-parent/garden/ui";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
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
  /**
   * "parent-garden" renders the parent portal Garden look (school accent,
   * Garden type) and requires `theme`. Admissions callers keep "default".
   */
  appearance?: "default" | "parent-garden";
  theme?: ParentThemeTokens;
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
  savedCardSummary = null,
  savedCardNote = null,
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
  savedCardSummary?: string | null;
  savedCardNote?: string | null;
  onSelect: () => void;
}) {
  const showSavedCard = selected && savedCardSummary != null;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="flex h-full flex-col gap-2 rounded-lg border px-3 py-3 text-left transition"
      style={{
        borderColor: selected ? C.accent : C.border,
        backgroundColor: selected ? C.accentLight : "#FFFFFF",
        boxShadow: selected ? `0 0 0 1px ${C.accent}` : "none",
      }}
    >
      <span className="flex items-center justify-between">
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
      </span>
      <span className="min-w-0">
        {showSavedCard ? (
          <>
            <div className="flex min-w-0 items-baseline justify-between gap-1">
              <span
                className="shrink-0 text-sm font-semibold"
                style={{ color: C.textPrimary }}
              >
                {title}
              </span>
              <span
                className="truncate text-[11px]"
                style={{ color: C.textSecondary }}
              >
                {savedCardSummary}
              </span>
            </div>
            {savedCardNote ? (
              <p
                className="mt-0.5 text-[11px] leading-snug"
                style={{ color: C.textTertiary }}
                data-testid="payment-method-saved-card-hint"
              >
                {savedCardNote}
              </p>
            ) : null}
          </>
        ) : (
          <>
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
          </>
        )}
      </span>
      <span
        className="text-xs tabular-nums"
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


/* ------------------------------------------------------------------ */
/* Parent portal "Garden" appearance                                   */
/* ------------------------------------------------------------------ */

const GARDEN_STEPS = ["Amount", "Method", "Secure checkout"] as const;

function GardenSteps({ activeIndex }: { activeIndex: number }) {
  return (
    <ol aria-hidden="true" className="m-0 mb-4 flex list-none items-center gap-1.5 p-0">
      {GARDEN_STEPS.map((step, index) => {
        const done = index < activeIndex;
        const active = index === activeIndex;
        return (
          <li key={step} className="flex items-center gap-1.5">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full border-[1.5px] text-[10px] font-extrabold ${
                done
                  ? "border-[var(--sf-forest)] bg-[var(--sf-mint)] text-[var(--sf-forest)]"
                  : active
                    ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white"
                    : "border-[var(--sf-ink)]/25 bg-white text-[var(--sf-ink)]/50"
              }`}
            >
              {done ? <Check className="h-3 w-3" strokeWidth={3} /> : index + 1}
            </span>
            <span
              className={`text-[11px] font-extrabold uppercase tracking-[0.12em] ${
                active ? "text-[var(--sf-ink)]" : "text-[var(--sf-soft)]"
              }`}
            >
              {step}
            </span>
            {index < GARDEN_STEPS.length - 1 ? (
              <span className="mx-0.5 h-px w-4 bg-[var(--sf-ink)]/20 sm:w-6" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function GardenMethodOption({
  selected,
  title,
  description,
  feeCents,
  icon: Icon,
  savedCardSummary = null,
  savedCardNote = null,
  onSelect,
}: {
  selected: boolean;
  title: string;
  description: string;
  feeCents: number;
  icon: typeof CreditCard;
  savedCardSummary?: string | null;
  savedCardNote?: string | null;
  onSelect: () => void;
}) {
  const showSavedCard = selected && savedCardSummary != null;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex h-full flex-col gap-2 rounded-[18px] border-2 px-3.5 py-3 text-left transition-all duration-200 ${G_FOCUS} ${
        selected
          ? "border-[var(--sf-ink)] bg-[var(--sf-accent-wash)] shadow-[0_3px_0_0_var(--sf-ink)]"
          : "border-[var(--sf-ink)]/15 bg-white hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/40"
      }`}
    >
      <span className="flex items-center justify-between">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white ring-2 ring-[var(--sf-ink)]"
          aria-hidden="true"
        >
          <Icon className="h-4 w-4 text-[var(--sf-clay-deep)]" strokeWidth={2.4} />
        </span>
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
            selected
              ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white"
              : "border-[var(--sf-ink)]/30 bg-white"
          }`}
          aria-hidden="true"
        >
          {selected ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
        </span>
      </span>
      <span className="min-w-0">
        {showSavedCard ? (
          <>
            <span className="flex min-w-0 items-baseline justify-between gap-1">
              <span className="shrink-0 text-[15px] font-extrabold text-[var(--sf-ink)]">
                {title}
              </span>
              <span className="truncate text-[11px] font-semibold text-[var(--sf-soft)]">
                {savedCardSummary}
              </span>
            </span>
            {savedCardNote ? (
              <span
                className="mt-0.5 block text-[11px] font-semibold leading-snug text-[var(--sf-soft)]"
                data-testid="payment-method-saved-card-hint"
              >
                {savedCardNote}
              </span>
            ) : null}
          </>
        ) : (
          <>
            <span className="block text-[15px] font-extrabold text-[var(--sf-ink)]">{title}</span>
            <span className="mt-0.5 block text-xs font-semibold text-[var(--sf-soft)]">
              {description}
            </span>
          </>
        )}
      </span>
      <span className="text-xs font-bold tabular-nums text-[var(--sf-ink)]/60">
        ~{formatFeeAmount(feeCents)} fee
      </span>
    </button>
  );
}

function GardenPaymentSummary({
  label,
  lineItems,
  feeLabel,
  netAmountCents,
  processingFeeCents,
  grossAmountCents,
}: {
  label: string;
  lineItems?: ChecklistPaymentLineItem[];
  feeLabel: string;
  netAmountCents: number;
  processingFeeCents: number;
  grossAmountCents: number;
}) {
  return (
    <div id="payment-method-summary" className="sf-paper rounded-[18px] px-4 py-3.5">
      <div className="flex flex-col gap-2 text-sm font-semibold">
        {lineItems?.length ? (
          lineItems.map((lineItem) => (
            <div key={lineItem.id} className="flex items-baseline justify-between gap-4">
              <span className="text-[var(--sf-ink)]/70">{lineItem.label}</span>
              <span className="tabular-nums text-[var(--sf-ink)]">
                {formatFeeAmount(lineItem.amountCents)}
              </span>
            </div>
          ))
        ) : (
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-[var(--sf-ink)]/70">{label}</span>
            <span className="tabular-nums text-[var(--sf-ink)]">
              {formatFeeAmount(netAmountCents)}
            </span>
          </div>
        )}
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[var(--sf-ink)]/70">{feeLabel}</span>
          <span className="tabular-nums text-[var(--sf-ink)]">
            {formatFeeAmount(processingFeeCents)}
          </span>
        </div>
      </div>
      <div className="my-3 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/20" />
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[15px] font-extrabold text-[var(--sf-ink)]">Total due today</span>
        <span className="sf-display text-[1.4rem] leading-none tabular-nums text-[var(--sf-ink)]">
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
  appearance = "default",
  theme,
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
  const savedCardSummary =
    savedCardLabel != null
      ? `${savedCardLabel}${savedCardExpiry ? ` · Expires ${savedCardExpiry}` : ""}`
      : null;

  if (appearance === "parent-garden" && theme) {
    return (
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[120] flex items-end justify-center bg-[rgba(43,36,29,0.42)] backdrop-blur-[2px] sm:items-center sm:p-4"
            onClick={loading ? undefined : onClose}
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.3, ease: PORTAL_EASE }}
              className="max-h-[92dvh] w-full overflow-y-auto rounded-t-[24px] sm:max-w-lg sm:rounded-[24px]"
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
              <ParentGardenFrame
                theme={theme}
                className="border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_3px_0_0_rgba(43,36,29,0.08)] sm:p-6"
              >
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <GKicker>Tuition payment</GKicker>
                    <h2
                      id="payment-method-title"
                      className="sf-display m-0 mt-1 text-[1.5rem] leading-[1.05] text-[var(--sf-ink)]"
                    >
                      How would you like to pay?
                    </h2>
                    <p className="m-0 mt-1 text-sm font-semibold text-[var(--sf-soft)]">{label}</p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[var(--sf-ink)]/20 text-[var(--sf-ink)]/70 hover:border-[var(--sf-ink)]/50 disabled:opacity-50 ${G_FOCUS}`}
                    aria-label="Close"
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <GardenSteps activeIndex={loading ? 2 : 1} />

                {beforeSummary}

                <div className="grid grid-cols-2 gap-2.5">
                  <GardenMethodOption
                    selected={selectedMethod === "card"}
                    title="Card"
                    description="Debit or credit card"
                    feeCents={cardQuote.processingFeeCents}
                    icon={CreditCard}
                    savedCardSummary={selectedMethod === "card" ? savedCardSummary : null}
                    savedCardNote="Confirm or change card on the next screen."
                    onSelect={() => setSelectedMethod("card")}
                  />
                  <GardenMethodOption
                    selected={selectedMethod === "us_bank_account"}
                    title="Bank account"
                    description="Pay from your US bank"
                    feeCents={achQuote.processingFeeCents}
                    icon={Building2}
                    onSelect={() => setSelectedMethod("us_bank_account")}
                  />
                </div>

                <div className="mt-4">
                  <GardenPaymentSummary
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
                    className="m-0 mt-3 rounded-2xl bg-[var(--sf-sky)] px-3.5 py-2.5 text-[13px] font-semibold leading-relaxed text-[var(--sf-ink)]/80"
                  >
                    You&apos;ll be charged once for all children listed above. One processing
                    fee applies for the whole family instead of paying separately for each
                    child.
                  </p>
                ) : null}

                <p
                  id="payment-method-disclaimer"
                  className="m-0 mt-3 inline-flex items-center gap-1.5 text-xs font-semibold leading-relaxed text-[var(--sf-soft)]"
                >
                  <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Fees are estimated for US card and bank payments.
                </p>

                {error ? (
                  <p
                    className="m-0 mt-3 rounded-2xl bg-[var(--sf-peach)] px-3.5 py-2.5 text-sm font-bold text-[var(--sf-clay-deep)]"
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
                    className={gBtnOutlineSm}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void onConfirm(selectedMethod)}
                    disabled={loading || confirmDisabled}
                    aria-busy={loading || undefined}
                    className={gBtnPopSm}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                    {loading
                      ? "Redirecting…"
                      : `Continue — ${formatFeeAmount(selectedQuote.grossAmountCents)}`}
                  </button>
                </div>
              </ParentGardenFrame>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    );
  }

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

            <div className="grid grid-cols-2 gap-2">
              <MethodOption
                C={C}
                selected={selectedMethod === "card"}
                title="Card"
                description="Debit or credit card"
                feeCents={cardQuote.processingFeeCents}
                icon={CreditCard}
                iconBackground="#EFF6FF"
                iconColor="#2563EB"
                savedCardSummary={
                  selectedMethod === "card" ? savedCardSummary : null
                }
                savedCardNote="Confirm or change card on the next screen."
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
