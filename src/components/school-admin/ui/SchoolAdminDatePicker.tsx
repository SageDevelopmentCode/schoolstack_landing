"use client";

import { useAdminGardenSkin } from "@/components/school-admin/garden/skin";
import { gInputClass } from "@/components/school-admin/garden/kit";
import ApplicationDatePicker from "@/components/admissions/ApplicationDatePicker";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type SchoolAdminDatePickerProps = {
  id: string;
  value: string;
  onChange: (iso: string) => void;
  C: AdminThemeTokens;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  error?: string | null;
};

export function schoolAdminDateRangeBounds(): { minDate: string; maxDate: string } {
  const year = new Date().getFullYear();
  return {
    minDate: `${year - 2}-01-01`,
    maxDate: `${year + 10}-12-31`,
  };
}

export default function SchoolAdminDatePicker({
  minDate,
  maxDate,
  placeholder = "Select date…",
  ...props
}: SchoolAdminDatePickerProps) {
  const defaults = schoolAdminDateRangeBounds();
  const skin = useAdminGardenSkin();

  if (skin) {
    return (
      <div>
        <input
          id={props.id}
          type="date"
          value={props.value}
          onChange={(event) => props.onChange(event.target.value)}
          disabled={props.disabled}
          min={minDate ?? defaults.minDate}
          max={maxDate ?? defaults.maxDate}
          aria-invalid={props.error ? true : undefined}
          aria-label={placeholder}
          className={gInputClass(props.error)}
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
    <ApplicationDatePicker
      {...props}
      placeholder={placeholder}
      minDate={minDate ?? defaults.minDate}
      maxDate={maxDate ?? defaults.maxDate}
    />
  );
}
