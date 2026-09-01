"use client";

import { useId, useMemo } from "react";
import ApplicationDatePicker from "@/components/admissions/ApplicationDatePicker";
import { todayKey } from "@/lib/demo-scheduler";
import {
  parentThemeToAdminCompat,
  type ParentThemeTokens,
} from "@/lib/organization-settings/parent-theme";

type SignupDatePickerProps = {
  theme: ParentThemeTokens;
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  className?: string;
};

function signupDateRangeBounds(): { minDate: string; maxDate: string } {
  const today = todayKey();
  const year = Number(today.slice(0, 4)) + 1;
  return {
    minDate: today,
    maxDate: `${year}-12-31`,
  };
}

export default function SignupDatePicker({
  theme,
  value,
  onChange,
  ariaLabel,
  disabled = false,
  minDate,
  maxDate,
  placeholder = "Select date…",
  className = "rounded-[10px]",
}: SignupDatePickerProps) {
  const id = useId();
  const adminCompat = useMemo(() => parentThemeToAdminCompat(theme), [theme]);
  const defaults = signupDateRangeBounds();

  return (
    <div className={className}>
      <ApplicationDatePicker
        id={id}
        value={value}
        onChange={onChange}
        C={adminCompat}
        disabled={disabled}
        minDate={minDate ?? defaults.minDate}
        maxDate={maxDate ?? defaults.maxDate}
        placeholder={placeholder}
      />
      <label htmlFor={id} className="sr-only">
        {ariaLabel}
      </label>
    </div>
  );
}
