import type { SupabaseClient, User } from "@supabase/supabase-js";
import { mergeFeatures } from "@/lib/organization-settings/merge";
import { isTeacherFeatureEnabled } from "@/lib/organization-settings/teacher-routes";
import { TeacherPortalAuthError } from "@/lib/staff/teacher-portal-access";
import { requireTeacherPortalUser } from "@/lib/staff/teacher-portal-access-server";

export { TeacherPortalAuthError };

async function loadTeacherMyHoursFeatures(
  supabase: SupabaseClient,
  organizationId: string,
) {
  const { data, error } = await supabase
    .from("organization_settings_public")
    .select("features")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mergeFeatures(
    data.features as Record<string, unknown> | null | undefined,
  );
}

export async function requireTeacherMyHoursAccess(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<User> {
  const user = await requireTeacherPortalUser(supabase, organizationId);

  const features = await loadTeacherMyHoursFeatures(supabase, organizationId);
  if (!features) {
    throw new TeacherPortalAuthError(
      "School not found.",
      "forbidden",
      403,
    );
  }

  if (!isTeacherFeatureEnabled(features, "my_hours")) {
    throw new TeacherPortalAuthError(
      "My Hours is not enabled for this school.",
      "forbidden",
      403,
    );
  }

  return user;
}
