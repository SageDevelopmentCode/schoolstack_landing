import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ALL_DAY_TIME_SLOT,
  findWholeDaySlotForDate,
  listOccupiedObservationSlotIds,
  toggleWholeDayObservationSlot,
} from "./admissions-observation-slots";

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
    .from("admissions_observation_slots")
    .select("date")
    .eq("organization_id", organizationId)
    .eq("start_time", ALL_DAY_TIME_SLOT)
    .is("end_time", null)
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
  await toggleWholeDayObservationSlot(supabase, organizationId, date, open);
}

export async function listOccupiedObservationDays(
  supabase: SupabaseClient,
  organizationId: string,
  startDate: string,
  endDate: string,
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("admissions_scheduled_visit_days")
    .select("date, observation_slot_id")
    .eq("organization_id", organizationId)
    .gte("date", startDate)
    .lte("date", endDate);

  if (error) throw error;

  const slotIds = (data ?? [])
    .map((row) => row.observation_slot_id)
    .filter((value): value is string => Boolean(value))
    .map(String);

  if (slotIds.length === 0) {
    return new Set((data ?? []).map((row) => String(row.date)));
  }

  const { data: slots, error: slotsError } = await supabase
    .from("admissions_observation_slots")
    .select("id, date, start_time, end_time")
    .in("id", slotIds);

  if (slotsError) throw slotsError;

  const wholeDaySlotIds = new Set(
    (slots ?? [])
      .filter(
        (slot) =>
          String(slot.start_time) === ALL_DAY_TIME_SLOT && slot.end_time == null,
      )
      .map((slot) => String(slot.id)),
  );

  const occupiedDates = new Set<string>();
  for (const row of data ?? []) {
    const slotId = row.observation_slot_id ? String(row.observation_slot_id) : null;
    if (!slotId || wholeDaySlotIds.has(slotId)) {
      occupiedDates.add(String(row.date));
    }
  }

  return occupiedDates;
}

export async function listOccupiedWholeDaySlotIds(
  supabase: SupabaseClient,
  organizationId: string,
  startDate: string,
  endDate: string,
): Promise<Set<string>> {
  return listOccupiedObservationSlotIds(supabase, organizationId, startDate, endDate);
}

export async function getWholeDaySlotIdForDate(
  supabase: SupabaseClient,
  organizationId: string,
  date: string,
): Promise<string | null> {
  const slot = await findWholeDaySlotForDate(supabase, organizationId, date);
  return slot?.id ?? null;
}
