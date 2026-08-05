import type { SchoolPortalOption } from "@/lib/auth/portal-switcher-types";
import type { OrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { getParentPortalHomeHref } from "@/lib/organization-settings/parent-nav";
import { isParentPortalEnabled } from "@/lib/organization-settings/parent-routes";

export function familyPreviewBasePath(slug: string, familyId: string): string {
  return `/admin/preview/${slug}/family/${familyId}`;
}

export function familyPreviewParentBasePath(
  slug: string,
  familyId: string,
): string {
  return `${familyPreviewBasePath(slug, familyId)}/parent`;
}

export function schoolAdminPreviewBasePath(slug: string, familyId?: string): string {
  const base = `/admin/preview/${slug}/admin`;
  if (!familyId) return base;
  return `${base}?familyId=${encodeURIComponent(familyId)}`;
}

export function listPreviewPortalOptions(input: {
  slug: string;
  familyId: string;
  hasEnrolledAccess: boolean;
  org: OrganizationWithSettings;
}): SchoolPortalOption[] {
  const { slug, familyId, hasEnrolledAccess, org } = input;
  const options: SchoolPortalOption[] = [
    {
      id: "admin",
      label: "School admin",
      href: schoolAdminPreviewBasePath(slug, familyId),
    },
    {
      id: "family_apply",
      label: "My applications",
      href: familyPreviewBasePath(slug, familyId),
    },
  ];

  if (hasEnrolledAccess && isParentPortalEnabled(org.features)) {
    const parentHref = getParentPortalHomeHref(
      slug,
      org.features.parent,
      org.features.feature_nav?.parent,
      familyPreviewParentBasePath(slug, familyId),
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
