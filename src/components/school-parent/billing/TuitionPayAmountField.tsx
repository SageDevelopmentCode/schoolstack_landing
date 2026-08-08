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

export type TuitionPayAmountMode = "balance" | "custom";

type TuitionPayAmountFieldProps = {
  C: AdminThemeTokens;
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
  C,
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

  return (
    <div
      className="mb-4 space-y-3"
      data-testid="tuition-pay-amount-field"
    >
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onModeChange("balance")}
          className="flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition"
          style={{
            borderColor: mode === "balance" ? C.accent : C.border,
            backgroundColor: mode === "balance" ? C.accentLight : C.surface,
            color: C.textPrimary,
          }}
          aria-pressed={mode === "balance"}
        >
          Pay balance ({formatCents(remainingCents)})
        </button>
        <button
          type="button"
          onClick={() => onModeChange("custom")}
          className="flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition"
          style={{
            borderColor: mode === "custom" ? C.accent : C.border,
            backgroundColor: mode === "custom" ? C.accentLight : C.surface,
            color: C.textPrimary,
          }}
          aria-pressed={mode === "custom"}
          data-testid="tuition-pay-extra-mode-button"
        >
          {EXTRA_PAY_MODE_LABEL}
        </button>
      </div>

      {mode === "custom" ? (
        <div className="space-y-3">
          <p className="text-xs" style={{ color: C.textTertiary }}>
            Use a tax credit, bonus, or lump sum to pay ahead. Extra amounts reduce future
            installments automatically.
          </p>

          {showTaxCreditPreset && taxCreditAmountCents != null ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPreset(taxCreditAmountCents)}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium transition"
                style={{
                  borderColor: C.border,
                  backgroundColor: C.surface,
                  color: C.textPrimary,
                }}
                data-testid="tuition-pay-tax-credit-preset"
              >
                Apply $5,000 tax credit ({formatCents(taxCreditAmountCents)})
              </button>
            </div>
          ) : null}

          <div>
            <label
              htmlFor="tuition-pay-custom-amount"
              className="mb-1 block text-xs font-medium"
              style={{ color: C.textSecondary }}
            >
              Payment amount
            </label>
            <div className="relative">
              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: C.textTertiary }}
              >
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
                className="w-full rounded-lg border py-2 pl-7 pr-3 text-sm"
                style={{
                  borderColor: error ? C.error : C.border,
                  backgroundColor: C.surface,
                  color: C.textPrimary,
                }}
                placeholder={formatCentsForInput(remainingCents)}
                data-testid="tuition-pay-custom-amount-input"
              />
            </div>
            <p className="mt-1 text-xs" style={{ color: C.textTertiary }}>
              Pay from {formatCents(remainingCents)} (this installment) up to{" "}
              {formatCents(maxCents)} (all remaining for this student).
            </p>
            {error ? (
              <p className="mt-1 text-xs" style={{ color: C.error }} role="alert">
                {error}
              </p>
            ) : null}
          </div>

          {schedulePreview ? (
            <TuitionPaySchedulePreview
              C={C}
              paymentAmountCents={amountCents}
              currentChargeRemainingCents={remainingCents}
              preview={schedulePreview}
            />
          ) : null}
        </div>
      ) : (
        <p className="text-xs" style={{ color: C.textTertiary }}>
          Pay extra toward tuition to apply a tax credit, bonus, or lump sum — future
          installments are recalculated automatically.
        </p>
      )}
    </div>
  );
}
