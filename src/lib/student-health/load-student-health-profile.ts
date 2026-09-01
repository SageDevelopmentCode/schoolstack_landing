import type { SupabaseClient } from "@supabase/supabase-js";
import { buildStudentHealthProfile } from "@/lib/student-health/map-row";
import type { StudentHealthItemRow, StudentHealthProfile } from "@/lib/student-health/types";
import { emptyStudentHealthProfile } from "@/lib/student-health/types";

export async function loadStudentHealthProfile(
  supabase: SupabaseClient,
  organizationId: string,
  studentId: string,
): Promise<StudentHealthProfile> {
  const { data, error } = await supabase
    .from("student_health_items")
    .select(
      "id, organization_id, student_id, item_type, payload, start_date, end_date, ongoing, created_by_user_id, created_by_guardian_id, created_at, updated_at",
    )
    .eq("organization_id", organizationId)
    .eq("student_id", studentId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);

  return buildStudentHealthProfile((data ?? []) as StudentHealthItemRow[]);
}

export async function loadStudentHealthProfilesForStudents(
  supabase: SupabaseClient,
  organizationId: string,
  studentIds: string[],
): Promise<Record<string, StudentHealthProfile>> {
  if (studentIds.length === 0) return {};

  const { data, error } = await supabase
    .from("student_health_items")
    .select(
      "id, organization_id, student_id, item_type, payload, start_date, end_date, ongoing, created_by_user_id, created_by_guardian_id, created_at, updated_at",
    )
    .eq("organization_id", organizationId)
    .in("student_id", studentIds)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);

  const byStudent = new Map<string, StudentHealthItemRow[]>();
  for (const row of (data ?? []) as StudentHealthItemRow[]) {
    const existing = byStudent.get(row.student_id) ?? [];
    existing.push(row);
    byStudent.set(row.student_id, existing);
  }

  const profiles: Record<string, StudentHealthProfile> = {};
  for (const studentId of studentIds) {
    profiles[studentId] = buildStudentHealthProfile(byStudent.get(studentId) ?? []);
  }

  return profiles;
}

export async function loadStudentHealthStandingFlags(
  supabase: SupabaseClient,
  organizationId: string,
  studentIds: string[],
): Promise<Set<string>> {
  if (studentIds.length === 0) return new Set();

  const { data, error } = await supabase
    .from("student_health_items")
    .select("student_id")
    .eq("organization_id", organizationId)
    .in("student_id", studentIds)
    .in("item_type", ["allergy", "medication"]);

  if (error) throw new Error(error.message);

  return new Set(
    (data ?? [])
      .map((row) => String((row as { student_id: string }).student_id))
      .filter(Boolean),
  );
}

export { emptyStudentHealthProfile };
