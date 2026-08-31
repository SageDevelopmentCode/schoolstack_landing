import type { AdminEnrolledStudentSummary } from "@/lib/school-admin/enrolled-students";
import { loadStudentHealthStandingFlags } from "@/lib/student-health/load-student-health-profile";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function mergeStudentStandingHealthFlags(
  supabase: SupabaseClient,
  organizationId: string,
  students: AdminEnrolledStudentSummary[],
): Promise<AdminEnrolledStudentSummary[]> {
  const flags = await loadStudentHealthStandingFlags(
    supabase,
    organizationId,
    students.map((student) => student.id),
  );

  return students.map((student) => ({
    ...student,
    hasStandingHealthItems: flags.has(student.id),
  }));
}
