"use client";

import type { CSSProperties } from "react";
import type { ApplicationFieldOption } from "@/lib/admissions/application-form-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ApplicationRadioInputProps = {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: ApplicationFieldOption[];
  disabled?: boolean;
  ariaLabel: string;
  error?: string | null;
  layout?: "inline" | "stacked";
  C: AdminThemeTokens;
};

export default function ApplicationRadioInput({
  name,
  value,
  onChange,
  options,
  disabled = false,
  ariaLabel,
  error = null,
  layout = "inline",
  C,
}: ApplicationRadioInputProps) {
  const focusRing = { "--tw-ring-color": `${C.accent}40` } as CSSProperties;
  const isStacked = layout === "stacked";

  return (
    <div>
      <div
        role="radiogroup"
        aria-label={ariaLabel}
        aria-invalid={Boolean(error)}
        className={
          isStacked
            ? "flex flex-col gap-2"
            : "flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:flex-wrap"
        }
        style={{ borderColor: error && !isStacked ? C.errorBorder : "transparent" }}
      >
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            id={`${name}-${option.value}`}
            type="button"
            name={name}
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={
              isStacked
                ? "flex min-h-[44px] w-full items-center gap-3 rounded-md border px-4 py-3 text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
                : "flex min-h-[44px] w-full min-w-[5rem] items-center gap-3 rounded-md border px-4 py-2.5 text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:flex-1"
            }
            style={
              isSelected
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
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
              style={{
                borderColor: isSelected ? C.accent : C.border,
              }}
            >
              {isSelected ? (
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: C.accent }}
                />
              ) : null}
            </span>
            <span className="text-left">{option.label}</span>
          </button>
        );
      })}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs" style={{ color: C.error }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
