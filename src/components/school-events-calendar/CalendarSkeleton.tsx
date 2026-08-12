"use client";

import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { DAY_NAMES } from "@/lib/committees/calendar-utils";

const CALENDAR_LINE = "rgba(0, 0, 0, 0.06)";

export default function CalendarSkeleton({ C }: { C: AdminThemeTokens }) {
  return (
    <div
      className="overflow-hidden rounded-2xl shadow-sm"
      style={{
        backgroundColor: C.surface,
        border: `1px solid ${CALENDAR_LINE}`,
      }}
    >
      <div className="grid grid-cols-7 border-b" style={{ borderColor: CALENDAR_LINE }}>
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="py-3 text-center text-xs font-medium tracking-wide"
            style={{ color: C.textTertiary }}
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {Array.from({ length: 42 }).map((_, idx) => (
          <div
            key={idx}
            className="min-h-[100px] animate-pulse border-b border-r p-3"
            style={{
              borderColor: CALENDAR_LINE,
              backgroundColor: idx % 7 === 0 ? C.bg : C.surface,
            }}
          >
            <div
              className="mb-2 ml-auto h-7 w-7 rounded-full"
              style={{ backgroundColor: C.elevated }}
            />
            <div className="space-y-1.5">
              <div className="h-5 rounded-md" style={{ backgroundColor: C.elevated }} />
              <div className="h-5 w-4/5 rounded-md" style={{ backgroundColor: C.elevated }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
