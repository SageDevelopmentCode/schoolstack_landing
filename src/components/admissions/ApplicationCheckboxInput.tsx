"use client";

import { Check } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  applicationChoiceRadius,
  applicationFocusRing,
  applicationMetaTextClass,
  useApplicationFieldAppearance,
} from "@/components/admissions/application-field-appearance";

type ApplicationCheckboxInputProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  error?: string | null;
  C: AdminThemeTokens;
};

export default function ApplicationCheckboxInput({
  id,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  error = null,
  C,
}: ApplicationCheckboxInputProps) {
  const appearance = useApplicationFieldAppearance();
  const garden = appearance === "garden";
  const focusRing = applicationFocusRing(C.accent, appearance);
  const hasDescription = Boolean(description?.trim());

  return (
    <div>
      <button
        id={id}
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-invalid={Boolean(error)}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`flex min-h-[44px] w-full gap-3 ${applicationChoiceRadius(appearance)} px-4 py-3 text-left text-sm transition-all duration-150 focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
          hasDescription ? "items-start" : "items-center"
        }`}
        style={
          checked
            ? {
                backgroundColor: C.accentLight,
                borderColor: C.accent,
                color: C.textPrimary,
                ...focusRing,
              }
            : {
                backgroundColor: "#FFFFFF",
                borderColor: error ? C.errorBorder : C.border,
                color: C.textPrimary,
                ...focusRing,
              }
        }
      >
        <span
          aria-hidden
          className={`flex shrink-0 items-center justify-center border-2 ${garden ? "h-5 w-5 rounded-[6px]" : "h-4 w-4 rounded"} ${
            hasDescription ? "mt-0.5" : ""
          }`}
          style={{
            borderColor: checked ? C.accent : C.border,
            backgroundColor: checked ? C.accent : "transparent",
          }}
        >
          {checked ? (
            <Check className="h-3 w-3 text-white" strokeWidth={3} aria-hidden />
          ) : null}
        </span>
        <span className="min-w-0 flex-1">
          {hasDescription ? (
            <>
              <span className={`block ${garden ? "font-bold" : "font-medium"}`}>{label}</span>
              <span
                className="mt-1 block text-sm font-normal leading-relaxed"
                style={{ color: C.textSecondary }}
              >
                {description}
              </span>
            </>
          ) : (
            <span className={`leading-relaxed ${garden ? "font-semibold" : "font-normal"}`}>{label}</span>
          )}
        </span>
      </button>
      {error ? (
        <p className={applicationMetaTextClass(appearance)} style={{ color: C.error }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
