"use client";

import {
  annualCentsToTuitionInput,
  formatCents,
  tuitionInputToAnnualCents,
  type TuitionInputMode,
} from "@/lib/tuition/pricing";
import { sanitizeDollarDraft } from "@/lib/admissions/application-form-schema";
import SchoolAdminSegmentedControl from "@/components/school-admin/ui/SchoolAdminSegmentedControl";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type TuitionAmountFieldProps = {
  C: AdminThemeTokens;
  inputMode: TuitionInputMode;
  onInputModeChange: (mode: TuitionInputMode) => void;
  amount: string;
  onAmountChange: (amount: string) => void;
  placeholder?: string;
};

function inputStyle(C: AdminThemeTokens): React.CSSProperties {
  return {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.md,
    fontSize: "14px",
    padding: "10px 12px",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
  };
}

export default function TuitionAmountField({
  C,
  inputMode,
  onInputModeChange,
  amount,
  onAmountChange,
  placeholder = "e.g. 7200",
}: TuitionAmountFieldProps) {
  const parsedAmount = Number(amount);
  const annualAmountCents = tuitionInputToAnnualCents(parsedAmount, inputMode);

  const handleBillingBasisChange = (mode: string) => {
    const nextMode = mode as TuitionInputMode;
    if (nextMode === inputMode) return;
    const currentAnnualCents = tuitionInputToAnnualCents(parsedAmount, inputMode);
    const nextAmount = annualCentsToTuitionInput(currentAnnualCents, nextMode);
    onInputModeChange(nextMode);
    onAmountChange(
      nextAmount > 0
        ? String(
            Number.isInteger(nextAmount)
              ? nextAmount
              : Math.round(nextAmount * 100) / 100,
          )
        : "",
    );
  };

  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-medium" style={{ color: C.textPrimary }}>
          {inputMode === "monthly" ? "How much is monthly tuition?" : "How much is annual tuition?"}
        </span>
        <SchoolAdminSegmentedControl
          C={C}
          value={inputMode}
          onChange={handleBillingBasisChange}
          ariaLabel="Enter tuition as annual or monthly"
          options={[
            { value: "annual", label: "Annual" },
            { value: "monthly", label: "Monthly" },
          ]}
        />
      </div>
      <input
        style={inputStyle(C)}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={amount}
        onChange={(e) => onAmountChange(sanitizeDollarDraft(e.target.value))}
        placeholder={placeholder}
      />
      {annualAmountCents > 0 ? (
        <p className="text-xs" style={{ color: C.textTertiary }}>
          {inputMode === "monthly"
            ? `Equals ${formatCents(annualAmountCents)}/year`
            : `Equals ${formatCents(Math.round(annualAmountCents / 12))}/month`}
        </p>
      ) : null}
    </div>
  );
}
