import {
  formatAttendanceHistoryDateLabel,
  formatAttendanceHistoryTime,
  resolveAttendanceHistoryActor,
  type AttendanceHistoryActor,
} from "@/lib/school-admin/attendance/attendance-history";
import type {
  AttendanceHistoryEntry,
  AttendanceRecordStatus,
} from "@/lib/school-admin/attendance/attendance-types";

/*
 * Pure view helpers for the parent Attendance tab (no React). Everything is
 * derived from the history entries the page has loaded; nothing is invented.
 */

export type AttendanceFilter = "all" | AttendanceRecordStatus;

export const ATTENDANCE_STATUSES: AttendanceRecordStatus[] = ["present", "picked_up", "absent"];

export function attendanceStatusLabel(status: AttendanceRecordStatus): string {
  if (status === "present") return "Present";
  if (status === "absent") return "Absent";
  return "Picked up";
}

/** Chip tone per status (same mapping the story chips used: present ✓, absent ⚠, picked up ℹ). */
export function attendanceStatusTone(
  status: AttendanceRecordStatus,
): "success" | "warning" | "info" {
  if (status === "present") return "success";
  if (status === "absent") return "warning";
  return "info";
}

/** The timestamp that recorded the entry's current status. */
export function attendanceRecordedAtIso(entry: AttendanceHistoryEntry): string | null {
  if (entry.status === "present") return entry.presentAt;
  if (entry.status === "absent") return entry.absentAt;
  return entry.pickedUpAt;
}

export function attendanceRecordedAtTime(entry: AttendanceHistoryEntry): string | null {
  return formatAttendanceHistoryTime(attendanceRecordedAtIso(entry));
}

/** "8:02 AM · Present" (or just "Present" when there is no time). */
export function attendanceMetaLine(entry: AttendanceHistoryEntry): string {
  const time = attendanceRecordedAtTime(entry);
  const label = attendanceStatusLabel(entry.status);
  return time ? `${time} · ${label}` : label;
}

/**
 * The staff member who recorded the entry. For pickups only an actual staff
 * recorder counts (the collecting adult is shown separately).
 */
export function attendanceStaffRecorder(
  entry: AttendanceHistoryEntry,
): AttendanceHistoryActor | null {
  if (entry.status === "picked_up") {
    return entry.recordedByName
      ? { name: entry.recordedByName, photoUrl: entry.recordedByPhotoUrl }
      : null;
  }
  return resolveAttendanceHistoryActor(entry);
}

export type AttendanceTimelineStep = {
  key: "checked_in" | "picked_up" | "absent";
  label: string;
  time: string | null;
  detail: string | null;
};

/** The day as ordered steps: check-in → pickup, or a single absence. */
export function attendanceDayTimeline(entry: AttendanceHistoryEntry): AttendanceTimelineStep[] {
  if (entry.status === "absent") {
    return [
      {
        key: "absent",
        label: "Marked absent",
        time: formatAttendanceHistoryTime(entry.absentAt),
        detail: null,
      },
    ];
  }

  const steps: AttendanceTimelineStep[] = [];
  if (entry.status === "present" || entry.presentAt) {
    steps.push({
      key: "checked_in",
      label: "Checked in",
      time: formatAttendanceHistoryTime(entry.presentAt),
      detail: null,
    });
  }
  if (entry.status === "picked_up") {
    steps.push({
      key: "picked_up",
      label: "Picked up",
      time: formatAttendanceHistoryTime(entry.pickedUpAt),
      detail: entry.pickedUpByName ? `by ${entry.pickedUpByName}` : null,
    });
  }
  return steps;
}

export type AttendanceStatusCounts = Record<AttendanceRecordStatus, number>;

export function countAttendanceByStatus(entries: AttendanceHistoryEntry[]): AttendanceStatusCounts {
  const counts: AttendanceStatusCounts = { present: 0, absent: 0, picked_up: 0 };
  for (const entry of entries) counts[entry.status] += 1;
  return counts;
}

export function filterAttendanceEntries(
  entries: AttendanceHistoryEntry[],
  filter: AttendanceFilter,
): AttendanceHistoryEntry[] {
  return filter === "all" ? entries : entries.filter((entry) => entry.status === filter);
}

