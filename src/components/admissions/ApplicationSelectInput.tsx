"use client";

import { useMemo } from "react";
import CustomSelect from "@/components/ui/CustomSelect";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type SelectOption = {
  value: string;
  label: string;
};

type ApplicationSelectInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  ariaLabel: string;
  autoComplete?: string;
  error?: string | null;
  C: AdminThemeTokens;
};

export default function ApplicationSelectInput({
  id,
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
  ariaLabel,
  autoComplete,
  error = null,
  C,
}: ApplicationSelectInputProps) {
  const theme = useMemo(
    () => ({
      textPrimary: C.textPrimary,
      textTertiary: C.textTertiary,
      border: error ? C.errorBorder : C.border,
      accent: C.accent,
      accentLight: C.accentLight,
      accentDark: C.accentDark,
      surface: "#FFFFFF",
      error: C.error,
      errorBorder: C.errorBorder,
      inputBackground: "#FFFFFF",
    }),
    [C, error],
  );

  return (
    <CustomSelect
      id={id}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      disabled={disabled}
      ariaLabel={ariaLabel}
      autoComplete={autoComplete}
      error={error}
      theme={theme}
    />
  );
}
