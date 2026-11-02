/** Path-only API URL; prepend site origin on mobile. */
export function parentNewsletterDocumentApiPath(
  organizationId: string,
  editionId: string,
): string {
  const query = new URLSearchParams({ organizationId }).toString();
  return `/api/parent-portal/newsletters/${encodeURIComponent(editionId)}/document?${query}`;
}

export function parentNewsletterDocumentApiUrl(
  organizationId: string,
  editionId: string,
  siteOrigin?: string,
): string {
  const base = (siteOrigin ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://trymudkitchen.com").replace(
    /\/$/,
    "",
  );
  return `${base}${parentNewsletterDocumentApiPath(organizationId, editionId)}`;
}
