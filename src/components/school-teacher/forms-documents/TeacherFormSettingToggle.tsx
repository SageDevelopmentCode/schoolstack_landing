"use client";

import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type TeacherFormSettingToggleProps = {
  theme: ParentThemeTokens;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

export default function TeacherFormSettingToggle({
  theme,
  label,
  description,
  checked,
  onChange,
  disabled = false,
  className = "",
}: TeacherFormSettingToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={description ? `${label}. ${description}` : label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex w-full min-h-[44px] cursor-pointer items-center justify-between gap-4 rounded-xl border px-3 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      style={{
        borderColor: checked ? theme.sage : theme.line,
        backgroundColor: checked ? theme.primarySoft : theme.cream,
      }}
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium" style={{ color: theme.ink }}>
          {label}
        </span>
        {description ? (
          <span className="mt-0.5 block text-xs leading-relaxed" style={{ color: theme.muted }}>
            {description}
          </span>
        ) : null}
      </span>
      <span
        aria-hidden="true"
        className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors"
        style={{ backgroundColor: checked ? theme.primary : theme.line }}
      >
        <span
          className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
          style={{
            transform: checked ? "translateX(22px)" : "translateX(2px)",
          }}
        />
      </span>
    </button>
  );
}

type TeacherFormInlineSwitchProps = {
  theme: ParentThemeTokens;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  variant?: "inline" | "field";
  showLabel?: boolean;
  helperText?: string;
};

export function TeacherFormInlineSwitch({
  theme,
  label,
  checked,
  onChange,
  disabled = false,
  className = "",
  variant = "inline",
  showLabel = true,
  helperText = "Parents must sign",
}: TeacherFormInlineSwitchProps) {
  const leftContent = showLabel ? (
    <span
      className={`font-medium ${variant === "field" ? "text-sm" : "text-xs"}`}
      style={{ color: variant === "field" ? theme.ink : theme.muted }}
    >
      {label}
    </span>
  ) : (
    <span className="text-sm" style={{ color: theme.muted }}>
      {helperText}
    </span>
  );

  const control = (
    <div className="flex items-center gap-2">
      <span
        className={`font-medium ${variant === "field" ? "text-sm" : "text-xs"}`}
        style={{ color: checked ? theme.primary : theme.muted }}
      >
        {checked ? "Required" : "Optional"}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="relative h-5 w-10 shrink-0 cursor-pointer rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        style={{ backgroundColor: checked ? theme.primary : theme.line }}
      >
        <span
          className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform"
          style={{
            transform: checked ? "translateX(1.25rem)" : "translateX(0)",
          }}
        />
      </button>
    </div>
  );

  if (variant === "field") {
    return (
      <div
        className={`flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-sm ${className}`}
        style={{
          borderColor: theme.line,
          backgroundColor: theme.cream,
        }}
      >
        {leftContent}
        {control}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      {leftContent}
      {control}
    </div>
  );
}
