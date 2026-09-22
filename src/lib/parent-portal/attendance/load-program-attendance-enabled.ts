import type { SupabaseClient } from "@supabase/supabase-js";
import { buildProgramAttendanceEnabledMap } from "@/lib/school-admin/attendance/program-attendance-enabled";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";

export async function loadProgramAttendanceEnabledMapForOrg(
  admin: SupabaseClient,
  organizationId: string,
  orgFeatures: OrganizationFeatures,
): Promise<Map<string, boolean>> {
  const { data, error } = await admin
    .from("programs")
    .select("id, parent_portal_settings")
    .eq("organization_id", organizationId);

  if (error) throw error;

  return buildProgramAttendanceEnabledMap(orgFeatures, data ?? []);
}
