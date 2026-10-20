import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getDefaultOrganizationSchoolProfile,
  getDefaultPrimaryCampus,
  parseOrganizationCampusRow,
  parseOrganizationSchoolProfile,
  type SchoolProfileBundle,
} from "./school-profile";

export async function loadSchoolProfileBundle(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<SchoolProfileBundle> {
  const { data: settingsRow, error: settingsError } = await supabase
    .from("organization_settings")
    .select("school_profile")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (settingsError) throw settingsError;

  const profile = parseOrganizationSchoolProfile(
    settingsRow?.school_profile as Record<string, unknown> | null | undefined,
  );

  const { data: campusRow, error: campusError } = await supabase
    .from("organization_campuses")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("is_primary", true)
    .maybeSingle();

  if (campusError) throw campusError;

  const primaryCampus = campusRow
    ? parseOrganizationCampusRow(
        organizationId,
        campusRow as Record<string, unknown>,
      )
    : getDefaultPrimaryCampus(organizationId);

  if (!settingsRow && !campusRow) {
    return {
      profile: getDefaultOrganizationSchoolProfile(),
      primaryCampus,
    };
  }

  return { profile, primaryCampus };
}
