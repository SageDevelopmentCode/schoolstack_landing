"use client";

import { useMemo } from "react";
import {
  formatCentsForInput,
  parseDollarInputToCents,
  sanitizeDollarDraft,
} from "@/lib/admissions/application-form-schema";
import { formatCents } from "@/lib/tuition/pricing";
import {
  previewTuitionPaymentRedistribution,
  type InstallmentChargeBalance,
} from "@/lib/tuition/payment-settlement";
import {
  taxCreditPresetAmountCents,
} from "@/lib/tuition/tuition-pay-presets";
import {
  maxTuitionPayCents,
  validateTuitionPayAmountCents,
} from "@/lib/tuition/tuition-pay-amount";
import { EXTRA_PAY_MODE_LABEL } from "@/lib/tuition/tuition-pay-copy";
import TuitionPaySchedulePreview from "@/components/school-parent/billing/TuitionPaySchedulePreview";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { G_FOCUS } from "@/components/school-parent/garden/ui";

export type TuitionPayAmountMode = "balance" | "custom";

type TuitionPayAmountFieldProps = {
  /** Kept for call-site compatibility; renders with Garden tokens inside the parent pay modal. */
  C?: AdminThemeTokens;
  remainingCents: number;
  mode: TuitionPayAmountMode;
  customDraft: string;
  payRemainingYearCents?: number;
  showTaxCreditPreset?: boolean;
  futureOpenCharges?: InstallmentChargeBalance[];
  onModeChange: (mode: TuitionPayAmountMode) => void;
  onCustomDraftChange: (value: string) => void;
};

export function resolveTuitionPayAmountCents(input: {
  mode: TuitionPayAmountMode;
  remainingCents: number;
  customDraft: string;
  payRemainingYearCents?: number;
}): { amountCents: number; error: string | null } {
  if (input.mode === "balance") {
    return {
      amountCents: input.remainingCents,
      error: validateTuitionPayAmountCents({
        amountCents: input.remainingCents,
        remainingCents: input.remainingCents,
        payRemainingYearCents: input.payRemainingYearCents,
      }),
    };
  }

  const parsed = parseDollarInputToCents(input.customDraft);
  if (parsed === null) {
    return { amountCents: 0, error: "Enter a valid payment amount." };
  }

  return {
    amountCents: parsed,
    error: validateTuitionPayAmountCents({
      amountCents: parsed,
      remainingCents: input.remainingCents,
      payRemainingYearCents: input.payRemainingYearCents,
    }),
  };
}

