import type { SupabaseClient } from "@supabase/supabase-js";
import {
  allergyPayload,
  mapStudentHealthItemRow,
  medicationPayload,
  updatePayload,
} from "@/lib/student-health/map-row";
import type {
  HealthAllergyItem,
  HealthItemInput,
  HealthMedicationItem,
  HealthUpdateItem,
  StudentHealthItemRow,
} from "@/lib/student-health/types";

type MutationContext = {
  organizationId: string;
  studentId: string;
  userId: string;
  guardianId: string | null;
};

function rowDates(input: HealthItemInput): {
  start_date: string | null;
  end_date: string | null;
  ongoing: boolean;
} {
  if (input.itemType === "allergy") {
    return { start_date: null, end_date: null, ongoing: false };
  }
  if (input.itemType === "medication") {
    return {
      start_date: input.values.startDate,
      end_date: input.values.ongoing ? null : input.values.endDate,
      ongoing: input.values.ongoing,
    };
  }
  return {
    start_date: input.values.startDate,
    end_date: input.values.endDate,
    ongoing: false,
  };
}

function rowPayload(input: HealthItemInput): Record<string, unknown> {
  if (input.itemType === "allergy") {
    return allergyPayload(input.values);
  }
  if (input.itemType === "medication") {
    return medicationPayload(input.values);
  }
  return updatePayload(input.values);
}

export async function createStudentHealthItem(
  supabase: SupabaseClient,
  context: MutationContext,
  input: HealthItemInput,
): Promise<HealthAllergyItem | HealthMedicationItem | HealthUpdateItem> {
  const dates = rowDates(input);
  const { data, error } = await supabase
    .from("student_health_items")
    .insert({
      organization_id: context.organizationId,
      student_id: context.studentId,
      item_type: input.itemType,
      payload: rowPayload(input),
      start_date: dates.start_date,
      end_date: dates.end_date,
      ongoing: dates.ongoing,
      created_by_user_id: context.userId,
      created_by_guardian_id: context.guardianId,
    })
    .select(
      "id, organization_id, student_id, item_type, payload, start_date, end_date, ongoing, created_by_user_id, created_by_guardian_id, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create health item.");
  }

  return mapStudentHealthItemRow(data as StudentHealthItemRow);
}

export async function updateStudentHealthItem(
  supabase: SupabaseClient,
  context: MutationContext,
  itemId: string,
  input: HealthItemInput,
): Promise<HealthAllergyItem | HealthMedicationItem | HealthUpdateItem> {
  const dates = rowDates(input);
  const { data, error } = await supabase
    .from("student_health_items")
    .update({
      item_type: input.itemType,
      payload: rowPayload(input),
      start_date: dates.start_date,
      end_date: dates.end_date,
      ongoing: dates.ongoing,
    })
    .eq("id", itemId)
    .eq("organization_id", context.organizationId)
    .eq("student_id", context.studentId)
    .select(
      "id, organization_id, student_id, item_type, payload, start_date, end_date, ongoing, created_by_user_id, created_by_guardian_id, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update health item.");
  }

  return mapStudentHealthItemRow(data as StudentHealthItemRow);
}

export async function deleteStudentHealthItem(
  supabase: SupabaseClient,
  organizationId: string,
  studentId: string,
  itemId: string,
): Promise<StudentHealthItemRow> {
  const { data, error } = await supabase
    .from("student_health_items")
    .delete()
    .eq("id", itemId)
    .eq("organization_id", organizationId)
    .eq("student_id", studentId)
    .select(
      "id, organization_id, student_id, item_type, payload, start_date, end_date, ongoing, created_by_user_id, created_by_guardian_id, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to delete health item.");
  }

  return data as StudentHealthItemRow;
}

export async function getStudentDisplayName(
  supabase: SupabaseClient,
  organizationId: string,
  studentId: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("students")
    .select("first_name, last_name")
    .eq("id", studentId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return "Student";

  return [data.first_name, data.last_name].filter(Boolean).join(" ").trim() || "Student";
}
