"use client";

import { Check } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

export type TuitionWizardStep = {
  id: string;
  title: string;
  shortLabel: string;
};

type TuitionWizardStepNavProps = {
  C: AdminThemeTokens;
  steps: readonly TuitionWizardStep[];
  stepIndex: number;
  maxReachedStep: number;
  disabled?: boolean;
  onGoToStep: (index: number) => void;
};

export default function TuitionWizardStepNav({
  C,
  steps,
  stepIndex,
  maxReachedStep,
  disabled = false,
  onGoToStep,
}: TuitionWizardStepNavProps) {
  return (
    <nav className="mt-4" aria-label="Setup steps">
      <ol className="flex items-start justify-between gap-1">
        {steps.map((step, index) => {
          const active = index === stepIndex;
          const done = index < stepIndex;
          const reachable = index <= maxReachedStep;
          const isDisabled = disabled || !reachable || active;

          let circleBackground = C.elevated;
          let circleColor = C.textTertiary;
          let circleBorder = C.border;

          if (done) {
            circleBackground = C.successBg;
            circleColor = C.success;
            circleBorder = C.successBorder;
          } else if (active) {
            circleBackground = C.accentLight;
            circleColor = C.accent;
            circleBorder = C.secondaryBtnBorder;
          } else if (reachable) {
            circleBackground = C.surface;
            circleColor = C.textSecondary;
            circleBorder = C.border;
          }

          return (
            <li key={step.id} className="flex min-w-0 flex-1">
              <button
                type="button"
                onClick={() => onGoToStep(index)}
                disabled={isDisabled}
                className="flex w-full flex-col items-center gap-1 disabled:cursor-not-allowed disabled:opacity-45"
                aria-label={`Go to step ${index + 1}: ${step.title}`}
                aria-current={active ? "step" : undefined}
                aria-disabled={!reachable || active}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors"
                  style={{
                    backgroundColor: circleBackground,
                    color: circleColor,
                    border: `1px solid ${circleBorder}`,
                  }}
                >
                  {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : index + 1}
                </span>
                <span
                  className="w-full px-0.5 text-center text-[10px] leading-tight line-clamp-2 sm:text-[11px]"
                  style={{
                    color: active ? C.textPrimary : C.textTertiary,
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {step.shortLabel}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
