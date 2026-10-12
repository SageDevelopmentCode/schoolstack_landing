export function familyPreviewBasePath(slug: string, familyId: string): string {
  return `/admin/preview/${slug}/family/${familyId}`;
}

export function familyPreviewParentBasePath(
  slug: string,
  familyId: string,
): string {
  return `${familyPreviewBasePath(slug, familyId)}/parent`;
}

export function schoolAdminPreviewBasePath(
  slug: string,
  familyId?: string,
): string {
  const base = `/admin/preview/${slug}/admin`;
  if (!familyId) return base;
  return `${base}?familyId=${encodeURIComponent(familyId)}`;
}
