"use client";

import type { LucideIcon } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

export type SegmentedControlOption = {
  value: string;
  label: string;
  icon?: LucideIcon;
};

type SchoolAdminSegmentedControlProps = {
  C: AdminThemeTokens;
  value: string;
  onChange: (value: string) => void;
  options: SegmentedControlOption[];
  ariaLabel: string;
  className?: string;
};

export default function SchoolAdminSegmentedControl({
  C,
  value,
  onChange,
  options,
  ariaLabel,
  className = "",
}: SchoolAdminSegmentedControlProps) {
  return (
    <div
      className={`inline-flex rounded-lg p-1 ${className}`}
      style={{ backgroundColor: C.elevated, border: `1px solid ${C.border}` }}
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            style={{
              backgroundColor: isActive ? C.accentLight : "transparent",
              color: isActive ? C.accent : C.textSecondary,
            }}
          >
            {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
