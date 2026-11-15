"use client";

import { useAdminGardenSkin } from "@/components/school-admin/garden/skin";
import { GardenSelect } from "@/components/school-admin/garden/kit";
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
  const skin = useAdminGardenSkin();
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

  if (skin) {
    return (
      <div className={props.className}>
        <GardenSelect
          id={props.id}
          value={props.value}
          onChange={props.onChange}
          options={props.options}
          placeholder={props.placeholder}
          disabled={props.disabled}
          aria-label={props.ariaLabel}
          error={props.error}
        />
        {props.error ? (
          <p role="alert" className="m-0 mt-1.5 text-[12.5px] font-bold text-[#9a3422]">
            {props.error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <CustomSelect
      {...props}
      theme={theme}
      triggerClassName={props.triggerClassName ?? "text-sm"}
    />
  );
}