/* ------------------------------------------------------------------ */
/* Dates (YYYY-MM-DD keys, local time; never via toISOString)          */
/* ------------------------------------------------------------------ */

export function parseDateKey(dateKey: string): Date | null {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** "Today" / "Yesterday" / "Mon, Nov 10" relative to `now`. */
export function attendanceRelativeDayLabel(dateKey: string, now: Date = new Date()): string {
  const date = parseDateKey(dateKey);
  if (!date) return dateKey;
  const todayKey = toDateKey(now);
  if (dateKey === todayKey) return "Today";
  if (dateKey === toDateKey(addDays(now, -1))) return "Yesterday";
  return formatAttendanceHistoryDateLabel(dateKey);
}

export type AttendanceMonthGroup = {
  key: string;
  label: string;
  entries: AttendanceHistoryEntry[];
};

/** Consecutive entries grouped by calendar month, keeping the given order. */
export function groupAttendanceEntriesByMonth(
  entries: AttendanceHistoryEntry[],
): AttendanceMonthGroup[] {
  const groups: AttendanceMonthGroup[] = [];
  for (const entry of entries) {
    const key = entry.date.slice(0, 7);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.entries.push(entry);
      continue;
    }
    const date = parseDateKey(entry.date);
    groups.push({
      key,
      label: date
        ? date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : key,
      entries: [entry],
    });
  }
  return groups;
}

export type AttendanceWeekDay = {
  dateKey: string;
  weekday: string;
  dayOfMonth: number;
  entry: AttendanceHistoryEntry | null;
};

export type AttendanceWeekRow = {
  weekStartKey: string;
  label: string;
  days: AttendanceWeekDay[];
};

export type AttendanceRecentWeeks = {
  rows: AttendanceWeekRow[];
  weekdays: string[];
  rangeLabel: string;
  recordedDays: number;
};

function startOfWeekMonday(date: Date): Date {
  const offset = (date.getDay() + 6) % 7; // Monday = 0
  return addDays(date, -offset);
}

function shortDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * A Mon–Fri grid (Mon–Sun when a weekend day has a record) of the `weeks`
 * weeks ending with the week of the latest loaded record, newest week last.
 */
export function buildAttendanceRecentWeeks(
  entries: AttendanceHistoryEntry[],
  weeks = 4,
): AttendanceRecentWeeks | null {
  if (entries.length === 0) return null;
  const latestKey = entries.reduce(
    (max, entry) => (entry.date > max ? entry.date : max),
    entries[0].date,
  );
  const latest = parseDateKey(latestKey);
  if (!latest) return null;

  const byDate = new Map(entries.map((entry) => [entry.date, entry]));
  const firstMonday = addDays(startOfWeekMonday(latest), -7 * (weeks - 1));
  const lastSunday = addDays(startOfWeekMonday(latest), 6);

  let includeWeekend = false;
  for (let i = 0; i < weeks * 7; i += 1) {
    const day = addDays(firstMonday, i);
    if ((day.getDay() === 0 || day.getDay() === 6) && byDate.has(toDateKey(day))) {
      includeWeekend = true;
      break;
    }
  }
  const dayCount = includeWeekend ? 7 : 5;

  let recordedDays = 0;
  const rows: AttendanceWeekRow[] = [];
  for (let w = 0; w < weeks; w += 1) {
    const monday = addDays(firstMonday, w * 7);
    const days: AttendanceWeekDay[] = [];
    for (let d = 0; d < dayCount; d += 1) {
      const day = addDays(monday, d);
      const dateKey = toDateKey(day);
      const entry = byDate.get(dateKey) ?? null;
      if (entry) recordedDays += 1;
      days.push({
        dateKey,
        weekday: day.toLocaleDateString("en-US", { weekday: "short" }),
        dayOfMonth: day.getDate(),
        entry,
      });
    }
    rows.push({ weekStartKey: toDateKey(monday), label: `Week of ${shortDate(monday)}`, days });
  }

  const lastShownDay = includeWeekend ? lastSunday : addDays(lastSunday, -2);
  return {
    rows,
    weekdays: rows[0].days.map((day) => day.weekday),
    rangeLabel: `${shortDate(firstMonday)} – ${shortDate(lastShownDay)}`,
    recordedDays,
  };
}
