"use client";

import { CircleDollarSign, Layers, Plus, Trash2 } from "lucide-react";
import TuitionAmountField from "@/components/school-admin/tuition/TuitionAmountField";
import SchoolAdminSegmentedControl from "@/components/school-admin/ui/SchoolAdminSegmentedControl";
import {
  annualCentsToTuitionInput,
  formatCents,
  tuitionInputToAnnualCents,
  type TuitionInputMode,
} from "@/lib/tuition/pricing";
import { collapseToSingleTier, normalizeWizardTiers, type WizardTierInput } from "@/lib/tuition/setup-wizard";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type TuitionTiersStepProps = {
  C: AdminThemeTokens;
  pricingMode: "single" | "multiple";
  onPricingModeChange: (mode: "single" | "multiple") => void;
  inputMode: TuitionInputMode;
  onInputModeChange: (mode: TuitionInputMode) => void;
  tiers: WizardTierInput[];
  onTiersChange: (tiers: WizardTierInput[]) => void;
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

export default function TuitionTiersStep({
  C,
  pricingMode,
  onPricingModeChange,
  inputMode,
  onInputModeChange,
  tiers,
  onTiersChange,
}: TuitionTiersStepProps) {
  const setTier = (index: number, patch: Partial<WizardTierInput>) => {
    onTiersChange(
      tiers.map((tier, i) => (i === index ? { ...tier, ...patch } : tier)),
    );
  };

  const addTier = () => {
    onTiersChange(
      normalizeWizardTiers([
        ...tiers,
        {
          label: "",
          amount: "",
          isDefault: false,
        },
      ]),
    );
  };

  const removeTier = (index: number) => {
    if (tiers.length <= 1) return;
    onTiersChange(normalizeWizardTiers(tiers.filter((_, i) => i !== index)));
  };

  const switchPricingMode = (mode: "single" | "multiple") => {
    if (mode === pricingMode) return;
    onPricingModeChange(mode);
    if (mode === "single" && tiers.length > 1) {
      onTiersChange(collapseToSingleTier(tiers));
    }
    if (mode === "multiple" && tiers.length === 1) {
      onTiersChange(
        normalizeWizardTiers([
          { ...tiers[0] },
          { label: "", amount: "", isDefault: false },
        ]),
      );
    }
  };

  const handleInputModeChange = (mode: TuitionInputMode) => {
    onInputModeChange(mode);
    onTiersChange(
      tiers.map((tier) => {
        const annualCents = tuitionInputToAnnualCents(Number(tier.amount), inputMode);
        const nextAmount = annualCentsToTuitionInput(annualCents, mode);
        return {
          ...tier,
          amount:
            nextAmount > 0
              ? String(
                  Number.isInteger(nextAmount)
                    ? nextAmount
                    : Math.round(nextAmount * 100) / 100,
                )
              : "",
        };
      }),
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm" style={{ color: C.textSecondary }}>
        Define one or more tuition rates for this plan. All tiers share the same
        payment schedule and fees. Staff assign the tier per enrollment; families
        choose their payment schedule when multiple options are enabled.
      </p>

      <div className="flex flex-col gap-3">
        <span className="text-sm" style={{ color: C.textSecondary }}>
          Pricing mode
        </span>
        <SchoolAdminSegmentedControl
          C={C}
          value={pricingMode}
          onChange={(mode) => switchPricingMode(mode as "single" | "multiple")}
          ariaLabel="Pricing mode"
          className="self-start"
          options={[
            { value: "single", label: "Single rate", icon: CircleDollarSign },
            { value: "multiple", label: "Multiple rates", icon: Layers },
          ]}
        />
      </div>

      {pricingMode === "single" ? (
        <TuitionAmountField
          C={C}
          inputMode={inputMode}
          onInputModeChange={handleInputModeChange}
          amount={tiers[0]?.amount ?? ""}
          onAmountChange={(amount) => setTier(0, { amount })}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm" style={{ color: C.textSecondary }}>
              {inputMode === "monthly" ? "Monthly amounts" : "Annual amounts"}
            </span>
            <SchoolAdminSegmentedControl
              C={C}
              value={inputMode}
              onChange={(mode) => handleInputModeChange(mode as TuitionInputMode)}
              ariaLabel="Billing basis"
              options={[
                { value: "annual", label: "Annual" },
                { value: "monthly", label: "Monthly" },
              ]}
            />
          </div>

          <div className="flex flex-col gap-3">
            {tiers.map((tier, index) => {
              const annualCents = tuitionInputToAnnualCents(
                Number(tier.amount),
                inputMode,
              );
              return (
                <div
                  key={index}
                  className="rounded-lg p-4 flex flex-col gap-3"
                  style={{ border: `1px solid ${C.border}`, backgroundColor: C.bg }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <label className="flex flex-col gap-1 text-sm flex-1">
                      <span style={{ color: C.textSecondary }}>Rate name</span>
                      <input
                        style={inputStyle(C)}
                        value={tier.label}
                        onChange={(e) => setTier(index, { label: e.target.value })}
                        placeholder="K-2 Full Time"
                      />
                    </label>
                    {tiers.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeTier(index)}
                        className="mt-6 p-2 rounded-md"
                        style={{ color: C.textTertiary }}
                        aria-label="Remove tier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : null}
                  </div>

                  <label className="flex flex-col gap-1 text-sm">
                    <span style={{ color: C.textSecondary }}>
                      {inputMode === "monthly" ? "Monthly amount (USD)" : "Annual amount (USD)"}
                    </span>
                    <input
                      style={inputStyle(C)}
                      type="text"
                      inputMode="decimal"
                      value={tier.amount}
                      onChange={(e) => setTier(index, { amount: e.target.value })}
                      placeholder={inputMode === "monthly" ? "e.g. 600" : "e.g. 7200"}
                    />
                    {annualCents > 0 ? (
                      <span className="text-xs" style={{ color: C.textTertiary }}>
                        {inputMode === "monthly"
                          ? `Equals ${formatCents(annualCents)}/year`
                          : `Equals ${formatCents(Math.round(annualCents / 12))}/month`}
                      </span>
                    ) : null}
                  </label>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={addTier}
            className="self-start inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md"
            style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
          >
            <Plus className="w-3.5 h-3.5" />
            Add tier
          </button>
        </div>
      )}
    </div>
  );
}
