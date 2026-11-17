import type {
  MyHoursSession,
  TeacherMyHoursPageData,
} from "@/lib/school-teacher/my-hours/types";

export type DemoTeacherTimeEntry = {
  date: string;
  clockIn: string;
  clockOut: string;
  hours: number;
  note?: string;
};

export type DemoTeacherHoursSummary = {
  weekLabel: string;
  weekTotalHours: number;
  monthTotalHours: number;
  scheduledWeekHours?: number;
  clockedInToday: boolean;
  todayClockIn?: string;
  entries: DemoTeacherTimeEntry[];
};

export function buildDemoTeacherHoursSummary(): DemoTeacherHoursSummary {
  return {
    weekLabel: "May 12 – May 18, 2026",
    weekTotalHours: 32.4,
    monthTotalHours: 128.6,
    clockedInToday: true,
    todayClockIn: "7:44 AM",
    entries: [
      {
        date: "Mon, May 19",
        clockIn: "7:44 AM",
        clockOut: "—",
        hours: 0,
        note: "In progress",
      },
      {
        date: "Fri, May 16",
        clockIn: "7:50 AM",
        clockOut: "3:40 PM",
        hours: 7.8,
      },
      {
        date: "Thu, May 15",
        clockIn: "7:44 AM",
        clockOut: "3:52 PM",
        hours: 8.1,
      },
      {
        date: "Wed, May 14",
        clockIn: "7:48 AM",
        clockOut: "3:45 PM",
        hours: 7.9,
      },
      {
        date: "Tue, May 13",
        clockIn: "7:42 AM",
        clockOut: "3:48 PM",
        hours: 8.1,
      },
      {
        date: "Mon, May 12",
        clockIn: "7:46 AM",
        clockOut: "3:38 PM",
        hours: 7.9,
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Typed page data for the real (Garden) My Hours page in demos       */
/* ------------------------------------------------------------------ */

/** Friday: Mon–Thu are logged, today's session is running. */
const DEMO_MY_HOURS_TODAY_KEY = "2026-05-22";
/** The demo's "now" for the live timer (11:02 AM on the demo day). */
const DEMO_MY_HOURS_NOW = { hour: 11, minute: 2 } as const;
/** Days longer than this get a lunch break (two sessions). */
const SPLIT_DAY_MINUTES = 510;

function parseClockLabel(label: string): { hour: number; minute: number } {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(label.trim());
  if (!match) return { hour: 8, minute: 0 };
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hour += 12;
  return { hour, minute: Number(match[2]) };
}

function shortDayLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

/** Splits `total` across `weights` in whole minutes; the last share absorbs rounding. */
function distributeMinutes(total: number, weights: number[]): number[] {
  const sum = weights.reduce((acc, w) => acc + w, 0) || 1;
  const shares = weights.map((w) => Math.round((w / sum) * total));
  shares[shares.length - 1] += total - shares.reduce((acc, m) => acc + m, 0);
  return shares;
}

function localDate(dateKey: string, hour: number, minute: number): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d, hour, minute);
}

function shiftDateKey(dateKey: string, days: number): string {
  const date = localDate(dateKey, 12, 0);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function sessionsForDay(
  dateKey: string,
  clockInLabel: string,
  minutes: number,
): MyHoursSession[] {
  const start = parseClockLabel(clockInLabel);
  const startAt = localDate(dateKey, start.hour, start.minute);
  const ranges: Array<[Date, Date]> = [];
  if (minutes > SPLIT_DAY_MINUTES) {
    const lunchAt = localDate(dateKey, 12, 0);
    const morning = Math.round((lunchAt.getTime() - startAt.getTime()) / 60000);
    const backAt = localDate(dateKey, 12, 30);
    ranges.push([startAt, lunchAt]);
    ranges.push([backAt, new Date(backAt.getTime() + (minutes - morning) * 60000)]);
  } else {
    ranges.push([startAt, new Date(startAt.getTime() + minutes * 60000)]);
  }
  return ranges.map(([inAt, outAt], index) => ({
    id: `demo-hours-${dateKey}-${index + 1}`,
    clockInAt: inAt.toISOString(),
    clockOutAt: outAt.toISOString(),
    clockIn: formatWallClock(inAt),
    clockOut: formatWallClock(outAt),
    minutes: Math.round((outAt.getTime() - inAt.getTime()) / 60000),
  }));
}

function formatWallClock(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/**
 * The real `TeacherMyHoursPageData` behind the demo's My Hours page, derived
 * from a `DemoTeacherHoursSummary` so the numbers match the old mock: the week
 * total (Mon–Thu), the month total, and today's running session from its
 * clock-in time. Clock-in times come from the summary's entries.
 */
export function buildDemoTeacherMyHoursPageDataFromSummary(
  summary: DemoTeacherHoursSummary,
): { pageData: TeacherMyHoursPageData; previewNow: string } {
  const todayKey = DEMO_MY_HOURS_TODAY_KEY;
  const weekStartKey = shiftDateKey(todayKey, -4);
  const weekKeys = [0, 1, 2, 3].map((i) => shiftDateKey(weekStartKey, i));
  const monthStartKey = `${todayKey.slice(0, 8)}01`;

  // Earlier weekdays this month (before this week).
  const earlierKeys: string[] = [];
  for (let key = monthStartKey; key < weekStartKey; key = shiftDateKey(key, 1)) {
    const day = localDate(key, 12, 0).getDay();
    if (day !== 0 && day !== 6) earlierKeys.push(key);
  }

  const closedEntries = summary.entries.filter((entry) => entry.hours > 0);
  const clockInFor = (index: number) =>
    closedEntries[index % Math.max(1, closedEntries.length)]?.clockIn ?? "7:45 AM";
  const weightFor = (index: number) =>
    closedEntries[index % Math.max(1, closedEntries.length)]?.hours ?? 8;

  const weekMinutes = Math.round(summary.weekTotalHours * 60);
  const monthMinutes = Math.round(summary.monthTotalHours * 60);
  // Oldest entries map to Monday, so the most recent entry lands on Thursday.
  const weekShares = distributeMinutes(
    weekMinutes,
    weekKeys.map((_, i) => weightFor(weekKeys.length - 1 - i)),
  );
  const earlierShares = distributeMinutes(
    Math.max(0, monthMinutes - weekMinutes),
    earlierKeys.map((_, i) => weightFor(i)),
  );

  const sessionsByDateKey: TeacherMyHoursPageData["sessionsByDateKey"] = {};
  const entriesByDateKey: TeacherMyHoursPageData["entriesByDateKey"] = {};
  const logDay = (key: string, clockIn: string, minutes: number) => {
    if (minutes <= 0) return;
    const sessions = sessionsForDay(key, clockIn, minutes);
    sessionsByDateKey[key] = sessions;
    entriesByDateKey[key] = {
      dateKey: key,
      totalMinutes: sessions.reduce((acc, s) => acc + s.minutes, 0),
      sessionCount: sessions.length,
    };
  };
  earlierKeys.forEach((key, i) => logDay(key, clockInFor(i), earlierShares[i]));
  weekKeys.forEach((key, i) => logDay(key, clockInFor(weekKeys.length - 1 - i), weekShares[i]));

  const todayStart = parseClockLabel(summary.todayClockIn ?? "7:44 AM");
  const activeSession = summary.clockedInToday
    ? {
        entryId: "demo-hours-active",
        clockInAt: localDate(todayKey, todayStart.hour, todayStart.minute).toISOString(),
        workDate: todayKey,
      }
    : null;

  const loggedKeys = Object.keys(entriesByDateKey).sort((a, b) => b.localeCompare(a));
  const pendingKey = earlierKeys[earlierKeys.length - 3] ?? null;
  const pendingSessions = pendingKey ? sessionsByDateKey[pendingKey] ?? [] : [];

  const pageData: TeacherMyHoursPageData = {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Denver",
    referenceDateKey: todayKey,
    // A wide loaded range so the demo never fetches (the API is not there).
    rangeFrom: shiftDateKey(todayKey, -365),
    rangeTo: shiftDateKey(todayKey, 220),
    activeSession,
    entriesByDateKey,
    sessionsByDateKey,
    sidebar: {
      week: {
        goalMinutes: Math.round((summary.scheduledWeekHours ?? 40) * 60),
        loggedMinutes: weekMinutes,
        loggedWeekdays: weekKeys.filter((key) => entriesByDateKey[key]).length,
        totalWeekdays: 5,
      },
      todayMinutes: null,
      monthLoggedMinutes: monthMinutes,
      monthLoggedDays: loggedKeys.length,
      recent: loggedKeys.slice(0, 5).map((key) => ({
        label: shortDayLabel(localDate(key, 12, 0)),
        sessionCount: entriesByDateKey[key].sessionCount,
        totalMinutes: entriesByDateKey[key].totalMinutes,
      })),
    },
    pendingAdjustmentsByDateKey:
      pendingKey && pendingSessions.length > 0
        ? {
            [pendingKey]: {
              id: "demo-hours-pending-1",
              dateKey: pendingKey,
              note: "Stayed late for parent conferences.",
              sessions: [
                {
                  clockIn: toTimeInput(new Date(pendingSessions[0].clockInAt)),
                  clockOut: "17:30",
                },
              ],
            },
          }
        : {},
    adjustmentsRequireApproval: true,
  };

  return {
    pageData,
    previewNow: localDate(todayKey, DEMO_MY_HOURS_NOW.hour, DEMO_MY_HOURS_NOW.minute).toISOString(),
  };
}

function toTimeInput(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

/** Demo My Hours page data: 32.4h this week, 128.6h this month, clocked in at 7:44 AM. */
export function buildDemoTeacherMyHoursPageData(): {
  pageData: TeacherMyHoursPageData;
  previewNow: string;
} {
  return buildDemoTeacherMyHoursPageDataFromSummary(buildDemoTeacherHoursSummary());
}
