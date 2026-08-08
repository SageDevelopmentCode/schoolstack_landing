import type { SupabaseClient } from "@supabase/supabase-js";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import {
  fetchOrganizationWithSettings,
  type OrganizationWithSettings,
} from "@/lib/organization-settings/fetch";
import { getParentPortalHomeHref } from "@/lib/organization-settings/parent-nav";
import { isParentPortalEnabled } from "@/lib/organization-settings/parent-routes";
import { getTeacherPortalHomeHref } from "@/lib/organization-settings/teacher-nav";
import { isTeacherPortalEnabled } from "@/lib/organization-settings/teacher-routes";
import { userCanAccessSchoolAdmin } from "@/lib/school-admin/access";
import { userHasTeacherPortalAccess } from "@/lib/staff/teacher-portal-access";
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

export type SchoolPortalOptionsKnownAccess = {
  /** Pre-fetched org; skips another org lookup when provided. */
  org?: OrganizationWithSettings | null;
  hasAdminAccess?: boolean;
  hasFamilyAccess?: boolean;
  hasEnrolledAccess?: boolean;
  hasTeacherAccess?: boolean;
};

export async function listSchoolPortalOptionsForUser(
  supabase: SupabaseClient,
  userId: string,
  slug: string,
  known: SchoolPortalOptionsKnownAccess = {},
): Promise<SchoolPortalOption[]> {
  const org =
    known.org === undefined
      ? await fetchOrganizationWithSettings(supabase, slug)
      : known.org;
  if (!org) {
    return [];
  }

  const options: SchoolPortalOption[] = [];

  const [hasAdminAccess, hasFamilyAccess, hasEnrolledAccess, hasTeacherAccess] =
    await Promise.all([
      known.hasAdminAccess !== undefined
        ? Promise.resolve(known.hasAdminAccess)
        : userCanAccessSchoolAdmin(supabase, userId, org.id),
      known.hasFamilyAccess !== undefined
        ? Promise.resolve(known.hasFamilyAccess)
        : userHasFamilyPortalAccess(supabase, userId, org.id),
      known.hasEnrolledAccess !== undefined
        ? Promise.resolve(known.hasEnrolledAccess)
        : userHasEnrolledAccess(supabase, userId, org.id),
      known.hasTeacherAccess !== undefined
        ? Promise.resolve(known.hasTeacherAccess)
        : userHasTeacherPortalAccess(supabase, userId, org.id),
    ]);

  if (hasAdminAccess) {
    options.push({
      id: "admin",
      label: "School admin",
      href: `/school/${slug}/admin`,
    });
  }

  if (hasTeacherAccess && isTeacherPortalEnabled(org.features)) {
    const teacherHref = getTeacherPortalHomeHref(
      slug,
      org.features.teacher,
      org.features.feature_nav?.teacher,
    );

    if (teacherHref) {
      options.push({
        id: "teacher",
        label: "Staff portal",
        href: teacherHref,
      });
    }
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
