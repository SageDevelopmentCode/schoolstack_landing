import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ACTIVITY_ACTIONS,
  logActivityEvent,
} from "@/lib/activity-log";

export const ALL_DAY_TIME_SLOT = "ALL_DAY";

export function addCalendarDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const cursor = new Date(Date.UTC(year, month - 1, day));
  cursor.setUTCDate(cursor.getUTCDate() + days);

  const nextYear = cursor.getUTCFullYear();
  const nextMonth = String(cursor.getUTCMonth() + 1).padStart(2, "0");
  const nextDay = String(cursor.getUTCDate()).padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

export function eachDateInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  let cursor = startDate;

  while (cursor <= endDate) {
    dates.push(cursor);
    cursor = addCalendarDays(cursor, 1);
  }

  return dates;
}

export function listConsecutiveDates(startDate: string, dayCount: number): string[] {
  const dates: string[] = [];
  for (let index = 0; index < dayCount; index++) {
    dates.push(addCalendarDays(startDate, index));
  }
  return dates;
}

export function listBookableObservationDates(
  openDays: Set<string>,
  occupiedDays: Set<string>,
  startDate: string,
  endDate: string,
): string[] {
  return eachDateInRange(startDate, endDate).filter(
    (date) => openDays.has(date) && !occupiedDays.has(date),
  );
}

/** @deprecated Use listBookableObservationDates for multiselect booking. */
export function listBookableObservationStartDates(
  openDays: Set<string>,
  occupiedDays: Set<string>,
  startDate: string,
  endDate: string,
  visitDayCount: number,
): string[] {
  const bookable: string[] = [];

  for (const date of eachDateInRange(startDate, endDate)) {
    const block = listConsecutiveDates(date, visitDayCount);
    const lastDate = block[block.length - 1];
    if (!lastDate || lastDate > endDate) continue;

    const allOpen = block.every((day) => openDays.has(day));
    const noneOccupied = block.every((day) => !occupiedDays.has(day));

    if (allOpen && noneOccupied) {
      bookable.push(date);
    }
  }

  return bookable;
}

export async function listObservationDayAvailability(
  supabase: SupabaseClient,
  organizationId: string,
  startDate: string,
  endDate: string,
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("admissions_observation_day_availability")
    .select("date")
    .eq("organization_id", organizationId)
    .gte("date", startDate)
    .lte("date", endDate);

  if (error) throw error;

  return new Set((data ?? []).map((row) => String(row.date)));
}

export async function countObservationDaysInMonth(
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

  const days = await listObservationDayAvailability(
    supabase,
    organizationId,
    start,
    end,
  );
  return days.size;
}

export async function toggleObservationDay(
  supabase: SupabaseClient,
  organizationId: string,
  date: string,
  open: boolean,
): Promise<void> {
  if (open) {
    const { error } = await supabase
      .from("admissions_observation_day_availability")
      .insert({
        organization_id: organizationId,
        date,
      });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("admissions_observation_day_availability")
      .delete()
      .eq("organization_id", organizationId)
      .eq("date", date);

    if (error) throw error;
  }

  void logActivityEvent(supabase, {
    organizationId,
    actorType: "school_admin",
    surface: "school_admin",
    action: ACTIVITY_ACTIONS.AVAILABILITY_SLOT_TOGGLED,
    summary: `${open ? "Opened" : "Closed"} observation day on ${date}`,
    metadata: {
      date,
      open,
      availabilityType: "observation_day",
    },
  });
}

export async function listOccupiedObservationDays(
  supabase: SupabaseClient,
  organizationId: string,
  startDate: string,
  endDate: string,
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("admissions_scheduled_visit_days")
    .select("date")
    .eq("organization_id", organizationId)
    .gte("date", startDate)
    .lte("date", endDate);

  if (error) throw error;

  return new Set((data ?? []).map((row) => String(row.date)));
}
