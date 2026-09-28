import type { SupabaseClient } from "@supabase/supabase-js";
import { getFamilyIdsForAuthUser } from "@/lib/admissions/application-auth";
import {
  familyPreviewBasePath,
  familyPreviewParentBasePath,
  schoolAdminPreviewBasePath,
} from "@/lib/admissions/preview-portal-options";
import { listSchoolPortalOptionsForUser } from "@/lib/auth/portal-switcher-server";
import type { SchoolPortalOption } from "@/lib/auth/portal-switcher-types";
import type { OrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { getParentPortalHomeHref } from "@/lib/organization-settings/parent-nav";
import { isParentPortalEnabled } from "@/lib/organization-settings/parent-routes";
import { getTeacherPortalHomeHref } from "@/lib/organization-settings/teacher-nav";
import { isTeacherPortalEnabled } from "@/lib/organization-settings/teacher-routes";
import { staffPreviewBasePath } from "@/lib/staff/staff-preview-access";

export function mapPortalOptionToTeacherPreview(
  option: SchoolPortalOption,
  slug: string,
  staffMemberId: string,
  familyId: string | null,
  org: OrganizationWithSettings,
): SchoolPortalOption | null {
  const teacherBase = staffPreviewBasePath(slug, staffMemberId);

  switch (option.id) {
    case "teacher": {
      const href = getTeacherPortalHomeHref(
        slug,
        org.features.teacher,
        org.features.feature_nav?.teacher,
        teacherBase,
      );
      return href ? { ...option, href } : null;
    }
    case "admin": {
      if (!familyId) return null;
      return {
        ...option,
        href: schoolAdminPreviewBasePath(slug, familyId),
      };
    }
    case "family_apply": {
      if (!familyId) return null;
      return {
        ...option,
        href: familyPreviewBasePath(slug, familyId),
      };
    }
    case "family_parent": {
      if (!familyId || !isParentPortalEnabled(org.features)) return null;
      const href = getParentPortalHomeHref(
        slug,
        org.features.parent,
        org.features.feature_nav?.parent,
        familyPreviewParentBasePath(slug, familyId),
      );
      return href ? { ...option, href } : null;
    }
    default:
      return option;
  }
}

export function staffOnlyTeacherPreviewOption(
  slug: string,
  staffMemberId: string,
  org: OrganizationWithSettings,
): SchoolPortalOption | null {
  if (!isTeacherPortalEnabled(org.features)) return null;
  const href = getTeacherPortalHomeHref(
    slug,
    org.features.teacher,
    org.features.feature_nav?.teacher,
    staffPreviewBasePath(slug, staffMemberId),
  );
  return href ? { id: "teacher", label: "Staff portal", href } : null;
}

export async function listTeacherPreviewPortalOptionsForStaff(
  admin: SupabaseClient,
  input: {
    slug: string;
    staffMemberId: string;
    userId: string | null;
    org: OrganizationWithSettings;
  },
): Promise<SchoolPortalOption[]> {
  const { slug, staffMemberId, userId, org } = input;

  if (!userId) {
    const only = staffOnlyTeacherPreviewOption(slug, staffMemberId, org);
    return only ? [only] : [];
  }

  const familyIds = await getFamilyIdsForAuthUser(admin, userId, org.id);
  const familyId = familyIds[0] ?? null;

  const liveOptions = await listSchoolPortalOptionsForUser(admin, userId, slug, {
    org,
  });

  const mapped = liveOptions
    .map((option) =>
      mapPortalOptionToTeacherPreview(option, slug, staffMemberId, familyId, org),
    )
    .filter((option): option is SchoolPortalOption => option != null);

  if (mapped.length > 0) {
    return mapped;
  }

  const fallback = staffOnlyTeacherPreviewOption(slug, staffMemberId, org);
  return fallback ? [fallback] : [];
}
