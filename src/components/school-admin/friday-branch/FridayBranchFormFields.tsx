"use client";

import type { ReactNode } from "react";
import type { CustomSelectOption } from "@/components/ui/CustomSelect";
import SchoolAdminSelect from "@/components/school-admin/ui/SchoolAdminSelect";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  FRIDAY_BRANCH_FIELD_INPUT_CLASS,
  FRIDAY_BRANCH_FIELD_LABEL_CLASS,
  fridayBranchFieldInputStyle,
} from "@/lib/school-admin/friday-branch/friday-branch-form-options";

type FridayBranchFieldLabelProps = {
  C: AdminThemeTokens;
  children: ReactNode;
};

export function FridayBranchFieldLabel({ C, children }: FridayBranchFieldLabelProps) {
  return (
    <span className={FRIDAY_BRANCH_FIELD_LABEL_CLASS} style={{ color: C.textTertiary }}>
      {children}
    </span>
  );
}

type FridayBranchTextInputProps = {
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel: string;
};

export function FridayBranchTextInput({
  theme,
  C,
  value,
  onChange,
  placeholder,
  ariaLabel,
}: FridayBranchTextInputProps) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className={FRIDAY_BRANCH_FIELD_INPUT_CLASS}
      style={fridayBranchFieldInputStyle(theme, C)}
    />
  );
}

type FridayBranchSelectProps = {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder: string;
  ariaLabel: string;
};

export function FridayBranchSelect({
  C,
  theme,
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
}: FridayBranchSelectProps) {
  return (
    <div style={{ fontFamily: theme.fontBody }}>
      <SchoolAdminSelect
        C={C}
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        ariaLabel={ariaLabel}
        triggerClassName="rounded-[9px] text-sm"
      />
    </div>
  );
}

type FridayBranchFamilyVisibilityToggleProps = {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function FridayBranchFamilyVisibilityToggle({
  C,
  theme,
  checked,
  onChange,
}: FridayBranchFamilyVisibilityToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Visible to families. Include this class on the published Friday schedule."
      onClick={() => onChange(!checked)}
      className="flex w-full min-h-[44px] items-center justify-between gap-4 rounded-[9px] border px-3 py-3 text-left transition-colors"
      style={{
        fontFamily: theme.fontBody,
        borderColor: checked ? C.accent : C.border,
        backgroundColor: checked ? C.accentLight : C.surface,
      }}
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium" style={{ color: C.textPrimary }}>
          Visible to families
        </span>
        <span className="mt-0.5 block text-xs" style={{ color: C.textSecondary }}>
          Include this class on the published Friday schedule.
        </span>
      </span>
      <span
        aria-hidden="true"
        className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors"
        style={{ backgroundColor: checked ? C.accent : C.border }}
      >
        <span
          className="inline-block h-5 w-5 rounded-full bg-white transition-transform"
          style={{
            transform: checked ? "translateX(22px)" : "translateX(2px)",
          }}
        />
      </span>
    </button>
  );
}
