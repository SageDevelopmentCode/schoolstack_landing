import type { SupabaseClient } from '@supabase/supabase-js';

import type { AdminEnrolledStudentSummary } from '@/lib/school-admin/enrolled-students';

async function loadStudentHealthStandingFlags(
  supabase: SupabaseClient,
  organizationId: string,
  studentIds: string[],
): Promise<Set<string>> {
  if (studentIds.length === 0) return new Set();

  const { data, error } = await supabase
    .from('student_health_items')
    .select('student_id')
    .eq('organization_id', organizationId)
    .in('student_id', studentIds)
    .in('item_type', ['allergy', 'medication']);

  if (error) throw new Error(error.message);

  return new Set(
    (data ?? [])
      .map((row) => String((row as { student_id: string }).student_id))
      .filter(Boolean),
  );
}

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
