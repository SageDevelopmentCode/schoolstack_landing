import { formatHoursMinutes } from "@/lib/school-teacher/my-hours/format-duration";
import { sessionCountLabel } from "@/lib/school-teacher/my-hours/my-hours-status";
import type { MyHoursAdjustmentSession } from "@/lib/school-teacher/my-hours/types";

export type AdjustSessionDraft = {
  key: string;
  clockIn: string;
  clockOut: string;
  /** "Was 7:44 AM – 3:52 PM" when the draft edits a logged session. */
  originalLabel?: string | null;
};

/** `HH:mm` → minutes after midnight (same parsing as the old adjust panel). */
export function minutesFromTime(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

export function sessionMinutes(clockIn: string, clockOut: string): number | null {
  const start = minutesFromTime(clockIn);
  const end = minutesFromTime(clockOut);
  if (start == null || end == null || end <= start) return null;
  return end - start;
}

export type AdjustValidation = {
  /** Per-session message keyed by draft key; null when that session is fine. */
  errors: Record<string, string | null>;
  valid: boolean;
  totalMinutes: number;
};

/**
 * The old editor's save rule, per session: every session needs a clock-out
 * after its clock-in, and no two sessions may overlap
 * (`adjustmentSessionsOverlap`'s predicate). `valid` ⇔ the old panel would
 * save. Same rule and copy as the mobile Garden editor.
 */
export function validateAdjustmentSessions(
  sessions: Array<Pick<AdjustSessionDraft, "key" | "clockIn" | "clockOut">>,
): AdjustValidation {
  const errors: Record<string, string | null> = {};
  const ranges = sessions.map((session) => {
    const start = minutesFromTime(session.clockIn);
    const end = minutesFromTime(session.clockOut);
    return start == null || end == null || end <= start ? null : { start, end };
  });

  let totalMinutes = 0;
  sessions.forEach((session, index) => {
    const range = ranges[index];
    if (!range) {
      const bothSet =
        minutesFromTime(session.clockIn) != null && minutesFromTime(session.clockOut) != null;
      errors[session.key] = bothSet ? "Clock out must be after clock in." : "Pick both times.";
      return;
    }
    totalMinutes += range.end - range.start;
    const overlapIndex = ranges.findIndex(
      (other, otherIndex) =>
        otherIndex !== index && other != null && range.start < other.end && other.start < range.end,
    );
    errors[session.key] = overlapIndex >= 0 ? `Overlaps session ${overlapIndex + 1}.` : null;
  });

  return {
    errors,
    valid: sessions.length > 0 && Object.values(errors).every((error) => error == null),
    totalMinutes,
  };
}

/** "3:00 PM" style label for an `HH:mm` value ("—" when it isn't a time). */
export function formatClockValue(value: string): string {
  const minutes = minutesFromTime(value);
  if (minutes == null) return "—";
  const date = new Date(2000, 0, 1, Math.floor(minutes / 60), minutes % 60);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/** Summary of a pending adjustment (same copy as the old adjust panel). */
export function draftSummary(sessions: MyHoursAdjustmentSession[]): string {
  const total = sessions.reduce(
    (sum, session) => sum + (sessionMinutes(session.clockIn, session.clockOut) ?? 0),
    0,
  );
  if (sessions.length === 1) {
    const session = sessions[0];
    return `${formatClockValue(session.clockIn)} – ${formatClockValue(session.clockOut)} · ${formatHoursMinutes(total)}`;
  }
  return `${formatHoursMinutes(total)} · ${sessionCountLabel(sessions.length)}`;
}

/** ISO instant → `HH:mm` wall time in the school's timezone. */
export function isoToTimeInput(iso: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  let hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  if (hour === "24") hour = "00";
  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
}
