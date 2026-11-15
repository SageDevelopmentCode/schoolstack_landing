"use client";

import type { LucideIcon } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { useAdminGardenSkin } from "@/components/school-admin/garden/skin";
import { G_FOCUS } from "@/components/school-parent/garden/ui";

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
  iconOnly?: boolean;
};

export default function SchoolAdminSegmentedControl({
  C,
  value,
  onChange,
  options,
  ariaLabel,
  className = "",
  iconOnly = false,
}: SchoolAdminSegmentedControlProps) {
  const skin = useAdminGardenSkin();
  if (skin) {
    return (
      <div
        className={`inline-flex rounded-full border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-1 ${className}`}
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
              aria-label={iconOnly ? option.label : undefined}
              onClick={() => onChange(option.value)}
              className={`inline-flex items-center rounded-full font-extrabold transition-colors ${
                iconOnly ? "gap-0 px-2.5 py-1.5" : "gap-1.5 px-3.5 py-1.5 text-[13px]"
              } ${
                isActive
                  ? "bg-[var(--sf-clay)] text-white shadow-[0_2px_0_0_var(--sf-ink)]"
                  : "text-[var(--sf-ink)]/65 hover:bg-[var(--sf-accent-wash)] hover:text-[var(--sf-ink)]"
              } ${G_FOCUS}`}
            >
              {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
              {iconOnly ? <span className="sr-only">{option.label}</span> : option.label}
            </button>
          );
        })}
      </div>
    );
  }
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
            aria-label={iconOnly ? option.label : undefined}
            onClick={() => onChange(option.value)}
            className={`inline-flex items-center rounded-md font-medium transition-colors ${
              iconOnly ? "gap-0 px-2 py-1" : "gap-1.5 px-3 py-1.5 text-sm"
            }`}
            style={{
              backgroundColor: isActive ? C.accentLight : "transparent",
              color: isActive ? C.accent : C.textSecondary,
            }}
          >
            {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
            {iconOnly ? (
              <span className="sr-only">{option.label}</span>
            ) : (
              option.label
            )}
          </button>
        );
      })}
    </div>
  );
}
