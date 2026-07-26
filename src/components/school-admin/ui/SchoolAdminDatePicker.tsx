"use client";

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

  return (
    <ApplicationDatePicker
      {...props}
      placeholder={placeholder}
      minDate={minDate ?? defaults.minDate}
      maxDate={maxDate ?? defaults.maxDate}
    />
  );
}
