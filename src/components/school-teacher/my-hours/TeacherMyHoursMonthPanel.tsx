"use client";

import type { KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import {
  formatHoursMinutes,
  isSameDay,
  toDateKey,
} from "@/lib/school-teacher/my-hours/format-duration";
import {
  MY_HOURS_CALENDAR_LINE,
  MY_HOURS_LOGGED_BG,
} from "@/lib/school-teacher/my-hours/calendar-styles";
import {
  getMonthLogsForMonthDate,
  getMonthSummaryForMonthDate,
} from "@/lib/school-teacher/my-hours/my-hours-page-utils";
import type { MyHoursDayLog } from "@/lib/school-teacher/my-hours/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type TeacherMyHoursMonthPanelProps = {
  theme: ParentThemeTokens;
  entriesByDateKey: Record<string, MyHoursDayLog>;
  monthDate: Date;
  referenceDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onDaySelect: (date: Date) => void;
};

function buildMonthGrid(monthDate: Date): Array<Date | null> {
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const leading = monthStart.getDay();
  const grid: Array<Date | null> = [];
  for (let i = 0; i < leading; i++) {
    grid.push(null);
  }
  for (let day = 1; day <= 31; day++) {
    const d = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
    if (d.getMonth() !== monthDate.getMonth()) break;
    grid.push(d);
  }
  while (grid.length % 7 !== 0) {
    grid.push(null);
  }
  return grid;
}

function DayNumber({
  day,
  theme,
  isToday,
}: {
  day: Date;
  theme: ParentThemeTokens;
  isToday: boolean;
}) {
  return (
    <div className="mb-1 flex justify-start">
      <span
        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold tabular-nums"
        style={
          isToday
            ? { backgroundColor: theme.primary, color: theme.white }
            : { color: theme.ink }
        }
      >
        {day.getDate()}
      </span>
    </div>
  );
}

export default function TeacherMyHoursMonthPanel({
  theme,
  entriesByDateKey,
  monthDate,
  referenceDate,
  onPreviousMonth,
  onNextMonth,
  onDaySelect,
}: TeacherMyHoursMonthPanelProps) {
  const summary = getMonthSummaryForMonthDate(entriesByDateKey, monthDate);
  const logs = getMonthLogsForMonthDate(entriesByDateKey, monthDate);
  const grid = buildMonthGrid(monthDate);
  const totalRows = grid.length / 7;

  return (
    <ParentCard theme={theme} className="p-5 sm:p-6" data-testid="teacher-my-hours-month-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold" style={{ color: theme.ink }}>
            {summary.monthLabel}
          </h2>
          <p className="mt-1 text-sm" style={{ color: theme.muted }}>
            {summary.loggedDays} days logged · {formatHoursMinutes(summary.totalMinutes)} total
          </p>
        </div>
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border transition-opacity hover:opacity-70"
            style={{ borderColor: theme.line, backgroundColor: theme.white }}
            onClick={onPreviousMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" style={{ color: theme.ink }} />
          </button>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border transition-opacity hover:opacity-70"
            style={{ borderColor: theme.line, backgroundColor: theme.white }}
            onClick={onNextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" style={{ color: theme.ink }} />
          </button>
        </div>
      </div>

      <div
        className="mt-5 overflow-hidden rounded-xl border"
        style={{
          borderColor: MY_HOURS_CALENDAR_LINE,
          backgroundColor: theme.white,
        }}
      >
        <div
          className="grid grid-cols-7 border-b text-center text-[11px] font-bold uppercase tracking-wide"
          style={{ borderColor: MY_HOURS_CALENDAR_LINE, color: theme.muted }}
        >
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="py-2.5 sm:py-3">
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {grid.map((day, index) => {
            if (!day) {
              const col = index % 7;
              const row = Math.floor(index / 7);
              const isLastCol = col === 6;
              const isLastRow = row === totalRows - 1;
              return (
                <div
                  key={`empty-${index}`}
                  className="min-h-[4.5rem] sm:min-h-[5.5rem]"
                  style={{
                    borderRight: isLastCol ? undefined : `1px solid ${MY_HOURS_CALENDAR_LINE}`,
                    borderBottom: isLastRow ? undefined : `1px solid ${MY_HOURS_CALENDAR_LINE}`,
                    backgroundColor: theme.white,
                  }}
                />
              );
            }

            const log = logs[toDateKey(day)];
            const isToday = isSameDay(day, referenceDate);
            const col = index % 7;
            const row = Math.floor(index / 7);
            const isLastCol = col === 6;
            const isLastRow = row === totalRows - 1;

            const handleSelect = () => onDaySelect(day);
            const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleSelect();
              }
            };

            return (
              <div
                key={toDateKey(day)}
                role="button"
                tabIndex={0}
                className="flex min-h-[4.5rem] cursor-pointer flex-col p-2 text-left transition-colors hover:bg-black/[0.02] sm:min-h-[5.5rem] sm:p-3"
                style={{
                  borderRight: isLastCol ? undefined : `1px solid ${MY_HOURS_CALENDAR_LINE}`,
                  borderBottom: isLastRow ? undefined : `1px solid ${MY_HOURS_CALENDAR_LINE}`,
                  backgroundColor: log ? MY_HOURS_LOGGED_BG : theme.white,
                }}
                aria-label={`View hours for ${day.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
                onClick={handleSelect}
                onKeyDown={handleKeyDown}
              >
                <DayNumber day={day} theme={theme} isToday={isToday} />
                {log ? (
                  <span
                    className="mt-auto text-[10px] font-medium leading-tight tabular-nums sm:text-[11px]"
                    style={{ color: theme.primary }}
                  >
                    {log.sessionCount} / {formatHoursMinutes(log.totalMinutes)}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-4 text-xs" style={{ color: theme.muted }}>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: MY_HOURS_LOGGED_BG }} />
          Logged
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: theme.primary }}
          />
          Today
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-sm border"
            style={{ borderColor: MY_HOURS_CALENDAR_LINE, backgroundColor: theme.white }}
          />
          Not logged
        </span>
      </div>
    </ParentCard>
  );
}
