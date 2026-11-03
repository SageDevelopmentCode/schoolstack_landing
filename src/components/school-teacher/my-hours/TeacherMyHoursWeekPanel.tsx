"use client";

import type { KeyboardEvent } from "react";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import {
  addDays,
  formatHoursMinutes,
  formatShortWeekdayDate,
  isSameDay,
  startOfWeekMonday,
} from "@/lib/school-teacher/my-hours/format-duration";
import { MY_HOURS_CALENDAR_LINE } from "@/lib/school-teacher/my-hours/calendar-styles";
import { getDayLogForDateKey } from "@/lib/school-teacher/my-hours/my-hours-page-utils";
import type { MyHoursDayLog } from "@/lib/school-teacher/my-hours/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type TeacherMyHoursWeekPanelProps = {
  theme: ParentThemeTokens;
  entriesByDateKey: Record<string, MyHoursDayLog>;
  focusDate: Date;
  referenceDate: Date;
  onDaySelect: (date: Date) => void;
};

function handleDayKeyDown(
  event: KeyboardEvent<HTMLLIElement>,
  onSelect: () => void,
) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onSelect();
  }
}

export default function TeacherMyHoursWeekPanel({
  theme,
  entriesByDateKey,
  focusDate,
  referenceDate,
  onDaySelect,
}: TeacherMyHoursWeekPanelProps) {
  const weekStart = startOfWeekMonday(focusDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <ParentCard theme={theme} className="overflow-hidden p-0" data-testid="teacher-my-hours-week-panel">
      <div className="border-b px-5 py-4" style={{ borderColor: MY_HOURS_CALENDAR_LINE }}>
        <h2 className="font-display text-lg font-semibold" style={{ color: theme.ink }}>
          Week of {formatShortWeekdayDate(weekStart)}
        </h2>
      </div>
      <ul>
        {days.map((day, index) => {
          const log = getDayLogForDateKey(entriesByDateKey, day);
          const isToday = isSameDay(day, referenceDate);
          const isLast = index === days.length - 1;
          const label = formatShortWeekdayDate(day);
          return (
            <li
              key={label}
              role="button"
              tabIndex={0}
              className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-black/[0.02]"
              style={{
                borderBottom: isLast ? undefined : `1px solid ${MY_HOURS_CALENDAR_LINE}`,
              }}
              onClick={() => onDaySelect(day)}
              onKeyDown={(event) => handleDayKeyDown(event, () => onDaySelect(day))}
            >
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="font-medium" style={{ color: theme.ink }}>
                  {label}
                </span>
                {isToday ? (
                  <ParentChip theme={theme} tone="info">
                    Today
                  </ParentChip>
                ) : null}
              </div>
              {log ? (
                <span
                  className="shrink-0 text-sm font-semibold tabular-nums"
                  style={{ color: theme.primary }}
                >
                  {formatHoursMinutes(log.totalMinutes)} · {log.sessionCount}{" "}
                  {log.sessionCount === 1 ? "session" : "sessions"}
                </span>
              ) : (
                <span className="shrink-0 text-sm" style={{ color: theme.muted }}>
                  Not logged
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </ParentCard>
  );
}