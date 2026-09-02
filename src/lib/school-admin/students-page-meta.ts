import type { SupabaseClient } from "@supabase/supabase-js";
import {
  deriveStudentRosterMetrics,
  type StudentRosterMetrics,
} from "@/lib/school-admin/admin-student-roster-metrics";
import {
  listOrgEnrolledStudents,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";

export type StudentsProgramOption = {
  name: string;
};

export type StudentsPageMeta = StudentRosterMetrics;

type AdminStudentsPageMetaRow = {
  total_count?: number | string | null;
  unassigned_count?: number | string | null;
  new_enrollment_count?: number | string | null;
  program_count?: number | string | null;
  program_options?: { name?: string | null }[] | null;
};

function parseProgramOptions(value: unknown): [string, string][] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const name = String((entry as { name?: string }).name ?? "").trim();
      if (!name) return null;
      return [name, name] as [string, string];
    })
    .filter((option): option is [string, string] => option != null)
    .sort((left, right) => left[0].localeCompare(right[0]));
}

export function parseAdminStudentsPageMetaRow(
  row: AdminStudentsPageMetaRow | null,
): StudentsPageMeta | null {
  if (!row) return null;

  return {
    totalCount: Number(row.total_count ?? 0),
    unassignedCount: Number(row.unassigned_count ?? 0),
    newEnrollmentCount: Number(row.new_enrollment_count ?? 0),
    programCount: Number(row.program_count ?? 0),
    programOptions: parseProgramOptions(row.program_options),
  };
}

export async function fetchStudentsPageMetaFromRpc(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<StudentsPageMeta | null> {
  const { data, error } = await supabase.rpc("admin_students_page_meta", {
    p_organization_id: organizationId,
  });

  if (error) return null;

  return parseAdminStudentsPageMetaRow(
    (data ?? null) as AdminStudentsPageMetaRow | null,
  );
}

async function fetchStudentsPageMetaFallback(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<StudentsPageMeta> {
  const students = await listOrgEnrolledStudents(supabase, organizationId);
  return deriveStudentRosterMetrics(students);
}

export async function fetchStudentsPageMeta(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<StudentsPageMeta> {
  const fromRpc = await fetchStudentsPageMetaFromRpc(supabase, organizationId);
  if (fromRpc) return fromRpc;

  return fetchStudentsPageMetaFallback(supabase, organizationId);
}

export function studentsPageMetaFromStudents(
  students: AdminEnrolledStudentSummary[],
): StudentsPageMeta {
  return deriveStudentRosterMetrics(students);
}
