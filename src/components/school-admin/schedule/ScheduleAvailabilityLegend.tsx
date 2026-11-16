"use client";

import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { useAdminGardenSkin } from "@/components/school-admin/garden/skin";

type ScheduleAvailabilityLegendProps = {
  C: AdminThemeTokens;
  openLabel: string;
  showGroupTour?: boolean;
};

export default function ScheduleAvailabilityLegend({
  C,
  openLabel,
  showGroupTour = false,
}: ScheduleAvailabilityLegendProps) {
  const skin = useAdminGardenSkin();
  if (skin) {
    const swatch = "inline-block h-3.5 w-3.5 rounded-[5px]";
    return (
      <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1.5 p-0 text-[12px] font-bold text-[var(--sf-soft)]" aria-label="Calendar legend">
        <li className="inline-flex items-center gap-1.5">
          <span aria-hidden className={`${swatch} border-[1.5px] border-dashed border-[var(--sf-ink)]/25`} />
          Not open
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span aria-hidden className={`${swatch} border-2 border-[var(--sf-clay)] bg-[var(--sf-accent-wash)]`} />
          {openLabel}
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span aria-hidden className={`${swatch} relative overflow-hidden border-2 border-[var(--sf-clay)] bg-[var(--sf-accent-wash)]`}>
            <span className="absolute inset-x-0 bottom-0 h-[3px] bg-[#b7791f]" />
          </span>
          Has booking
        </li>
        {showGroupTour ? (
          <li className="inline-flex items-center gap-1.5">
            <span aria-hidden className={`${swatch} border-2 border-dashed border-[var(--sf-clay)] bg-[var(--sf-accent-wash)]`} />
            Group tour
          </li>
        ) : null}
      </ul>
    );
  }
  return (
    <div className="flex flex-wrap gap-3 text-[11px]" style={{ color: C.textTertiary }}>
      <span className="inline-flex items-center gap-1.5">
        <span
          className="inline-block h-3 w-3 rounded"
          style={{
            backgroundColor: C.bg,
            border: `1.5px dashed ${C.border}`,
          }}
        />
        Not open
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span
          className="inline-block h-3 w-3 rounded"
          style={{
            backgroundColor: C.accentLight,
            border: `2px solid ${C.accent}`,
          }}
        />
        {openLabel}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="relative inline-block h-3 w-3 overflow-hidden rounded">
          <span
            className="absolute inset-0"
            style={{
              backgroundColor: C.accentLight,
              border: `2px solid ${C.accent}`,
            }}
          />
          <span
            className="absolute inset-x-0 bottom-0 h-[3px]"
            style={{ backgroundColor: C.warning }}
          />
        </span>
        Has booking
      </span>
      {showGroupTour ? (
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded"
            style={{
              backgroundColor: C.accentLight,
              border: `2px dashed ${C.accent}`,
            }}
          />
          Group tour
        </span>
      ) : null}
    </div>
  );
}
