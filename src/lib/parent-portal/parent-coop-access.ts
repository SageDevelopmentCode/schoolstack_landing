import { isProgramParentPortalCoopMode } from "@/lib/admissions/program-parent-portal";
import type { CoopFamilyNameMap } from "@/lib/admissions/program-coop-family-assignment-helpers";
import type { ProgramCoopFamily } from "@/lib/admissions/program-coop-directory";
import type { ParentPortalAccess } from "@/lib/parent-portal/parent-portal-access-rpc";

/**
 * Pure helpers for the parent coop loaders: they read the route's `parent_portal_access` snapshot
 * instead of re-querying programs, guardians and enrollments.
 */

/** Throws `coop_not_enabled` unless the program is in the snapshot and runs in coop mode. */
export function assertCoopProgramInAccess(
  access: Pick<ParentPortalAccess, "enrolledPrograms">,
  programId: string,
): void {
  const settings = access.enrolledPrograms.find(
    (program) => program.id === programId,
  )?.parent_portal_settings;
  if (!settings || !isProgramParentPortalCoopMode(settings)) {
    throw new Error("coop_not_enabled");
  }
}

/**
 * Builds the program's family name map from one `listProgramCoopFamilies` result and picks the
 * signed-in parent's family by intersecting it with the snapshot's family ids (which span every
 * linked login). Same errors as `resolveEnrolledFamilyIdForProgram`.
 */
export function resolveCoopFamilyFromAccess(
  families: Pick<ProgramCoopFamily, "familyId" | "familyName">[],
  accessFamilyIds: string[],
): { familyId: string; familyName: string; familyNameMap: CoopFamilyNameMap } {
  const familyNameMap: CoopFamilyNameMap = new Map(
    families.map((family) => [family.familyId, family.familyName]),
  );
  const enrolledFamilyIds = accessFamilyIds.filter((familyId) => familyNameMap.has(familyId));

  if (enrolledFamilyIds.length === 0) {
    throw new Error("No enrolled family found for this program.");
  }

  if (enrolledFamilyIds.length > 1) {
    throw new Error(
      "Multiple families are enrolled in this program. Contact your school for help.",
    );
  }

  const familyId = enrolledFamilyIds[0]!;
  return {
    familyId,
    familyName: familyNameMap.get(familyId) ?? "Family",
    familyNameMap,
  };
}
