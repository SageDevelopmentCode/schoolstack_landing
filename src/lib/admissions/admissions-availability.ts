import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ACTIVITY_ACTIONS,
  logActivityEvent,
} from "@/lib/activity-log";

export type AdmissionsAvailabilitySlotKey = `${string}|${string}`;

function formatSlotLabel(hour24: number, minute: number): string {
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

function buildHalfHourSlots(
  startHour: number,
  startMinute: number,
  endHour: number,
  endMinute: number,
): string[] {
  const slots: string[] = [];
  let hour = startHour;
  let minute = startMinute;

  while (hour < endHour || (hour === endHour && minute <= endMinute)) {
    slots.push(formatSlotLabel(hour, minute));
    minute += 30;
    if (minute >= 60) {
      minute = 0;
      hour += 1;
    }
  }

  return slots;
}

export const ADMISSIONS_TIME_SLOTS = buildHalfHourSlots(6, 0, 23, 30) as readonly string[];

export type AdmissionsTimeSlot = (typeof ADMISSIONS_TIME_SLOTS)[number];

export type AdmissionsTimeSlotPeriod = "morning" | "afternoon" | "night";

export const ADMISSIONS_TIME_SLOT_GROUPS: ReadonlyArray<{
  id: AdmissionsTimeSlotPeriod;
  label: string;
  slots: readonly string[];
}> = [
  {
    id: "morning",
    label: "Morning",
    slots: buildHalfHourSlots(6, 0, 11, 30),
  },
  {
    id: "afternoon",
    label: "Afternoon",
    slots: buildHalfHourSlots(12, 0, 17, 30),
  },
  {
    id: "night",
    label: "Night",
    slots: buildHalfHourSlots(18, 0, 23, 30),
  },
];

export function formatOrganizationTimezoneLabel(timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "short",
    }).formatToParts(new Date());
    const abbr = parts.find((part) => part.type === "timeZoneName")?.value;
    return abbr ? `${abbr} · ${timezone}` : timezone;
  } catch {
    return timezone;
  }
}

const DATE_ONLY_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const DATE_ONLY_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** Format YYYY-MM-DD without local timezone shift (stable SSR + client). */
export function formatDateOnlyLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return dateStr;

  const weekday = DATE_ONLY_WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  const monthName = DATE_ONLY_MONTHS[month - 1] ?? String(month);
  return `${weekday}, ${monthName} ${day}`;
}

/** Format an ISO timestamp in the school's timezone (stable SSR + client). */
export function formatInstantInTimezone(iso: string, timezone: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }
}

export function availabilitySlotKey(date: string, timeSlot: string): AdmissionsAvailabilitySlotKey {
  return `${date}|${timeSlot}`;
}

export function durationToSlotCount(durationMinutes: number): number {
  return Math.max(1, Math.round(durationMinutes / 30));
}

