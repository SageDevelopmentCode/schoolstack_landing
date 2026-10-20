import { parseAdmissionsTimeSlot } from "@/lib/admissions/admissions-availability";
import { SCHEDULER_TIMEZONE, sortDemoTimeSlots } from "@/lib/demo-scheduler";

export type DemoDisplaySlot = {
  displayTime: string;
  canonicalDate: string;
  canonicalTime: string;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** Wall-clock in `timeZone` → UTC instant (no external tz library). */
function zonedWallClockToUtc(
  date: string,
  minutesSinceMidnight: number,
  timeZone: string,
): Date {
  const [year, month, day] = date.split("-").map(Number);
  const hour = Math.floor(minutesSinceMidnight / 60);
  const minute = minutesSinceMidnight % 60;

  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const asUtcParts = (ms: number) => {
    const parts = formatter.formatToParts(new Date(ms));
    const pick = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((p) => p.type === type)?.value ?? 0);
    return {
      year: pick("year"),
      month: pick("month"),
      day: pick("day"),
      hour: pick("hour"),
      minute: pick("minute"),
      second: pick("second"),
    };
  };

  let guess = utcGuess;
  for (let i = 0; i < 4; i++) {
    const got = asUtcParts(guess);
    const desiredMs = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
    const gotMs = Date.UTC(
      got.year,
      got.month - 1,
      got.day,
      got.hour,
      got.minute,
      got.second,
    );
    const delta = desiredMs - gotMs;
    if (delta === 0) break;
    guess += delta;
  }

  return new Date(guess);
}

export function demoCanonicalSlotToInstant(
  canonicalDate: string,
  canonicalTime: string,
): Date | null {
  const minutes = parseAdmissionsTimeSlot(canonicalTime);
  if (minutes === null) return null;
  return zonedWallClockToUtc(canonicalDate, minutes, SCHEDULER_TIMEZONE);
}

export function displayDateKeyInTimezone(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);

  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function formatDemoTimeLabelInTimezone(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(instant);

  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const dayPeriod =
    parts.find((p) => p.type === "dayPeriod")?.value?.toUpperCase() ?? "AM";
  const period = dayPeriod.startsWith("P") ? "PM" : "AM";
  return `${hour}:${String(minute).padStart(2, "0")} ${period}`;
}

export function buildDisplayAvailabilitySlots(
  canonicalSlots: Record<string, string[]>,
  displayTimezone: string,
  now = new Date(),
): {
  slots: Record<string, DemoDisplaySlot[]>;
  minDisplayDate: string | null;
} {
  const slots: Record<string, DemoDisplaySlot[]> = {};
  const todayDisplay = displayDateKeyInTimezone(now, displayTimezone);

  for (const [canonicalDate, times] of Object.entries(canonicalSlots)) {
    for (const canonicalTime of times) {
      const instant = demoCanonicalSlotToInstant(canonicalDate, canonicalTime);
      if (!instant || instant.getTime() <= now.getTime()) continue;

      const displayDate = displayDateKeyInTimezone(instant, displayTimezone);
      if (displayDate < todayDisplay) continue;

      const displayTime = formatDemoTimeLabelInTimezone(instant, displayTimezone);
      const entry: DemoDisplaySlot = {
        displayTime,
        canonicalDate,
        canonicalTime,
      };

      if (!slots[displayDate]) slots[displayDate] = [];
      slots[displayDate].push(entry);
    }
  }

  for (const date of Object.keys(slots)) {
    slots[date].sort((a, b) => {
      const ai = demoCanonicalSlotToInstant(a.canonicalDate, a.canonicalTime);
      const bi = demoCanonicalSlotToInstant(b.canonicalDate, b.canonicalTime);
      if (!ai || !bi) return 0;
      return ai.getTime() - bi.getTime();
    });
  }

  const dates = Object.keys(slots)
    .filter((d) => (slots[d]?.length ?? 0) > 0)
    .sort();

  return {
    slots,
    minDisplayDate: dates[0] ?? null,
  };
}

export function firstAvailableDisplayDemoDate(
  displaySlots: Record<string, DemoDisplaySlot[]>,
  minDisplayDate: string | null,
): string | null {
  if (!minDisplayDate) return null;
  if ((displaySlots[minDisplayDate]?.length ?? 0) > 0) return minDisplayDate;
  const dates = Object.keys(displaySlots)
    .filter((date) => date >= minDisplayDate && (displaySlots[date]?.length ?? 0) > 0)
    .sort();
  return dates[0] ?? null;
}

/** Format canonical CT slot for ops copy. */
export function formatCanonicalDemoWhen(
  canonicalDate: string,
  canonicalTime: string,
): string {
  return `${canonicalDate} at ${canonicalTime} CT`;
}

export function formatDemoWhenInTimezone(
  canonicalDate: string,
  canonicalTime: string,
  timeZone: string,
): string | null {
  const instant = demoCanonicalSlotToInstant(canonicalDate, canonicalTime);
  if (!instant) return null;

  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "short",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(instant);
  } catch {
    return null;
  }
}

/** Sort display slot times for a day (by instant). */
export type DemoSlotPeriod = "morning" | "afternoon" | "evening";

export function classifyDemoSlotPeriod(
  slot: DemoDisplaySlot,
  displayTimezone: string,
): DemoSlotPeriod {
  const instant = demoCanonicalSlotToInstant(slot.canonicalDate, slot.canonicalTime);
  if (!instant) return "morning";

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: displayTimezone,
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(instant);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export function sortDisplaySlotsForDay(slots: DemoDisplaySlot[]): DemoDisplaySlot[] {
  return [...slots].sort((a, b) => {
    const ai = demoCanonicalSlotToInstant(a.canonicalDate, a.canonicalTime);
    const bi = demoCanonicalSlotToInstant(b.canonicalDate, b.canonicalTime);
    if (!ai || !bi) return 0;
    return ai.getTime() - bi.getTime();
  });
}

/** Re-export for callers that need canonical sort on raw labels. */
export { sortDemoTimeSlots };
