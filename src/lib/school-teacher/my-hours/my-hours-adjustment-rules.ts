import { formatTimeFromMinutes, parseTimeToMinutes } from "@/lib/school-events/calendar-time";
import { MyHoursMutationError } from "@/lib/school-teacher/my-hours/my-hours-mutations";
import type { MyHoursAdjustmentSession } from "@/lib/school-teacher/my-hours/types";

export const STAFF_HOURS_ADJUSTMENT_EMAIL_CAP = 4;

const SESSION_MAX = 12;

export function shouldSendStaffHoursAdjustmentEmail(sentToday: number): boolean {
  return sentToday < STAFF_HOURS_ADJUSTMENT_EMAIL_CAP;
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

  return input.map((item) => {
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
