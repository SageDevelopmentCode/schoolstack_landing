import {
  displayDateKeyInTimezone,
  formatDemoTimeLabelInTimezone,
} from "@/lib/demo-scheduler-timezone";
import {
  addDays,
  parseDateKey,
  startOfWeekMonday,
  toDateKey,
} from "@/lib/school-teacher/my-hours/format-duration";
import type {
  MyHoursDayLog,
  MyHoursRecentDay,
  MyHoursSession,
  MyHoursSidebarSummary,
} from "@/lib/school-teacher/my-hours/types";
import type { StaffWorkTimeEntryRow } from "@/lib/school-teacher/my-hours/my-hours-db-types";

export const MY_HOURS_WEEK_GOAL_MINUTES = 40 * 60;

export function entryDurationMinutes(
  row: StaffWorkTimeEntryRow,
  now: Date = new Date(),
): number {
  const end = row.clock_out_at ? new Date(row.clock_out_at) : now;
  const start = new Date(row.clock_in_at);
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60_000));
}

export function mapEntryToSession(
  row: StaffWorkTimeEntryRow,
  timezone: string,
  now: Date = new Date(),
): MyHoursSession {
  const start = new Date(row.clock_in_at);
  const end = row.clock_out_at ? new Date(row.clock_out_at) : null;
  return {
    id: row.id,
    clockInAt: row.clock_in_at,
    clockOutAt: row.clock_out_at,
    clockIn: formatDemoTimeLabelInTimezone(start, timezone),
    clockOut: end
      ? formatDemoTimeLabelInTimezone(end, timezone)
      : "—",
    minutes: entryDurationMinutes(row, now),
  };
}

function isWeekdayDateKey(dateKey: string): boolean {
  const day = parseDateKey(dateKey).getDay();
  return day !== 0 && day !== 6;
}

export function groupEntriesByWorkDate(
  rows: StaffWorkTimeEntryRow[],
): Map<string, StaffWorkTimeEntryRow[]> {
  const map = new Map<string, StaffWorkTimeEntryRow[]>();
  for (const row of rows) {
    const list = map.get(row.work_date) ?? [];
    list.push(row);
    map.set(row.work_date, list);
  }
  for (const [key, list] of map) {
    list.sort(
      (a, b) =>
        new Date(a.clock_in_at).getTime() - new Date(b.clock_in_at).getTime(),
    );
    map.set(key, list);
  }
  return map;
}

export function buildDayLogFromRows(
  rows: StaffWorkTimeEntryRow[],
  now: Date = new Date(),
): MyHoursDayLog | null {
  const closed = rows.filter((r) => r.clock_out_at != null);
  const open = rows.filter((r) => r.clock_out_at == null);
  if (closed.length === 0 && open.length === 0) {
    return null;
  }
  const totalMinutes = rows.reduce(
    (sum, row) => sum + entryDurationMinutes(row, now),
    0,
  );
  return {
    dateKey: rows[0]?.work_date ?? toDateKey(now),
    totalMinutes,
    sessionCount: rows.length,
  };
}

export function buildSidebarSummary(
  rows: StaffWorkTimeEntryRow[],
  referenceDate: Date,
  timezone: string,
): MyHoursSidebarSummary {
  const now = new Date();
  const referenceDateKey = displayDateKeyInTimezone(referenceDate, timezone);
  const weekStart = startOfWeekMonday(referenceDate);
  const weekKeys = Array.from({ length: 7 }, (_, i) =>
    toDateKey(addDays(weekStart, i)),
  );

  let weekLoggedMinutes = 0;
  let weekLoggedWeekdays = 0;
  for (const key of weekKeys) {
    if (!isWeekdayDateKey(key)) continue;
    const dayRows = rows.filter((r) => r.work_date === key);
    if (dayRows.length === 0) continue;
    const dayMinutes = dayRows.reduce(
      (sum, row) => sum + entryDurationMinutes(row, now),
      0,
    );
    if (dayMinutes > 0) {
      weekLoggedMinutes += dayMinutes;
      weekLoggedWeekdays += 1;
    }
  }

  const monthStart = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    1,
  );
  let monthLoggedMinutes = 0;
  const monthDays = new Set<string>();
  for (const row of rows) {
    const d = parseDateKey(row.work_date);
    if (
      d.getFullYear() === monthStart.getFullYear() &&
      d.getMonth() === monthStart.getMonth()
    ) {
      monthLoggedMinutes += entryDurationMinutes(row, now);
      monthDays.add(row.work_date);
    }
  }

  const todayRows = rows.filter((r) => r.work_date === referenceDateKey);
  const todayMinutes =
    todayRows.length > 0
      ? todayRows.reduce(
          (sum, row) => sum + entryDurationMinutes(row, now),
          0,
        )
      : null;

  const byDate = groupEntriesByWorkDate(rows);
  const recentKeys = [...byDate.keys()]
    .filter((key) => {
      const log = buildDayLogFromRows(byDate.get(key) ?? [], now);
      return log != null && log.totalMinutes > 0;
    })
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 5);

  const recent: MyHoursRecentDay[] = recentKeys.map((key) => {
    const dayRows = byDate.get(key) ?? [];
    const log = buildDayLogFromRows(dayRows, now)!;
    const d = parseDateKey(key);
    return {
      label: d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      sessionCount: log.sessionCount,
      totalMinutes: log.totalMinutes,
    };
  });

  return {
    week: {
      goalMinutes: MY_HOURS_WEEK_GOAL_MINUTES,
      loggedMinutes: weekLoggedMinutes,
      loggedWeekdays: weekLoggedWeekdays,
      totalWeekdays: 5,
    },
    todayMinutes,
    monthLoggedMinutes,
    monthLoggedDays: monthDays.size,
    recent,
  };
}
