import { parseProgramParentPortalSettings } from "@/lib/admissions/program-parent-portal";
import { resolveProgramParentFeatures } from "@/lib/organization-settings/resolve-program-parent-features";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";

export type ProgramAttendanceRef = {
  id: string;
  parent_portal_settings?: unknown;
};

export function buildProgramAttendanceEnabledMap(
  orgFeatures: OrganizationFeatures,
  programs: ProgramAttendanceRef[],
): Map<string, boolean> {
  const result = new Map<string, boolean>();

  for (const program of programs) {
    const programId = String(program.id);
    const settings = parseProgramParentPortalSettings(program.parent_portal_settings);
    result.set(
      programId,
      resolveProgramParentFeatures(orgFeatures, settings).attendance,
    );
  }

  return result;
}

export function isProgramAttendanceEnabled(
  programAttendanceEnabled: Map<string, boolean>,
  programId: string,
): boolean {
  return programAttendanceEnabled.get(programId) === true;
}
