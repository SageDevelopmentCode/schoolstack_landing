export type PortalId = "admin" | "teacher" | "family_apply" | "family_parent";

export type SchoolPortalOption = {
  id: PortalId;
  label: string;
  href: string;
};

export function detectPortalFromPathname(pathname: string, slug: string): PortalId {
  const previewAdminPrefix = `/admin/preview/${slug}/admin`;
  const previewFamilyPrefix = `/admin/preview/${slug}/family`;

  if (
    pathname.startsWith(previewAdminPrefix) ||
    pathname.startsWith(`/school/${slug}/admin`)
  ) {
    return "admin";
  }

  if (pathname.startsWith(`/school/${slug}/teacher`)) {
    return "teacher";
  }

  if (
    pathname.startsWith(`${previewFamilyPrefix}/`) &&
    pathname.includes("/parent")
  ) {
    return "family_parent";
  }

  if (
    pathname.startsWith(`${previewFamilyPrefix}/`) ||
    pathname.startsWith(`/school/${slug}/parent`)
  ) {
    if (pathname.startsWith(`/school/${slug}/parent`)) {
      return "family_parent";
    }
    return "family_apply";
  }

  return "family_apply";
}

export function shouldShowPortalSwitcher(options: SchoolPortalOption[]): boolean {
  const hasStaffPortal = options.some(
    (option) => option.id === "admin" || option.id === "teacher",
  );
  return hasStaffPortal && options.length >= 2;
}
