import { formatTimeFromMinutes, parseTimeToMinutes } from "@/lib/school-events/calendar-time";
import { MyHoursMutationError } from "@/lib/school-teacher/my-hours/my-hours-mutations";
import type { MyHoursAdjustmentSession } from "@/lib/school-teacher/my-hours/types";

export const STAFF_HOURS_ADJUSTMENT_EMAIL_CAP = 4;

const SESSION_MAX = 12;

export function shouldSendStaffHoursAdjustmentEmail(sentToday: number): boolean {
  return sentToday < STAFF_HOURS_ADJUSTMENT_EMAIL_CAP;
}

function adjustmentSessionRangesOverlap(
  ranges: Array<{ start: number; end: number }>,
): boolean {
  if (ranges.length < 2) return false;
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  for (let i = 0; i < sorted.length - 1; i += 1) {
    const current = sorted[i];
    const next = sorted[i + 1];
    if (current.start < next.end && next.start < current.end) {
      return true;
    }
  }
  return false;
}

export function adjustmentSessionsOverlap(
  sessions: Array<{ clockIn: string; clockOut: string }>,
): boolean {
  const ranges: Array<{ start: number; end: number }> = [];
  for (const session of sessions) {
    const start = parseTimeToMinutes(session.clockIn);
    const end = parseTimeToMinutes(session.clockOut);
    if (start == null || end == null || end <= start) continue;
    ranges.push({ start, end });
  }
  if (ranges.length < 2) return false;
  return adjustmentSessionRangesOverlap(ranges);
}

export function assertNoOverlappingAdjustmentSessions(
  sessions: MyHoursAdjustmentSession[],
): void {
  const ranges = sessions.map((session) => {
    const start = parseTimeToMinutes(session.clockIn);
    const end = parseTimeToMinutes(session.clockOut);
    if (start == null || end == null || end <= start) {
      throw new MyHoursMutationError(
        "Check the times before saving.",
        "invalid_sessions",
        400,
      );
    }
    return { start, end };
  });
  if (adjustmentSessionRangesOverlap(ranges)) {
    throw new MyHoursMutationError(
      "Sessions can't overlap.",
      "invalid_sessions",
      400,
    );
  }
}

export function parseAdjustmentSessions(input: unknown): MyHoursAdjustmentSession[] {
  if (!Array.isArray(input) || input.length === 0) {
    throw new MyHoursMutationError(
      "Add at least one session.",
      "invalid_sessions",
      400,
    );
  }
  if (input.length > SESSION_MAX) {
    throw new MyHoursMutationError(
      "That day has too many sessions.",
      "invalid_sessions",
      400,
    );
  }

  const sessions = input.map((item) => {
    if (!item || typeof item !== "object") {
      throw new MyHoursMutationError(
        "Check the times before saving.",
        "invalid_sessions",
        400,
      );
    }
    const clockIn = "clockIn" in item ? String(item.clockIn) : "";
    const clockOut = "clockOut" in item ? String(item.clockOut) : "";
    const start = parseTimeToMinutes(clockIn);
    const end = parseTimeToMinutes(clockOut);
    if (start == null || end == null || end <= start) {
      throw new MyHoursMutationError(
        "Check the times before saving.",
        "invalid_sessions",
        400,
      );
    }
    return {
      clockIn: minutesToInput(start),
      clockOut: minutesToInput(end),
    };
  });
  assertNoOverlappingAdjustmentSessions(sessions);
  return sessions;
}

export function formatAdjustmentSessionsLabel(
  sessions: MyHoursAdjustmentSession[],
): string {
  if (sessions.length === 0) return "No sessions";
  return sessions
    .map((session) => {
      const start = parseTimeToMinutes(session.clockIn);
      const end = parseTimeToMinutes(session.clockOut);
      if (start == null || end == null) return `${session.clockIn}–${session.clockOut}`;
      return `${formatTimeFromMinutes(start)} – ${formatTimeFromMinutes(end)}`;
    })
    .join("; ");
}

export function readStoredAdjustmentSessions(value: unknown): MyHoursAdjustmentSession[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const clockIn = "clockIn" in item ? String(item.clockIn) : "";
    const clockOut = "clockOut" in item ? String(item.clockOut) : "";
    const start = parseTimeToMinutes(clockIn);
    const end = parseTimeToMinutes(clockOut);
    if (start == null || end == null || end <= start) return [];
    return [{ clockIn: minutesToInput(start), clockOut: minutesToInput(end) }];
  });
}

export function minutesToInput(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

const DEFAULT_NEXT_CLOCK_IN = "08:00";
const DEFAULT_NEXT_CLOCK_OUT = "15:00";
const MAX_MINUTES_IN_DAY = 24 * 60 - 1;

export function defaultNextAdjustmentSession(
  sessions: Array<{ clockIn: string; clockOut: string }>,
): { clockIn: string; clockOut: string } {
  let latestEnd: number | null = null;
  for (const session of sessions) {
    const start = parseTimeToMinutes(session.clockIn);
    const end = parseTimeToMinutes(session.clockOut);
    if (start == null || end == null || end <= start) continue;
    latestEnd = latestEnd == null ? end : Math.max(latestEnd, end);
  }
  if (latestEnd == null) {
    return { clockIn: DEFAULT_NEXT_CLOCK_IN, clockOut: DEFAULT_NEXT_CLOCK_OUT };
  }
  const defaultEnd = parseTimeToMinutes(DEFAULT_NEXT_CLOCK_OUT) ?? 15 * 60;
  let clockOut = Math.max(defaultEnd, latestEnd + 7 * 60);
  clockOut = Math.min(clockOut, MAX_MINUTES_IN_DAY);
  if (clockOut <= latestEnd) {
    clockOut = Math.min(latestEnd + 60, MAX_MINUTES_IN_DAY);
  }
  return {
    clockIn: minutesToInput(latestEnd),
    clockOut: minutesToInput(clockOut),
  };
}
