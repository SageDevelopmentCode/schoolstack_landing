import type { SupabaseClient } from '@supabase/supabase-js';

export type ParentMobileGateCopy = {
  title: string;
  body: string;
  ctaLabel: string;
};

async function getFamilyIdsForUser(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from('guardians')
    .select('family_id')
    .eq('user_id', userId)
    .eq('organization_id', organizationId);

  if (error) throw error;
  return (data ?? []).map((row) => String(row.family_id));
}

async function getStudentIdsForFamilies(
  supabase: SupabaseClient,
  organizationId: string,
  familyIds: string[],
): Promise<string[]> {
  if (familyIds.length === 0) return [];

  const { data, error } = await supabase
    .from('students')
    .select('id')
    .eq('organization_id', organizationId)
    .in('family_id', familyIds);

  if (error) throw error;
  return (data ?? []).map((row) => String(row.id));
}

export async function userHasEnrolledAccess(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const familyIds = await getFamilyIdsForUser(supabase, userId, organizationId);
  const studentIds = await getStudentIdsForFamilies(supabase, organizationId, familyIds);

  if (studentIds.length === 0) return false;

  const { data, error } = await supabase
    .from('enrollments')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('status', 'enrolled')
    .in('student_id', studentIds)
    .limit(1);

  if (error) throw error;
  return (data ?? []).length > 0;
}

async function familyHasEnrollingApplication(
  supabase: SupabaseClient,
  organizationId: string,
  familyIds: string[],
): Promise<boolean> {
  if (familyIds.length === 0) return false;

  const { data, error } = await supabase
    .from('applications')
    .select('id')
    .eq('organization_id', organizationId)
    .in('family_id', familyIds)
    .eq('status', 'enrolling')
    .limit(1);

  if (error) throw error;
  return (data ?? []).length > 0;
}

export async function getParentMobileGateCopy(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
  schoolName: string,
): Promise<ParentMobileGateCopy> {
  const familyIds = await getFamilyIdsForUser(supabase, userId, organizationId);
  const isEnrolling = await familyHasEnrollingApplication(supabase, organizationId, familyIds);

  if (isEnrolling) {
    return {
      title: 'Continue on the web',
      body: `The ${schoolName} mobile app is available once your family is enrolled. Please finish your enrollment checklist in your browser to continue.`,
      ctaLabel: 'Continue enrollment',
    };
  }

  return {
    title: 'Continue on the web',
    body: `The ${schoolName} mobile app is available once your family is enrolled. Please finish your application or enrollment in your browser to continue.`,
    ctaLabel: 'Continue application',
  };
}
