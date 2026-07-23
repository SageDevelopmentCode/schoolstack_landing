"use client";

import { Plus, Trash2 } from "lucide-react";
import type { WizardFeeInput } from "@/lib/tuition/setup-wizard";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type TuitionFeesStepProps = {
  C: AdminThemeTokens;
  fees: WizardFeeInput[];
  onFeesChange: (fees: WizardFeeInput[]) => void;
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

export default function TuitionFeesStep({
  C,
  fees,
  onFeesChange,
}: TuitionFeesStepProps) {
  const setFee = (index: number, patch: Partial<WizardFeeInput>) => {
    onFeesChange(
      fees.map((fee, i) => (i === index ? { ...fee, ...patch } : fee)),
    );
  };

  const addFee = () => {
    onFeesChange([
      ...fees,
      {
        label: "",
        amountCents: 0,
        timing: "enrollment",
      },
    ]);
  };

  const removeFee = (index: number) => {
    onFeesChange(fees.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p className="text-sm" style={{ color: C.textSecondary }}>
          Optional one-time fees charged when a family enrolls.
        </p>
        <p className="text-sm" style={{ color: C.textSecondary }}>
          These are separate from application fees or enrollment checklist items in
          Admissions — those are collected during apply or onboarding. Fees you add
          here appear on the parent&apos;s tuition page alongside their tuition
          balance.
        </p>
      </div>

      {fees.length === 0 ? (
        <p className="text-sm" style={{ color: C.textTertiary }}>
          No fees added yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {fees.map((fee, index) => (
            <div
              key={index}
              className="rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:items-end"
              style={{ border: `1px solid ${C.border}`, backgroundColor: C.bg }}
            >
              <label className="flex flex-col gap-1 text-sm flex-1">
                <span style={{ color: C.textSecondary }}>Fee label</span>
                <input
                  style={inputStyle(C)}
                  value={fee.label}
                  onChange={(e) => setFee(index, { label: e.target.value })}
                  placeholder="e.g. Technology fee"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm sm:max-w-[160px] sm:w-full">
                <span style={{ color: C.textSecondary }}>Amount</span>
                <input
                  style={inputStyle(C)}
                  type="number"
                  min={0}
                  step={0.01}
                  value={fee.amountCents ? fee.amountCents / 100 : ""}
                  onChange={(e) =>
                    setFee(index, {
                      amountCents: Math.round(Number(e.target.value) * 100) || 0,
                    })
                  }
                  placeholder="0"
                />
              </label>
              <button
                type="button"
                onClick={() => removeFee(index)}
                className="p-2 rounded-md shrink-0 self-end sm:self-auto"
                style={{ color: C.textTertiary }}
                aria-label={`Remove fee ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addFee}
        className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md self-start"
        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
      >
        <Plus className="w-3.5 h-3.5" />
        Add fee
      </button>
    </div>
  );
}
