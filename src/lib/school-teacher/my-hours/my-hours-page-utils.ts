import {
  addDays,
  parseDateKey,
  toDateKey,
} from "@/lib/school-teacher/my-hours/format-duration";
import type {
  MyHoursDayLog,
  MyHoursMonthSummary,
  TeacherMyHoursActiveSession,
} from "@/lib/school-teacher/my-hours/types";

export function activeSessionStartedAtForFocusDay(
  activeSession: TeacherMyHoursActiveSession | null,
  focusDateKey: string,
  referenceDateKey: string,
): Date | null {
  if (!activeSession) return null;
  if (
    activeSession.workDate !== focusDateKey &&
    focusDateKey !== referenceDateKey
  ) {
    return null;
  }
  return new Date(activeSession.clockInAt);
}

export function getDayLogForDateKey(
  entriesByDateKey: Record<string, MyHoursDayLog>,
  date: Date,
): MyHoursDayLog | null {
  return entriesByDateKey[toDateKey(date)] ?? null;
}

export function getMonthLogsForMonthDate(
  entriesByDateKey: Record<string, MyHoursDayLog>,
  monthDate: Date,
): Record<string, MyHoursDayLog> {
  const map: Record<string, MyHoursDayLog> = {};
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  for (let i = 0; i < 31; i++) {
    const d = addDays(monthStart, i);
    if (d.getMonth() !== monthStart.getMonth()) break;
    const log = entriesByDateKey[toDateKey(d)];
    if (log) {
      map[log.dateKey] = log;
    }
  }
  return map;
}

export function getMonthSummaryForMonthDate(
  entriesByDateKey: Record<string, MyHoursDayLog>,
  monthDate: Date,
): MyHoursMonthSummary {
  const logs = Object.values(getMonthLogsForMonthDate(entriesByDateKey, monthDate));
  return {
    monthLabel: monthDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
    loggedDays: logs.length,
    totalMinutes: logs.reduce((sum, entry) => sum + entry.totalMinutes, 0),
  };
}

export function referenceDateFromKey(referenceDateKey: string): Date {
  return parseDateKey(referenceDateKey);
}
