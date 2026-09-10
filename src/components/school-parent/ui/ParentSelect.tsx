"use client";

import { useMemo } from "react";
import CustomSelect, { type CustomSelectOption } from "@/components/ui/CustomSelect";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentSelectProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  ariaLabel: string;
  error?: string | null;
  theme: ParentThemeTokens;
  className?: string;
  triggerClassName?: string;
};

export default function ParentSelect({
  theme,
  ...props
}: ParentSelectProps) {
  const selectTheme = useMemo(
    () => ({
      textPrimary: theme.ink,
      textTertiary: theme.muted,
      border: theme.line,
      accent: theme.primary,
      accentLight: theme.primarySoft,
      accentDark: theme.primaryDark,
      surface: theme.white,
      error: theme.alert,
      errorBorder: theme.alert,
      inputBackground: "#F4F7F5",
    }),
    [theme],
  );

  return (
    <CustomSelect
      {...props}
      theme={selectTheme}
      triggerClassName={props.triggerClassName ?? "text-sm"}
    />
  );
}
