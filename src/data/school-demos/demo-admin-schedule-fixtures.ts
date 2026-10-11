import {
  todayKeyInTimezone,
  type AdmissionsAvailabilitySlotRecord,
} from "@/lib/admissions/admissions-availability";

export const DEMO_MARKETING_TOUR_TIMEZONE = "America/Chicago";

const MORNING_SLOTS = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM"] as const;
const AFTERNOON_SLOTS = ["1:00 PM", "1:30 PM", "2:00 PM"] as const;

function addDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  const nextYear = date.getUTCFullYear();
  const nextMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getUTCDate()).padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

function weekdayIndex(isoDate: string): number {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

/** Next weekday dates after today so published slots stay in the visible month. */
function upcomingWeekdays(startIso: string, count: number): string[] {
  const dates: string[] = [];
  let cursor = addDays(startIso, 1);
  while (dates.length < count) {
    const day = weekdayIndex(cursor);
    if (day !== 0 && day !== 6) dates.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return dates;
}

/**
 * Published campus-tour times for the marketing Schedule → Tours & interviews slide.
 * Dates follow the current month so the calendar shows open slots instead of a past month.
 */
export function buildDemoMarketingTourAvailabilitySlots(): AdmissionsAvailabilitySlotRecord[] {
  const dates = upcomingWeekdays(todayKeyInTimezone(DEMO_MARKETING_TOUR_TIMEZONE), 5);
  const pattern: ReadonlyArray<readonly string[]> = [
    MORNING_SLOTS,
    [...MORNING_SLOTS.slice(2), ...AFTERNOON_SLOTS.slice(0, 2)],
    AFTERNOON_SLOTS,
    ["9:00 AM", "10:00 AM", "10:30 AM"],
    ["9:30 AM", "1:30 PM", "2:00 PM"],
  ];

  return dates.flatMap((date, index) =>
    (pattern[index] ?? MORNING_SLOTS).map((timeSlot) => ({
      date,
      timeSlot,
      tourBookingMode: "exclusive" as const,
      groupCapacity: null,
      groupDayKey: null,
    })),
  );
}
