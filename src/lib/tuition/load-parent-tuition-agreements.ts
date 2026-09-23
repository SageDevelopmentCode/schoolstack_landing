import type { SupabaseClient } from "@supabase/supabase-js";
import {
  mapTeacherParentFormRow,
  resolveSignatureStatus,
  type TeacherParentFormResponseRow,
  type TeacherParentFormRow,
} from "@/lib/school-teacher/forms-documents/db-mapper";
import type { ParentFormListItem } from "@/lib/school-parent/forms-documents/types";
import { classifyParentFormListStatus } from "@/lib/school-parent/forms-documents/utils";

type ParentTuitionAgreementJoinRow = TeacherParentFormResponseRow & {
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

function mapTuitionAgreementItem(
  row: ParentTuitionAgreementJoinRow,
  studentNameById: Map<string, string>,
): ParentFormListItem | null {
  const formRow = unwrapRelation(row.teacher_parent_forms);
  if (!formRow || formRow.status !== "active" || formRow.form_category !== "tuition") {
    return null;
  }

  const form = mapTeacherParentFormRow(formRow);
  const studentIds = (row.student_ids ?? []).map(String);
  const studentNames = studentIds.map((id) => studentNameById.get(id) ?? "Student");
  const status = resolveSignatureStatus(row.status, form.dueDate);

  return {
    form,
    response: {
      id: String(row.id),
      formId: String(row.form_id),
      status,
      signedAt: row.signed_at,
      studentNames,
      responses: (row.responses ?? {}) as Record<string, unknown>,
    },
    listStatus: classifyParentFormListStatus(status),
  };
}

export async function loadParentTuitionAgreements(
  admin: SupabaseClient,
  organizationId: string,
  familyId: string,
): Promise<ParentFormListItem[]> {
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
    .eq("teacher_parent_forms.form_category", "tuition")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = (data ?? []) as ParentTuitionAgreementJoinRow[];
  const studentIds = [
    ...new Set(rows.flatMap((row) => (row.student_ids ?? []).map(String))),
  ];
  const studentNameById = await loadStudentNamesByIds(admin, organizationId, studentIds);

  const items = rows
    .map((row) => mapTuitionAgreementItem(row, studentNameById))
    .filter((item): item is ParentFormListItem => item != null);

  items.sort((a, b) => {
    if (a.listStatus !== b.listStatus) {
      return a.listStatus === "needs_action" ? -1 : 1;
    }
    const aDue = a.form.dueDate ?? "";
    const bDue = b.form.dueDate ?? "";
    if (aDue && bDue) return aDue.localeCompare(bDue);
    return b.form.createdAt.localeCompare(a.form.createdAt);
  });

  return items;
}
