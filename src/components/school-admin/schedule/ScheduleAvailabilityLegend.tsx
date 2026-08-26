import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ScheduleAvailabilityLegendProps = {
  C: AdminThemeTokens;
  openLabel: string;
};

export default function ScheduleAvailabilityLegend({
  C,
  openLabel,
}: ScheduleAvailabilityLegendProps) {
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
    </div>
  );
}
