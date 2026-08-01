"use client";

import {
  formatCentsForInput,
  parseDollarInputToCents,
  sanitizeDollarDraft,
} from "@/lib/admissions/application-form-schema";
import { formatCents } from "@/lib/tuition/pricing";
import {
  maxTuitionOverpayCents,
  validateTuitionPayAmountCents,
} from "@/lib/tuition/tuition-pay-amount";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

export type TuitionPayAmountMode = "balance" | "custom";

type TuitionPayAmountFieldProps = {
  C: AdminThemeTokens;
  remainingCents: number;
  mode: TuitionPayAmountMode;
  customDraft: string;
  onModeChange: (mode: TuitionPayAmountMode) => void;
  onCustomDraftChange: (value: string) => void;
};

export function resolveTuitionPayAmountCents(input: {
  mode: TuitionPayAmountMode;
  remainingCents: number;
  customDraft: string;
}): { amountCents: number; error: string | null } {
  if (input.mode === "balance") {
    return {
      amountCents: input.remainingCents,
      error: validateTuitionPayAmountCents({
        amountCents: input.remainingCents,
        remainingCents: input.remainingCents,
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
    }),
  };
}

export default function TuitionPayAmountField({
  C,
  remainingCents,
  mode,
  customDraft,
  onModeChange,
  onCustomDraftChange,
}: TuitionPayAmountFieldProps) {
  const maxCents = maxTuitionOverpayCents(remainingCents);
  const { error } = resolveTuitionPayAmountCents({
    mode,
    remainingCents,
    customDraft,
  });

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
        >
          Pay a different amount
        </button>
      </div>

      {mode === "custom" ? (
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
            Between {formatCents(remainingCents)} and {formatCents(maxCents)}.
            Amounts above your balance are applied to future installments.
          </p>
          {error ? (
            <p className="mt-1 text-xs" style={{ color: C.error }} role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-xs" style={{ color: C.textTertiary }}>
          Amounts above your balance are applied to future installments.
        </p>
      )}
    </div>
  );
}
