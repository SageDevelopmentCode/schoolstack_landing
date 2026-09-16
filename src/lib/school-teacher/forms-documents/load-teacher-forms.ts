import type { SupabaseClient } from "@supabase/supabase-js";
import {
  mapTeacherParentFormResponseRow,
  mapTeacherParentFormRow,
  TEACHER_PARENT_FORM_RESPONSE_SELECT,
  TEACHER_PARENT_FORM_SELECT,
  type TeacherParentFormResponseRow,
  type TeacherParentFormRow,
} from "./db-mapper";
import type { TeacherFormSignatureRow, TeacherParentForm } from "./types";

async function loadStudentNamesByIds(
  admin: SupabaseClient,
  organizationId: string,
  studentIds: string[],
): Promise<Map<string, string>> {
  if (studentIds.length === 0) return new Map();

  const { data, error } = await admin
    .from("students")
    .select("id, first_name, last_name")
    .eq("organization_id", organizationId)
    .in("id", studentIds);

  if (error) throw error;

  const map = new Map<string, string>();
  for (const student of data ?? []) {
    const name = [student.first_name, student.last_name].filter(Boolean).join(" ").trim();
    map.set(String(student.id), name || "Student");
  }
  return map;
}

function mapResponseRowWithStudents(
  row: TeacherParentFormResponseRow,
  dueDate: string | null,
  studentNameById: Map<string, string>,
): TeacherFormSignatureRow {
  const mapped = mapTeacherParentFormResponseRow(row, dueDate);
  const studentIds = (row.student_ids ?? []).map(String);
  if (studentIds.length === 0) return mapped;

  return {
    ...mapped,
    studentNames: studentIds.map((id) => studentNameById.get(id) ?? "Student"),
  };
}

export async function listTeacherParentForms(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
): Promise<TeacherParentForm[]> {
  const { data, error } = await admin
    .from("teacher_parent_forms")
    .select(TEACHER_PARENT_FORM_SELECT)
    .eq("organization_id", organizationId)
    .eq("created_by_staff_member_id", staffMemberId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as TeacherParentFormRow[]).map(mapTeacherParentFormRow);
}

export async function getTeacherParentFormById(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  formId: string,
): Promise<TeacherParentForm | null> {
  const { data, error } = await admin
    .from("teacher_parent_forms")
    .select(TEACHER_PARENT_FORM_SELECT)
    .eq("organization_id", organizationId)
    .eq("created_by_staff_member_id", staffMemberId)
    .eq("id", formId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapTeacherParentFormRow(data as TeacherParentFormRow);
}

export async function listFormResponsesForForm(
  admin: SupabaseClient,
  organizationId: string,
  formId: string,
  dueDate: string | null,
): Promise<TeacherFormSignatureRow[]> {
  const { data, error } = await admin
    .from("teacher_parent_form_responses")
    .select(TEACHER_PARENT_FORM_RESPONSE_SELECT)
    .eq("organization_id", organizationId)
    .eq("form_id", formId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as TeacherParentFormResponseRow[];
  const allStudentIds = [
    ...new Set(rows.flatMap((row) => (row.student_ids ?? []).map(String))),
  ];
  const studentNameById = await loadStudentNamesByIds(
    admin,
    organizationId,
    allStudentIds,
  );

  return rows.map((row) =>
    mapResponseRowWithStudents(row, dueDate, studentNameById),
  );
}

export async function listFormResponsesByFormIds(
  admin: SupabaseClient,
  organizationId: string,
  forms: TeacherParentForm[],
): Promise<Record<string, TeacherFormSignatureRow[]>> {
  const formIds = forms.map((form) => form.id);
  if (formIds.length === 0) return {};

  const { data, error } = await admin
    .from("teacher_parent_form_responses")
    .select(TEACHER_PARENT_FORM_RESPONSE_SELECT)
    .eq("organization_id", organizationId)
    .in("form_id", formIds)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as TeacherParentFormResponseRow[];
  const allStudentIds = [
    ...new Set(rows.flatMap((row) => (row.student_ids ?? []).map(String))),
  ];
  const studentNameById = await loadStudentNamesByIds(
    admin,
    organizationId,
    allStudentIds,
  );

  const dueDateByFormId = new Map(forms.map((form) => [form.id, form.dueDate]));
  const result: Record<string, TeacherFormSignatureRow[]> = {};

  for (const row of rows) {
    const formId = String(row.form_id);
    const dueDate = dueDateByFormId.get(formId) ?? null;
    const mapped = mapResponseRowWithStudents(row, dueDate, studentNameById);
    if (!result[formId]) result[formId] = [];
    result[formId].push(mapped);
  }

  return result;
}