export function formatDurationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours} hr` : `${hours.toFixed(1)} hr`;
}

export function formatVisitDayCountLabel(dayCount: number): string {
  return `${dayCount} school day${dayCount === 1 ? "" : "s"}`;
}

export function formatMaxVisitDaysLabel(maxVisitDays: number): string {
  return `Up to ${maxVisitDays} school day${maxVisitDays === 1 ? "" : "s"}`;
}

export function formatScheduledVisitWhenLabel(visit: {
  schedulingMode?: "time_slot" | "whole_day";
  scheduledDate: string;
  startTimeSlot: string;
  durationMinutes: number;
  visitDayCount?: number;
  endDate?: string;
  visitDates?: string[];
  completedManuallyAt?: string;
}): string {
  if (visit.completedManuallyAt) {
    return "Marked complete by school";
  }

  if (visit.schedulingMode === "whole_day") {
    const dates =
      visit.visitDates && visit.visitDates.length > 0
        ? visit.visitDates
        : visit.endDate && visit.endDate !== visit.scheduledDate
          ? [visit.scheduledDate, visit.endDate]
          : [visit.scheduledDate];

    const dayCount = visit.visitDayCount ?? dates.length;

    if (dates.length === 1) {
      return `${formatDateOnlyLabel(dates[0]!)} (${formatVisitDayCountLabel(1)})`;
    }

    const dateLabels = dates.map((date) => formatDateOnlyLabel(date)).join("; ");
    return `${dateLabels} (${formatVisitDayCountLabel(dayCount)})`;
  }

  return `${formatDateOnlyLabel(visit.scheduledDate)} at ${visit.startTimeSlot}`;
}

function datePartsInTimezone(timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return { year, month, day };
}

export function todayKeyInTimezone(timezone: string): string {
  const { year, month, day } = datePartsInTimezone(timezone);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function todayMonthYearInTimezone(timezone: string): { year: number; month: number } {
  const { year, month } = datePartsInTimezone(timezone);
  return { year, month: month - 1 };
}

export type ScheduledVisitTiming = "upcoming" | "happening" | "past";

/** Parse "6:00 AM" style slot labels to minutes since midnight. */
export function parseAdmissionsTimeSlot(timeSlot: string): number | null {
  const match = timeSlot.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();

  if (period === "AM") {
    if (hour === 12) hour = 0;
  } else if (hour !== 12) {
    hour += 12;
  }

  return hour * 60 + minute;
}

function nowMinutesInTimezone(timezone: string, now = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

export function classifyScheduledVisitTiming(
  visit: {
    schedulingMode?: "time_slot" | "whole_day";
    scheduledDate: string;
    endDate?: string;
    startTimeSlot: string;
    durationMinutes: number;
  },
  timezone: string,
  now = new Date(),
): ScheduledVisitTiming {
  const today = todayKeyInTimezone(timezone);

  if (visit.schedulingMode === "whole_day") {
    const endDate = visit.endDate ?? visit.scheduledDate;
    if (today < visit.scheduledDate) return "upcoming";
    if (today > endDate) return "past";
    return "happening";
  }

  const startMinutes = parseAdmissionsTimeSlot(visit.startTimeSlot);

  if (visit.scheduledDate < today) return "past";
  if (visit.scheduledDate > today) return "upcoming";

  if (startMinutes === null) return "happening";

  const nowMinutes = nowMinutesInTimezone(timezone, now);
  const endMinutes = startMinutes + visit.durationMinutes;

  if (nowMinutes < startMinutes) return "upcoming";
  if (nowMinutes >= endMinutes) return "past";
  return "happening";
}

export async function getOrganizationTimezone(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("organizations")
    .select("timezone")
    .eq("id", organizationId)
    .maybeSingle();

  if (error) throw error;
  const timezone = data?.timezone;
  return typeof timezone === "string" && timezone.trim() ? timezone : "America/Chicago";
}

export async function listAdmissionsAvailabilitySlots(
  supabase: SupabaseClient,
  organizationId: string,
  startDate: string,
  endDate: string,
): Promise<Set<AdmissionsAvailabilitySlotKey>> {
  const { data, error } = await supabase
    .from("admissions_availability_slots")
    .select("date, time_slot")
    .eq("organization_id", organizationId)
    .gte("date", startDate)
    .lte("date", endDate);

  if (error) throw error;

  return new Set(
    (data ?? []).map((row) =>
      availabilitySlotKey(String(row.date), String(row.time_slot)),
    ),
  );
}

export async function countAdmissionsAvailabilitySlotsInMonth(
  supabase: SupabaseClient,
  organizationId: string,
  year: number,
  month: number,
): Promise<number> {
  const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endMonth = month === 11 ? 0 : month + 1;
  const endYear = month === 11 ? year + 1 : year;
  const endDay = new Date(endYear, endMonth + 1, 0).getDate();
  const end = `${endYear}-${String(endMonth + 1).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;

  const slots = await listAdmissionsAvailabilitySlots(
    supabase,
    organizationId,
    start,
    end,
  );
  return slots.size;
}

export async function toggleAdmissionsAvailabilitySlot(
  supabase: SupabaseClient,
  organizationId: string,
  date: string,
  timeSlot: string,
  open: boolean,
): Promise<void> {
  if (open) {
    const { error } = await supabase.from("admissions_availability_slots").insert({
      organization_id: organizationId,
      date,
      time_slot: timeSlot,
    });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("admissions_availability_slots")
      .delete()
      .eq("organization_id", organizationId)
      .eq("date", date)
      .eq("time_slot", timeSlot);

    if (error) throw error;
  }

  void logActivityEvent(supabase, {
    organizationId,
    actorType: "school_admin",
    surface: "school_admin",
    action: ACTIVITY_ACTIONS.AVAILABILITY_SLOT_TOGGLED,
    summary: `${open ? "Opened" : "Closed"} availability slot on ${date} at ${timeSlot}`,
    metadata: {
      date,
      timeSlot,
      open,
    },
  });
}

export function slotsToAvailabilityMap(
  slots: Set<AdmissionsAvailabilitySlotKey>,
): Record<string, string[]> {
  const map: Record<string, string[]> = {};

  for (const key of slots) {
    const [date, timeSlot] = key.split("|");
    if (!date || !timeSlot) continue;
    if (!map[date]) map[date] = [];
    map[date].push(timeSlot);
  }

  for (const date of Object.keys(map)) {
    map[date].sort(
      (a, b) =>
        ADMISSIONS_TIME_SLOTS.indexOf(a as AdmissionsTimeSlot) -
        ADMISSIONS_TIME_SLOTS.indexOf(b as AdmissionsTimeSlot),
    );
  }

  return map;
}

function slotIndex(timeSlot: string): number {
  return ADMISSIONS_TIME_SLOTS.indexOf(timeSlot as AdmissionsTimeSlot);
}

/**
 * Future parent booking: a start time is valid when N consecutive open cells exist.
 */
export function isStartTimeBookable(
  openSlots: Set<AdmissionsAvailabilitySlotKey>,
  date: string,
  startTimeSlot: string,
  durationMinutes: number,
  bookedStarts: Set<AdmissionsAvailabilitySlotKey> = new Set(),
): boolean {
  const startIndex = slotIndex(startTimeSlot);
  if (startIndex < 0) return false;

  const cellCount = durationToSlotCount(durationMinutes);
  if (startIndex + cellCount > ADMISSIONS_TIME_SLOTS.length) return false;

  for (let i = 0; i < cellCount; i++) {
    const timeSlot = ADMISSIONS_TIME_SLOTS[startIndex + i];
    const key = availabilitySlotKey(date, timeSlot);
    if (!openSlots.has(key)) return false;
    if (bookedStarts.has(key)) return false;
  }

  return true;
}
