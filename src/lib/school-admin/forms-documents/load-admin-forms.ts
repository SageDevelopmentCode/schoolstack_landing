import type { SupabaseClient } from "@supabase/supabase-js";
import { formatStaffMemberName } from "@/lib/school-admin/enrolled-students";
import {
  mapTeacherParentFormRow,
  TEACHER_PARENT_FORM_SELECT,
  type TeacherParentFormRow,
} from "@/lib/school-teacher/forms-documents/db-mapper";
import {
  listFormResponsesByFormIds,
  listFormResponsesForForm,
} from "@/lib/school-teacher/forms-documents/load-teacher-forms";
import type { TeacherFormSignatureRow } from "@/lib/school-teacher/forms-documents/types";
import type { AdminParentForm } from "./types";

async function loadStaffNamesById(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberIds: string[],
): Promise<Map<string, string>> {
  if (staffMemberIds.length === 0) return new Map();

  const { data, error } = await admin
    .from("staff_members")
    .select("id, first_name, last_name, role_title")
    .eq("organization_id", organizationId)
    .in("id", staffMemberIds);

  if (error) throw error;

  const map = new Map<string, string>();
  for (const row of data ?? []) {
    const roleTitle = String(row.role_title ?? "").trim();
    const displayName =
      roleTitle === "School admin"
        ? "Admin"
        : formatStaffMemberName({
            firstName: String(row.first_name ?? ""),
            lastName: String(row.last_name ?? ""),
          });
    map.set(String(row.id), displayName);
  }
  return map;
}

function mapAdminParentForm(
  row: TeacherParentFormRow,
  staffNameById: Map<string, string>,
): AdminParentForm {
  const form = mapTeacherParentFormRow(row);
  const staffMemberId = String(row.created_by_staff_member_id);
  return {
    ...form,
    createdByStaffMemberId: staffMemberId,
    createdByName: staffNameById.get(staffMemberId) ?? "School admin",
  };
}

export async function listOrgParentForms(
  admin: SupabaseClient,
  organizationId: string,
): Promise<AdminParentForm[]> {
  const { data, error } = await admin
    .from("teacher_parent_forms")
    .select(TEACHER_PARENT_FORM_SELECT)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = (data ?? []) as TeacherParentFormRow[];
  const staffMemberIds = [...new Set(rows.map((row) => String(row.created_by_staff_member_id)))];
  const staffNameById = await loadStaffNamesById(admin, organizationId, staffMemberIds);

  return rows.map((row) => mapAdminParentForm(row, staffNameById));
}

export async function getOrgParentFormById(
  admin: SupabaseClient,
  organizationId: string,
  formId: string,
): Promise<AdminParentForm | null> {
  const { data, error } = await admin
    .from("teacher_parent_forms")
    .select(TEACHER_PARENT_FORM_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", formId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as TeacherParentFormRow;
  const staffNameById = await loadStaffNamesById(
    admin,
    organizationId,
    [String(row.created_by_staff_member_id)],
  );

  return mapAdminParentForm(row, staffNameById);
}

export async function listOrgFormResponsesForForm(
  admin: SupabaseClient,
  organizationId: string,
  formId: string,
  dueDate: string | null,
): Promise<TeacherFormSignatureRow[]> {
  return listFormResponsesForForm(admin, organizationId, formId, dueDate);
}

export async function listOrgFormResponsesByFormIds(
  admin: SupabaseClient,
  organizationId: string,
  forms: AdminParentForm[],
): Promise<Record<string, TeacherFormSignatureRow[]>> {
  return listFormResponsesByFormIds(admin, organizationId, forms);
}
