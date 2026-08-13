"use client";

import { useMemo } from "react";
import SchoolAdminSelect from "@/components/school-admin/ui/SchoolAdminSelect";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  availableOutstandingPeriods,
  OUTSTANDING_PERIOD_OPTIONS,
  type OutstandingPeriod,
  type SchoolYearBounds,
} from "@/lib/tuition/outstanding-period";

type TuitionOutstandingPeriodSelectProps = {
  value: OutstandingPeriod;
  onChange: (value: OutstandingPeriod) => void;
  schoolYearBounds: SchoolYearBounds;
  C: AdminThemeTokens;
  ariaLabel?: string;
  className?: string;
};

export default function TuitionOutstandingPeriodSelect({
  value,
  onChange,
  schoolYearBounds,
  C,
  ariaLabel = "Outstanding time period",
  className,
}: TuitionOutstandingPeriodSelectProps) {
  const options = useMemo(() => {
    const available = new Set(availableOutstandingPeriods(schoolYearBounds));
    return OUTSTANDING_PERIOD_OPTIONS.filter((option) => available.has(option.value)).map(
      (option) => ({
        value: option.value,
        label: option.label,
      }),
    );
  }, [schoolYearBounds]);

  return (
    <SchoolAdminSelect
      value={value}
      onChange={(next) => onChange(next as OutstandingPeriod)}
      options={options}
      ariaLabel={ariaLabel}
      C={C}
      className={className}
      triggerClassName="text-xs py-1"
    />
  );
}
