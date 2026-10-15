export function staffPreviewBasePath(
  slug: string,
  staffMemberId: string,
): string {
  return `/admin/preview/${slug}/teacher/${staffMemberId}`;
}

export function staffPreviewFeaturePath(
  slug: string,
  staffMemberId: string,
  feature: string,
): string {
  return `${staffPreviewBasePath(slug, staffMemberId)}/${feature}`;
}
