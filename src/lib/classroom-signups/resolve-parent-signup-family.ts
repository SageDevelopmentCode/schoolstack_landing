import type { SupabaseClient } from "@supabase/supabase-js";
import { getParentVisibleClassroomSignup } from "./load-parent-signups";
import { getFamilyClassroomSignupResponse } from "./load-teacher-signups";
import type { ClassroomSignup } from "./types";

export type ParentClassroomSignupContext = {
  familyId: string;
  signup: ClassroomSignup;
};

/**
 * Returns the student's family when the student belongs to one of the caller's
 * authorized families (including linked logins).
 */
export async function resolveAuthorizedFamilyIdForStudent(
  admin: SupabaseClient,
  organizationId: string,
  authorizedFamilyIds: string[],
  studentId: string,
): Promise<string | null> {
  if (authorizedFamilyIds.length === 0) return null;

  const { data: studentRow, error: studentError } = await admin
    .from("students")
    .select("family_id")
    .eq("id", studentId)
    .eq("organization_id", organizationId)
    .in("family_id", authorizedFamilyIds)
    .maybeSingle();

  if (studentError) throw studentError;
  if (!studentRow?.family_id) return null;
  return String(studentRow.family_id);
}

/**
 * Picks the family + signup to use when a parent loads signup detail.
 * Priority: explicit student → any confirmed response among authorized families →
 * first family for which the signup is visible.
 */
export async function resolveParentClassroomSignupContext(
  admin: SupabaseClient,
  organizationId: string,
  authorizedFamilyIds: string[],
  signupId: string,
  studentId: string | null,
): Promise<ParentClassroomSignupContext | null> {
  if (authorizedFamilyIds.length === 0) return null;

  const trimmedStudentId = studentId?.trim() ?? "";
  if (trimmedStudentId) {
    const familyId = await resolveAuthorizedFamilyIdForStudent(
      admin,
      organizationId,
      authorizedFamilyIds,
      trimmedStudentId,
    );
    if (!familyId) return null;

    const signup = await getParentVisibleClassroomSignup(
      admin,
      organizationId,
      familyId,
      signupId,
    );
    if (!signup) return null;
    return { familyId, signup };
  }

  const familyResponses = await Promise.all(
    authorizedFamilyIds.map(async (familyId) => ({
      familyId,
      response: await getFamilyClassroomSignupResponse(
        admin,
        organizationId,
        signupId,
        familyId,
      ),
    })),
  );

  const confirmed = familyResponses.find(
    (entry) => entry.response?.status === "confirmed",
  );
  if (confirmed) {
    const signup = await getParentVisibleClassroomSignup(
      admin,
      organizationId,
      confirmed.familyId,
      signupId,
    );
    if (signup) {
      return { familyId: confirmed.familyId, signup };
    }
  }

  for (const familyId of authorizedFamilyIds) {
    const signup = await getParentVisibleClassroomSignup(
      admin,
      organizationId,
      familyId,
      signupId,
    );
    if (signup) {
      return { familyId, signup };
    }
  }

  return null;
}
