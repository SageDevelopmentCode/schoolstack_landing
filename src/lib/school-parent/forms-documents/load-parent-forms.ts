import type { SupabaseClient } from "@supabase/supabase-js";
import {
  mapTeacherParentFormRow,
  resolveSignatureStatus,
  type TeacherParentFormResponseRow,
  type TeacherParentFormRow,
} from "@/lib/school-teacher/forms-documents/db-mapper";
import type {
  ParentFormDetail,
  ParentFormListItem,
  ParentFormResponseSummary,
  ParentFormsDocumentsPageBundle,
} from "./types";
import { classifyParentFormListStatus } from "./utils";

type ParentFormResponseJoinRow = TeacherParentFormResponseRow & {
  teacher_parent_forms: TeacherParentFormRow | TeacherParentFormRow[] | null;
};

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

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
    const name = [student.first_name, student.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
    map.set(String(student.id), name || "Student");
  }
  return map;
}

function mapParentFormResponseSummary(
  row: TeacherParentFormResponseRow,
  dueDate: string | null,
  studentNameById: Map<string, string>,
): ParentFormResponseSummary {
  const studentIds = (row.student_ids ?? []).map(String);
  const studentNames = studentIds.map((id) => studentNameById.get(id) ?? "Student");

  return {
    id: String(row.id),
    formId: String(row.form_id),
    status: resolveSignatureStatus(row.status, dueDate),
    signedAt: row.signed_at,
    studentNames,
    responses: (row.responses ?? {}) as Record<string, unknown>,
  };
}

function mapParentFormListItem(
  row: ParentFormResponseJoinRow,
  studentNameById: Map<string, string>,
): ParentFormListItem | null {
  const formRow = unwrapRelation(row.teacher_parent_forms);
  if (!formRow || formRow.status !== "active") return null;

  const form = mapTeacherParentFormRow(formRow);
  const response = mapParentFormResponseSummary(row, form.dueDate, studentNameById);

  return {
    form,
    response,
    listStatus: classifyParentFormListStatus(response.status),
  };
}

export async function loadParentFormsDocumentsPageBundle(
  admin: SupabaseClient,
  organizationId: string,
  familyId: string,
): Promise<ParentFormsDocumentsPageBundle> {
  const { data, error } = await admin
    .from("teacher_parent_form_responses")
    .select(
      `
      *,
      teacher_parent_forms!inner (*)
    `,
    )
    .eq("organization_id", organizationId)
    .eq("family_id", familyId)
    .eq("teacher_parent_forms.status", "active")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = (data ?? []) as ParentFormResponseJoinRow[];
  const studentIds = [
    ...new Set(rows.flatMap((row) => (row.student_ids ?? []).map(String))),
  ];
  const studentNameById = await loadStudentNamesByIds(
    admin,
    organizationId,
    studentIds,
  );

  const items = rows
    .map((row) => mapParentFormListItem(row, studentNameById))
    .filter((item): item is ParentFormListItem => item != null);

  items.sort((a, b) => {
    const aDue = a.form.dueDate ?? "";
    const bDue = b.form.dueDate ?? "";
    if (a.listStatus !== b.listStatus) {
      return a.listStatus === "needs_action" ? -1 : 1;
    }
    if (aDue && bDue) return aDue.localeCompare(bDue);
    return b.form.createdAt.localeCompare(a.form.createdAt);
  });

  return { items };
}

export async function getParentFormDetail(
  admin: SupabaseClient,
  organizationId: string,
  familyId: string,
  formId: string,
): Promise<ParentFormDetail | null> {
  const { data, error } = await admin
    .from("teacher_parent_form_responses")
    .select(
      `
      *,
      teacher_parent_forms!inner (*)
    `,
    )
    .eq("organization_id", organizationId)
    .eq("family_id", familyId)
    .eq("form_id", formId)
    .eq("teacher_parent_forms.status", "active")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as ParentFormResponseJoinRow;
  const studentIds = (row.student_ids ?? []).map(String);
  const studentNameById = await loadStudentNamesByIds(
    admin,
    organizationId,
    studentIds,
  );
  const item = mapParentFormListItem(row, studentNameById);
  if (!item) return null;

  return {
    form: item.form,
    response: item.response,
  };
}

export async function assertParentFormAccess(
  admin: SupabaseClient,
  organizationId: string,
  familyId: string,
  formId: string,
): Promise<ParentFormDetail> {
  const detail = await getParentFormDetail(admin, organizationId, familyId, formId);
  if (!detail) {
    throw new Error("Form not found.");
  }
  return detail;
}
