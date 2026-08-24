import type { SupabaseClient } from '@supabase/supabase-js';
import {
  ADMISSIONS_TIME_SLOT_GROUPS,
  type AdmissionsTimeSlotPeriod,
} from "./admissions-availability";
import {
  STUDENT_GRADE_OPTIONS,
} from './apply-system-fields';

export const ALL_DAY_TIME_SLOT = "ALL_DAY";

export type ObservationSlot = {
  id: string;
  organizationId: string;
  date: string;
  startTime: string;
  endTime: string | null;
  label: string | null;
  gradeValues: string[];
  createdAt: string;
};

export type ObservationSlotInput = {
  date: string;
  startTime: string;
  endTime?: string | null;
  label?: string | null;
  gradeValues?: string[];
};

export type ShadowDayTimeWindowPreset = {
  id: AdmissionsTimeSlotPeriod;
  label: string;
  startTime: string;
  endTime: string;
};

const GRADE_LABEL_BY_VALUE = new Map(
  STUDENT_GRADE_OPTIONS.map((option) => [option.value, option.label]),
);

function observationSlotFromRow(
  row: Record<string, unknown>,
  gradeValues: string[],
): ObservationSlot {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    date: String(row.date),
    startTime: String(row.start_time),
    endTime: row.end_time ? String(row.end_time) : null,
    label: row.label ? String(row.label) : null,
    gradeValues,
    createdAt: String(row.created_at),
  };
}

function normalizeGradeValues(gradeValues: string[] | undefined): string[] {
  if (!gradeValues?.length) return [];
  return [...new Set(gradeValues.map((value) => value.trim()).filter(Boolean))].sort();
}

function gradesMatchSlot(slotGrades: string[], studentGrade: string | null): boolean {
  if (slotGrades.length === 0) return true;
  if (!studentGrade) return false;
  return slotGrades.includes(studentGrade);
}

export function getShadowDayTimeWindowPresets(): ShadowDayTimeWindowPreset[] {
  return ADMISSIONS_TIME_SLOT_GROUPS.map((group) => ({
    id: group.id,
    label: group.label,
    startTime: group.slots[0] ?? "6:00 AM",
    endTime: group.slots[group.slots.length - 1] ?? "11:30 AM",
  }));
}

export function formatGradeValuesLabel(gradeValues: string[]): string {
  if (gradeValues.length === 0) return "All grades";
  return gradeValues
    .map((value) => GRADE_LABEL_BY_VALUE.get(value) ?? value)
    .join(", ");
}

export function formatObservationSlotTimeLabel(slot: Pick<ObservationSlot, "startTime" | "endTime">): string {
  if (slot.startTime === ALL_DAY_TIME_SLOT) {
    return "All day";
  }
  if (slot.endTime) {
    return `${slot.startTime} – ${slot.endTime}`;
  }
  return slot.startTime;
}

export function formatObservationSlotLabel(
  slot: Pick<ObservationSlot, "date" | "startTime" | "endTime" | "label" | "gradeValues">,
): string {
  if (slot.label?.trim()) return slot.label.trim();

  const parts: string[] = [];
  if (slot.gradeValues.length > 0) {
    parts.push(formatGradeValuesLabel(slot.gradeValues));
  }
  if (slot.startTime !== ALL_DAY_TIME_SLOT) {
    parts.push(formatObservationSlotTimeLabel(slot));
  }
  return parts.length > 0 ? parts.join(" · ") : "Shadow visit";
}

