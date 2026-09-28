"use client";

import type { LucideIcon } from "lucide-react";
import { Moon, Sun, Sunrise } from "lucide-react";
import {
  ADMISSIONS_TIME_SLOT_GROUPS,
  type AdmissionsTimeSlotPeriod,
} from "@/lib/admissions/admissions-availability";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

const PERIOD_ICONS: Record<AdmissionsTimeSlotPeriod, LucideIcon> = {
  morning: Sunrise,
  afternoon: Sun,
  night: Moon,
};

type AdmissionsTimePeriodTabBarProps = {
  C: AdminThemeTokens;
  activePeriod: AdmissionsTimeSlotPeriod;
  onPeriodChange: (period: AdmissionsTimeSlotPeriod) => void;
  openCountForPeriod: (period: AdmissionsTimeSlotPeriod) => number;
  openCountLabel?: (count: number) => string;
};

export default function AdmissionsTimePeriodTabBar({
  C,
  activePeriod,
  onPeriodChange,
  openCountForPeriod,
  openCountLabel = (count) => `${count} open`,
}: AdmissionsTimePeriodTabBarProps) {
  return (
    <div
      className="flex rounded-sm border p-0.5"
      style={{ borderColor: C.border, backgroundColor: C.bg }}
      role="tablist"
      aria-label="Time of day"
    >
      {ADMISSIONS_TIME_SLOT_GROUPS.map((group) => {
        const isActive = activePeriod === group.id;
        const openCount = openCountForPeriod(group.id);
        const Icon = PERIOD_ICONS[group.id];
        const tabColor = isActive ? C.accent : C.textTertiary;

        return (
          <button
            key={group.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onPeriodChange(group.id)}
            className="flex flex-1 flex-col items-center gap-0.5 rounded-sm px-1 py-1.5 text-[10px] font-medium transition-colors"
            style={{
              backgroundColor: isActive ? C.surface : "transparent",
              color: tabColor,
              boxShadow: isActive ? `0 0 0 1px ${C.border}` : "none",
            }}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: tabColor }} aria-hidden />
            <span>{group.label}</span>
            {openCount > 0 ? (
              <span className="text-[9px] font-normal" style={{ color: C.textQuaternary }}>
                {openCountLabel(openCount)}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
