import type { SupabaseClient } from "@supabase/supabase-js";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";
import {
  familyHasEnrolledAccessInProgram,
  userHasAccessForProgramPortal,
} from "@/lib/admissions/program-parent-portal-access";
import {
  listProgramCoopFamilies,
  type ProgramCoopFamily,
} from "@/lib/admissions/program-coop-directory";
import type { CoopFamilyNameMap } from "@/lib/admissions/program-coop-family-assignment-helpers";

export type { CoopFamilyNameMap } from "@/lib/admissions/program-coop-family-assignment-helpers";
export {
  canAddCoopAssignedFamily,
  formatCoopAssignedFamilyLabels,
  isCoopFamilyAssigned,
} from "@/lib/admissions/program-coop-family-assignment-helpers";

export async function buildProgramCoopFamilyNameMap(
  supabase: SupabaseClient,
  organizationId: string,
  programId: string,
): Promise<CoopFamilyNameMap> {
  const families = await listProgramCoopFamilies(supabase, {
    organizationId,
    programId,
    currentFamilyId: "",
  });
  return new Map(families.map((family) => [family.familyId, family.familyName]));
}

export async function listProgramCoopEnrolledFamilies(
  supabase: SupabaseClient,
  organizationId: string,
  programId: string,
): Promise<ProgramCoopFamily[]> {
  return listProgramCoopFamilies(supabase, {
    organizationId,
    programId,
    currentFamilyId: "",
  });
}

export async function assertCoopProgramPortalAccess(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
  programId: string,
): Promise<void> {
  const hasAccess = await userHasAccessForProgramPortal(
    supabase,
    userId,
    organizationId,
    programId,
  );
  if (!hasAccess) {
    throw new Error("You do not have access to this program.");
  }

  const familyIds = await getFamilyIdsForUser(supabase, userId, organizationId);
  if (familyIds.length === 0) {
    throw new Error("No family found for this account.");
  }
}

export async function resolveEnrolledFamilyIdForProgram(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
  programId: string,
): Promise<string> {
  await assertCoopProgramPortalAccess(supabase, userId, organizationId, programId);

  const familyIds = await getFamilyIdsForUser(supabase, userId, organizationId);
  const enrolledFamilyIds: string[] = [];

  for (const familyId of familyIds) {
    const enrolled = await familyHasEnrolledAccessInProgram(
      supabase,
      organizationId,
      familyId,
      programId,
    );
    if (enrolled) {
      enrolledFamilyIds.push(familyId);
    }
  }

  if (enrolledFamilyIds.length === 0) {
    throw new Error("No enrolled family found for this program.");
  }

  if (enrolledFamilyIds.length > 1) {
    throw new Error(
      "Multiple families are enrolled in this program. Contact your school for help.",
    );
  }

  return enrolledFamilyIds[0]!;
}

export async function resolveEnrolledFamilyForProgram(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
  programId: string,
): Promise<{ familyId: string; familyName: string }> {
  const familyId = await resolveEnrolledFamilyIdForProgram(
    supabase,
    userId,
    organizationId,
    programId,
  );
  const nameMap = await buildProgramCoopFamilyNameMap(
    supabase,
    organizationId,
    programId,
  );
  return {
    familyId,
    familyName: nameMap.get(familyId) ?? "Family",
  };
}