export default function TuitionPayAmountField({
  remainingCents,
  mode,
  customDraft,
  payRemainingYearCents = 0,
  showTaxCreditPreset = false,
  futureOpenCharges = [],
  onModeChange,
  onCustomDraftChange,
}: TuitionPayAmountFieldProps) {
  const maxCents = maxTuitionPayCents({
    remainingCents,
    payRemainingYearCents:
      payRemainingYearCents > remainingCents ? payRemainingYearCents : undefined,
  });
  const { amountCents, error } = resolveTuitionPayAmountCents({
    mode,
    remainingCents,
    customDraft,
    payRemainingYearCents:
      payRemainingYearCents > remainingCents ? payRemainingYearCents : undefined,
  });

  const schedulePreview = useMemo(() => {
    if (mode !== "custom" || error || amountCents <= remainingCents) {
      return null;
    }
    return previewTuitionPaymentRedistribution({
      currentChargeRemainingCents: remainingCents,
      paymentAmountCents: amountCents,
      futureOpenCharges,
    });
  }, [amountCents, error, futureOpenCharges, mode, remainingCents]);

  const taxCreditAmountCents =
    showTaxCreditPreset && payRemainingYearCents > remainingCents
      ? taxCreditPresetAmountCents({
          currentChargeRemainingCents: remainingCents,
          payRemainingYearCents,
        })
      : null;

  const applyPreset = (presetCents: number) => {
    onModeChange("custom");
    onCustomDraftChange(formatCentsForInput(presetCents));
  };

  const segment = (active: boolean) =>
    `flex-1 rounded-full px-3 py-2 text-[13px] font-extrabold transition-all duration-200 ${G_FOCUS} focus-visible:ring-offset-0 ${
      active
        ? "bg-[var(--sf-clay)] text-white shadow-[0_2px_0_0_var(--sf-ink)]"
        : "text-[var(--sf-ink)]/70 hover:bg-[var(--sf-accent-wash)] hover:text-[var(--sf-ink)]"
    }`;

  return (
    <div className="mb-4 flex flex-col gap-3" data-testid="tuition-pay-amount-field">
      <div className="flex gap-1 rounded-full border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-1">
        <button
          type="button"
          onClick={() => onModeChange("balance")}
          className={segment(mode === "balance")}
          aria-pressed={mode === "balance"}
        >
          Pay balance ({formatCents(remainingCents)})
        </button>
        <button
          type="button"
          onClick={() => onModeChange("custom")}
          className={segment(mode === "custom")}
          aria-pressed={mode === "custom"}
          data-testid="tuition-pay-extra-mode-button"
        >
          {EXTRA_PAY_MODE_LABEL}
        </button>
      </div>

      {mode === "custom" ? (
        <div className="flex flex-col gap-3">
          <p className="m-0 text-xs font-semibold text-[var(--sf-soft)]">
            Use a tax credit, bonus, or lump sum to pay ahead. Extra amounts reduce future
            installments automatically.
          </p>

          {showTaxCreditPreset && taxCreditAmountCents != null ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPreset(taxCreditAmountCents)}
                className={`rounded-full bg-[var(--sf-butter)] px-3 py-1.5 text-xs font-extrabold text-[var(--sf-ink)] transition-all hover:-translate-y-0.5 ${G_FOCUS}`}
                data-testid="tuition-pay-tax-credit-preset"
              >
                Apply $5,000 tax credit ({formatCents(taxCreditAmountCents)})
              </button>
            </div>
          ) : null}

          <div>
            <label
              htmlFor="tuition-pay-custom-amount"
              className="mb-1 block text-xs font-extrabold text-[var(--sf-ink)]/75"
            >
              Payment amount
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-extrabold text-[var(--sf-soft)]">
                $
              </span>
              <input
                id="tuition-pay-custom-amount"
                type="text"
                inputMode="decimal"
                value={customDraft}
                onChange={(event) =>
                  onCustomDraftChange(sanitizeDollarDraft(event.target.value))
                }
                onBlur={() => {
                  const cents = parseDollarInputToCents(customDraft);
                  onCustomDraftChange(formatCentsForInput(cents ?? 0));
                }}
                aria-invalid={error ? true : undefined}
                aria-describedby="tuition-pay-custom-amount-hint"
                className={`w-full rounded-2xl border-2 bg-white py-2.5 pl-8 pr-3 text-[15px] font-extrabold tabular-nums text-[var(--sf-ink)] ${
                  error ? "border-[var(--sf-clay-deep)]" : "border-[var(--sf-ink)]/25 focus:border-[var(--sf-ink)]"
                } ${G_FOCUS}`}
                placeholder={formatCentsForInput(remainingCents)}
                data-testid="tuition-pay-custom-amount-input"
              />
            </div>
            <p
              id="tuition-pay-custom-amount-hint"
              className="m-0 mt-1 text-xs font-semibold text-[var(--sf-soft)]"
            >
              Pay from {formatCents(remainingCents)} (this installment) up to{" "}
              {formatCents(maxCents)} (all remaining for this student).
            </p>
            {error ? (
              <p className="m-0 mt-1 text-xs font-bold text-[var(--sf-clay-deep)]" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          {schedulePreview ? (
            <TuitionPaySchedulePreview
              paymentAmountCents={amountCents}
              currentChargeRemainingCents={remainingCents}
              preview={schedulePreview}
            />
          ) : null}
        </div>
      ) : (
        <p className="m-0 text-xs font-semibold text-[var(--sf-soft)]">
          Pay extra toward tuition to apply a tax credit, bonus, or lump sum — future
          installments are recalculated automatically.
        </p>
      )}
    </div>
  );
}
