import type { SupabaseClient } from "@supabase/supabase-js";
import {
  campusToDatabaseRow,
  parseOrganizationCampusRow,
  type SchoolProfilePatch,
} from "./school-profile";

export async function saveSchoolProfileBundle(
  supabase: SupabaseClient,
  organizationId: string,
  patch: SchoolProfilePatch,
): Promise<SchoolProfilePatch> {
  const { data: existingSettings, error: settingsLookupError } = await supabase
    .from("organization_settings")
    .select("organization_id")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (settingsLookupError) throw settingsLookupError;

  if (existingSettings) {
    const { error: updateSettingsError } = await supabase
      .from("organization_settings")
      .update({ school_profile: patch.profile })
      .eq("organization_id", organizationId);

    if (updateSettingsError) throw updateSettingsError;
  } else {
    const { error: insertSettingsError } = await supabase
      .from("organization_settings")
      .insert({
        organization_id: organizationId,
        school_profile: patch.profile,
      });

    if (insertSettingsError) throw insertSettingsError;
  }

  const campusPayload = campusToDatabaseRow({
    ...patch.primaryCampus,
    organization_id: organizationId,
    is_primary: true,
  });

  let campusId = patch.primaryCampus.id?.trim() || null;

  if (!campusId) {
    const { data: existingPrimary, error: primaryLookupError } = await supabase
      .from("organization_campuses")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("is_primary", true)
      .maybeSingle();

    if (primaryLookupError) throw primaryLookupError;
    campusId =
      typeof existingPrimary?.id === "string" ? existingPrimary.id : null;
  }

  if (campusId) {
    const { data: updated, error: updateCampusError } = await supabase
      .from("organization_campuses")
      .update(campusPayload)
      .eq("id", campusId)
      .eq("organization_id", organizationId)
      .select("*")
      .single();

    if (updateCampusError) throw updateCampusError;

    return {
      profile: patch.profile,
      primaryCampus: parseOrganizationCampusRow(
        organizationId,
        updated as Record<string, unknown>,
      ),
    };
  }

  const { data: inserted, error: insertCampusError } = await supabase
    .from("organization_campuses")
    .insert(campusPayload)
    .select("*")
    .single();

  if (insertCampusError) throw insertCampusError;

  return {
    profile: patch.profile,
    primaryCampus: parseOrganizationCampusRow(
      organizationId,
      inserted as Record<string, unknown>,
    ),
  };
}
