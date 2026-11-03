import {
  addDays,
  parseDateKey,
  toDateKey,
} from '@/lib/teacher/my-hours/format-duration';
import type { MyHoursDayLog, MyHoursMonthSummary } from '@/lib/teacher/my-hours/types';

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
    monthLabel: monthDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    }),
    loggedDays: logs.length,
    totalMinutes: logs.reduce((sum, entry) => sum + entry.totalMinutes, 0),
  };
}

export function referenceDateFromKey(referenceDateKey: string): Date {
  return parseDateKey(referenceDateKey);
}
