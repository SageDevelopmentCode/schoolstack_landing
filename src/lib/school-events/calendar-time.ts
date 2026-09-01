import type { OrganizationEvent } from "./types";

export const WEEK_START_HOUR = 7;
export const WEEK_END_HOUR = 20;
export const HOUR_HEIGHT_PX = 56;
export const DEFAULT_EVENT_DURATION_MINUTES = 60;

export type EventTimeRange = {
  startMinutes: number;
  endMinutes: number;
};

/** Parse HH:MM (24h) or legacy strings like "9:00 AM" into minutes from midnight. */
export function parseTimeToMinutes(value: string | null | undefined): number | null {
  if (!value?.trim()) return null;

  const trimmed = value.trim();

  // HH:MM (24-hour, from <input type="time">)
  const h24Match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (h24Match) {
    const hours = Number(h24Match[1]);
    const minutes = Number(h24Match[2]);
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      return hours * 60 + minutes;
    }
  }

  // 12-hour: "9:00 AM", "9:00am", "12:30 PM"
  const h12Match = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (h12Match) {
    let hours = Number(h12Match[1]);
    const minutes = h12Match[2] ? Number(h12Match[2]) : 0;
    const period = h12Match[3].toLowerCase();
    if (period === "pm" && hours !== 12) hours += 12;
    if (period === "am" && hours === 12) hours = 0;
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      return hours * 60 + minutes;
    }
  }

  return null;
}

export function formatHourLabel(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

export function formatTimeFromMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayHour}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatEventTimeRange(event: OrganizationEvent): string {
  if (event.isAllDay) return "All day";

  const range = getEventTimeRange(event);
  if (!range) return event.time ?? "—";

  const start = formatTimeFromMinutes(range.startMinutes);
  const end = formatTimeFromMinutes(range.endMinutes);
  return `${start} – ${end}`;
}

export function getEventTimeRange(event: OrganizationEvent): EventTimeRange | null {
  if (event.isAllDay) return null;

  const startMinutes = parseTimeToMinutes(event.time);
  if (startMinutes === null) return null;

  const endMinutes =
    parseTimeToMinutes(event.endTime) ?? startMinutes + DEFAULT_EVENT_DURATION_MINUTES;

  return {
    startMinutes,
    endMinutes: Math.max(endMinutes, startMinutes + 15),
  };
}

export function minutesToTop(minutes: number): number {
  const gridStartMinutes = WEEK_START_HOUR * 60;
  const gridEndMinutes = WEEK_END_HOUR * 60;
  const totalHeight = HOUR_HEIGHT_PX * (WEEK_END_HOUR - WEEK_START_HOUR);
  const clamped = Math.max(gridStartMinutes, Math.min(minutes, gridEndMinutes));
  return ((clamped - gridStartMinutes) / (gridEndMinutes - gridStartMinutes)) * totalHeight;
}

export function minutesToHeight(startMinutes: number, endMinutes: number): number {
  const durationMinutes = Math.max(endMinutes - startMinutes, 15);
  return (durationMinutes / 60) * HOUR_HEIGHT_PX;
}

export function getCurrentTimeTop(now: Date = new Date()): number {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const gridStartMinutes = WEEK_START_HOUR * 60;
  const gridEndMinutes = WEEK_END_HOUR * 60;
  if (minutes < gridStartMinutes || minutes > gridEndMinutes) return -1;
  return minutesToTop(minutes);
}

/** Convert stored time to HH:MM for <input type="time"> */
export function toTimeInputValue(value: string | null | undefined): string {
  const minutes = parseTimeToMinutes(value);
  if (minutes === null) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Add minutes to an HH:MM time string; returns HH:MM */
export function addMinutesToTimeInput(time: string, deltaMinutes: number): string {
  const minutes = parseTimeToMinutes(time);
  if (minutes === null) return time;
  const total = Math.min(minutes + deltaMinutes, 23 * 60 + 59);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export const WEEK_GRID_TOTAL_HEIGHT = HOUR_HEIGHT_PX * (WEEK_END_HOUR - WEEK_START_HOUR);

export const SIGNUP_TIME_PERIOD_IDS = ["morning", "afternoon"] as const;
export type SignupTimePeriodId = (typeof SIGNUP_TIME_PERIOD_IDS)[number];

export const SIGNUP_TIME_PERIODS = [
  {
    id: "morning" as const,
    label: "Morning",
    startMinutes: 6 * 60,
    endMinutes: 11 * 60 + 45,
  },
  {
    id: "afternoon" as const,
    label: "Afternoon",
    startMinutes: 12 * 60,
    endMinutes: 18 * 60 + 45,
  },
] as const;

const SIGNUP_TIME_STEP_MINUTES = 15;

function minutesToTimeInput(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function signupTimeOptionsForPeriod(periodId: SignupTimePeriodId): string[] {
  const period = SIGNUP_TIME_PERIODS.find((entry) => entry.id === periodId);
  if (!period) return [];

  const options: string[] = [];
  for (
    let minutes = period.startMinutes;
    minutes <= period.endMinutes;
    minutes += SIGNUP_TIME_STEP_MINUTES
  ) {
    options.push(minutesToTimeInput(minutes));
  }
  return options;
}

export function signupTimePeriodForValue(
  value: string | null | undefined,
): SignupTimePeriodId {
  const minutes = parseTimeToMinutes(value);
  if (minutes === null || minutes < 12 * 60) return "morning";
  return "afternoon";
}

/** Default end time for signup slots: 30 minutes after start. */
export function nextSignupEndTimeFromStart(startTime: string): string {
  return addMinutesToTimeInput(startTime, 30);
}
