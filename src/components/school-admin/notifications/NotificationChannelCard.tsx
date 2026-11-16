"use client";

import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

/*
 * Story switch row shared by committees, newsletters and the schedule booking
 * dialog. The Alerts page itself moved to Garden (GardenSwitch) — see
 * NotificationsSettingsPage.
 */

type SettingToggleRowProps = {
  C: AdminThemeTokens;
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  showDivider?: boolean;
};

export function SettingToggleRow({
  C,
  label,
  checked,
  disabled,
  onChange,
  description,
  showDivider = false,
}: SettingToggleRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={description ? `${label}. ${description}` : label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex w-full min-h-[44px] items-center justify-between gap-4 px-3 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      style={
        showDivider ? { borderBottom: `1px solid ${C.border}` } : undefined
      }
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium" style={{ color: C.textPrimary }}>
          {label}
        </span>
        {description ? (
          <span className="mt-0.5 block text-xs" style={{ color: C.textSecondary }}>
            {description}
          </span>
        ) : null}
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
