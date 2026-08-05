import type { SupabaseClient } from "@supabase/supabase-js";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { fetchOrganizationWithSettingsUncached } from "@/lib/organization-settings/fetch";
import { getParentPortalHomeHref } from "@/lib/organization-settings/parent-nav";
import { isParentPortalEnabled } from "@/lib/organization-settings/parent-routes";
import { userCanAccessSchoolAdmin } from "@/lib/school-admin/access";
import type { SchoolPortalOption } from "@/lib/auth/portal-switcher-types";

export async function userHasFamilyPortalAccess(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const familyIds = await getFamilyIdsForUser(supabase, userId, organizationId);
  if (familyIds.length > 0) {
    return true;
  }

  const { data, error } = await supabase
    .from("applications")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("created_by_user_id", userId)
    .limit(1);

  if (error) throw error;
  return (data ?? []).length > 0;
}

export async function listSchoolPortalOptionsForUser(
  supabase: SupabaseClient,
  userId: string,
  slug: string,
): Promise<SchoolPortalOption[]> {
  const org = await fetchOrganizationWithSettingsUncached(supabase, slug);
  if (!org) {
    return [];
  }

  const options: SchoolPortalOption[] = [];

  const [hasAdminAccess, hasFamilyAccess, hasEnrolledAccess] = await Promise.all([
    userCanAccessSchoolAdmin(supabase, userId, org.id),
    userHasFamilyPortalAccess(supabase, userId, org.id),
    userHasEnrolledAccess(supabase, userId, org.id),
  ]);

  if (hasAdminAccess) {
    options.push({
      id: "admin",
      label: "School admin",
      href: `/school/${slug}/admin`,
    });
  }

  if (hasFamilyAccess) {
    options.push({
      id: "family_apply",
      label: "My applications",
      href: `/school/${slug}/apply`,
    });
  }

  if (
    hasEnrolledAccess &&
    isParentPortalEnabled(org.features) &&
    hasFamilyAccess
  ) {
    const parentHref = getParentPortalHomeHref(
      slug,
      org.features.parent,
      org.features.feature_nav?.parent,
    );

    if (parentHref) {
      options.push({
        id: "family_parent",
        label: "Parent portal",
        href: parentHref,
      });
    }
  }

  return options;
}
