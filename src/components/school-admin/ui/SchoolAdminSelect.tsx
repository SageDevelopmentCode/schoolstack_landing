"use client";

import { useMemo } from "react";
import CustomSelect, { type CustomSelectOption } from "@/components/ui/CustomSelect";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type SchoolAdminSelectProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  ariaLabel: string;
  error?: string | null;
  C: AdminThemeTokens;
  className?: string;
  triggerClassName?: string;
};

export default function SchoolAdminSelect({
  C,
  ...props
}: SchoolAdminSelectProps) {
  const theme = useMemo(
    () => ({
      textPrimary: C.textPrimary,
      textTertiary: C.textTertiary,
      border: C.inputBorder,
      accent: C.accent,
      accentLight: C.accentLight,
      accentDark: C.accentDark,
      surface: C.surface,
      error: C.error,
      errorBorder: C.errorBorder,
      inputBackground: C.input,
    }),
    [C],
  );

  return (
    <CustomSelect
      {...props}
      theme={theme}
      triggerClassName={props.triggerClassName ?? "text-sm"}
    />
  );
}
