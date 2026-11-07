import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getStudentIdsForFamilies } from "@/lib/admissions/family-students";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";
import {
  familyHasMainPortalEnrollment,
  listEnrolledProgramsForStudentIds,
  type EnrolledProgramPortalSummary,
} from "@/lib/admissions/program-parent-portal-access";
import {
  getFamilyUserProfile,
  type FamilyUserProfile,
} from "@/lib/admissions/parent-portal-access";

async function userHasAnyEnrolledEnrollment(
  supabase: SupabaseClient,
  organizationId: string,
  studentIds: string[],
): Promise<boolean> {
  if (studentIds.length === 0) return false;

  const { data, error } = await supabase
    .from("enrollments")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("status", "enrolled")
    .in("student_id", studentIds)
    .limit(1);

  if (error) throw error;
  return (data ?? []).length > 0;
}

export type ResolvedParentPortalHomeAccess = {
  familyIds: string[];
  familyId: string | undefined;
  studentIds: string[];
  hasEnrolledAccess: boolean;
  hasMainPortalEnrollment: boolean;
  enrolledPrograms: EnrolledProgramPortalSummary[];
  userProfile: FamilyUserProfile;
};

export function userHasProgramEnrollment(
  enrolledPrograms: EnrolledProgramPortalSummary[],
  programId: string,
): boolean {
  return enrolledPrograms.some((program) => program.id === programId);
}

export async function resolveParentPortalHomeAccess(input: {
  supabase: SupabaseClient;
  userId: string;
  organizationId: string;
  user: User;
}): Promise<ResolvedParentPortalHomeAccess> {
  const familyIds = await getFamilyIdsForUser(
    input.supabase,
    input.userId,
    input.organizationId,
  );
  const studentIds = await getStudentIdsForFamilies(
    input.supabase,
    input.organizationId,
    familyIds,
  );

  const [hasEnrolledAccess, enrolledPrograms, userProfile] = await Promise.all([
    userHasAnyEnrolledEnrollment(input.supabase, input.organizationId, studentIds),
    listEnrolledProgramsForStudentIds(
      input.supabase,
      input.organizationId,
      studentIds,
    ),
    getFamilyUserProfile(
      input.supabase,
      input.userId,
      input.organizationId,
      input.user,
    ),
  ]);

  return {
    familyIds,
    familyId: familyIds[0],
    studentIds,
    hasEnrolledAccess,
    hasMainPortalEnrollment: familyHasMainPortalEnrollment(enrolledPrograms),
    enrolledPrograms,
    userProfile,
  };
}