async function loadGradesForSlots(
  supabase: SupabaseClient,
  slotIds: string[],
): Promise<Map<string, string[]>> {
  if (slotIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from("admissions_observation_slot_grades")
    .select("slot_id, grade_value")
    .in("slot_id", slotIds);

  if (error) throw error;

  const gradesBySlot = new Map<string, string[]>();
  for (const row of data ?? []) {
    const slotId = String(row.slot_id);
    const gradeValue = String(row.grade_value);
    const existing = gradesBySlot.get(slotId) ?? [];
    existing.push(gradeValue);
    gradesBySlot.set(slotId, existing);
  }

  for (const [slotId, grades] of gradesBySlot) {
    gradesBySlot.set(slotId, normalizeGradeValues(grades));
  }

  return gradesBySlot;
}

async function attachGradesToSlots(
  supabase: SupabaseClient,
  rows: Record<string, unknown>[],
): Promise<ObservationSlot[]> {
  const slotIds = rows.map((row) => String(row.id));
  const gradesBySlot = await loadGradesForSlots(supabase, slotIds);

  return rows.map((row) =>
    observationSlotFromRow(row, gradesBySlot.get(String(row.id)) ?? []),
  );
}

async function replaceSlotGrades(
  supabase: SupabaseClient,
  slotId: string,
  gradeValues: string[],
): Promise<void> {
  const { error: deleteError } = await supabase
    .from("admissions_observation_slot_grades")
    .delete()
    .eq("slot_id", slotId);

  if (deleteError) throw deleteError;

  if (gradeValues.length === 0) return;

  const { error: insertError } = await supabase
    .from("admissions_observation_slot_grades")
    .insert(
      gradeValues.map((gradeValue) => ({
        slot_id: slotId,
        grade_value: gradeValue,
      })),
    );

  if (insertError) throw insertError;
}

export async function listObservationSlotsForDateRange(
  supabase: SupabaseClient,
  organizationId: string,
  startDate: string,
  endDate: string,
): Promise<ObservationSlot[]> {
  const { data, error } = await supabase
    .from("admissions_observation_slots")
    .select("id, organization_id, date, start_time, end_time, label, created_at")
    .eq("organization_id", organizationId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw error;
  return attachGradesToSlots(supabase, data ?? []);
}

export async function listObservationSlotsForDate(
  supabase: SupabaseClient,
  organizationId: string,
  date: string,
): Promise<ObservationSlot[]> {
  return listObservationSlotsForDateRange(supabase, organizationId, date, date);
}

export async function listOccupiedObservationSlotIds(
  supabase: SupabaseClient,
  organizationId: string,
  startDate: string,
  endDate: string,
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("admissions_scheduled_visit_days")
    .select("observation_slot_id")
    .eq("organization_id", organizationId)
    .gte("date", startDate)
    .lte("date", endDate)
    .not("observation_slot_id", "is", null);

  if (error) throw error;

  return new Set(
    (data ?? [])
      .map((row) => row.observation_slot_id)
      .filter((value): value is string => Boolean(value))
      .map(String),
  );
}

export function listBookableObservationSlots(
  slots: ObservationSlot[],
  occupiedSlotIds: Set<string>,
  studentGrade: string | null,
  startDate: string,
  endDate: string,
): ObservationSlot[] {
  return slots.filter((slot) => {
    if (slot.date < startDate || slot.date > endDate) return false;
    if (occupiedSlotIds.has(slot.id)) return false;
    return gradesMatchSlot(slot.gradeValues, studentGrade);
  });
}

export async function listObservationSlotsByIds(
  supabase: SupabaseClient,
  slotIds: string[],
): Promise<ObservationSlot[]> {
  if (slotIds.length === 0) return [];

  const { data, error } = await supabase
    .from("admissions_observation_slots")
    .select("id, organization_id, date, start_time, end_time, label, created_at")
    .in("id", slotIds);

  if (error) throw error;
  return attachGradesToSlots(supabase, data ?? []);
}

export async function getObservationSlotById(
  supabase: SupabaseClient,
  organizationId: string,
  slotId: string,
): Promise<ObservationSlot | null> {
  const { data, error } = await supabase
    .from("admissions_observation_slots")
    .select("id, organization_id, date, start_time, end_time, label, created_at")
    .eq("organization_id", organizationId)
    .eq("id", slotId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const [slot] = await attachGradesToSlots(supabase, [data]);
  return slot ?? null;
}

export async function findWholeDaySlotForDate(
  supabase: SupabaseClient,
  organizationId: string,
  date: string,
): Promise<ObservationSlot | null> {
  const { data, error } = await supabase
    .from("admissions_observation_slots")
    .select("id, organization_id, date, start_time, end_time, label, created_at")
    .eq("organization_id", organizationId)
    .eq("date", date)
    .eq("start_time", ALL_DAY_TIME_SLOT)
    .is("end_time", null)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const [slot] = await attachGradesToSlots(supabase, [data]);
  return slot ?? null;
}

export async function createObservationSlot(
  supabase: SupabaseClient,
  organizationId: string,
  input: ObservationSlotInput,
): Promise<ObservationSlot> {
  const gradeValues = normalizeGradeValues(input.gradeValues);
  const endTime = input.endTime ?? null;

  const { data, error } = await supabase
    .from("admissions_observation_slots")
    .insert({
      organization_id: organizationId,
      date: input.date,
      start_time: input.startTime,
      end_time: endTime,
      label: input.label?.trim() || null,
    })
    .select("id, organization_id, date, start_time, end_time, label, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("A slot with the same date, time, and grade group already exists.");
    }
    throw error;
  }

  await replaceSlotGrades(supabase, String(data.id), gradeValues);

  return observationSlotFromRow(data, gradeValues);
}

export async function updateObservationSlot(
  supabase: SupabaseClient,
  organizationId: string,
  slotId: string,
  input: ObservationSlotInput,
): Promise<ObservationSlot> {
  const gradeValues = normalizeGradeValues(input.gradeValues);
  const endTime = input.endTime ?? null;

  const { data, error } = await supabase
    .from("admissions_observation_slots")
    .update({
      date: input.date,
      start_time: input.startTime,
      end_time: endTime,
      label: input.label?.trim() || null,
    })
    .eq("organization_id", organizationId)
    .eq("id", slotId)
    .select("id, organization_id, date, start_time, end_time, label, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("A slot with the same date, time, and grade group already exists.");
    }
    throw error;
  }

  await replaceSlotGrades(supabase, slotId, gradeValues);
  return observationSlotFromRow(data, gradeValues);
}

export async function deleteObservationSlot(
  supabase: SupabaseClient,
  organizationId: string,
  slotId: string,
): Promise<void> {
  const { data: booked, error: bookedError } = await supabase
    .from("admissions_scheduled_visit_days")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("observation_slot_id", slotId)
    .limit(1);

  if (bookedError) throw bookedError;
  if ((booked ?? []).length > 0) {
    throw new Error("This slot has a booked visit and can't be removed.");
  }

  const { data, error } = await supabase
    .from("admissions_observation_slots")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", slotId)
    .select("date, start_time, end_time")
    .maybeSingle();

  if (error) throw error;
}

export async function toggleWholeDayObservationSlot(
  supabase: SupabaseClient,
  organizationId: string,
  date: string,
  open: boolean,
): Promise<void> {
  if (open) {
    const existing = await findWholeDaySlotForDate(supabase, organizationId, date);
    if (existing) return;

    await createObservationSlot(supabase, organizationId, {
      date,
      startTime: ALL_DAY_TIME_SLOT,
      endTime: null,
      gradeValues: [],
    });
    return;
  }

  const existing = await findWholeDaySlotForDate(supabase, organizationId, date);
  if (!existing) return;
  await deleteObservationSlot(supabase, organizationId, existing.id);
}

export async function countObservationSlotsInMonth(
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

  const { count, error } = await supabase
    .from("admissions_observation_slots")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .gte("date", start)
    .lte("date", end);

  if (error) throw error;
  return count ?? 0;
}

export function extractStudentGradeFromResponses(
  responses: Record<string, unknown> | null | undefined,
): string | null {
  if (!responses) return null;
  const grade = responses.student_grade;
  if (typeof grade !== "string") return null;
  const trimmed = grade.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export const STUDENT_GRADE_FIELD_ID = 'student_grade';
