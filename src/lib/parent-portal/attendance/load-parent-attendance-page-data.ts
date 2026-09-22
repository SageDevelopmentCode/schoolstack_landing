import type { SupabaseClient } from "@supabase/supabase-js";
import type { FamilyChildOverview } from "@/lib/admissions/parent-portal-access";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";
import { filterAttendanceChildren } from "./filter-attendance-children";
import { loadProgramAttendanceEnabledMapForOrg } from "./load-program-attendance-enabled";

export async function loadParentAttendanceEligibleChildren(
  admin: SupabaseClient,
  organizationId: string,
  orgFeatures: OrganizationFeatures,
  familyChildren: FamilyChildOverview[],
): Promise<FamilyChildOverview[]> {
  const programAttendanceEnabled = await loadProgramAttendanceEnabledMapForOrg(
    admin,
    organizationId,
    orgFeatures,
  );

  return filterAttendanceChildren(familyChildren, programAttendanceEnabled);
}
