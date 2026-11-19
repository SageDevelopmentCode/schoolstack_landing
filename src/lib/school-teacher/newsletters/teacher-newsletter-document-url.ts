/** Path-only staff document URL; prepend the site origin on mobile. */
export function teacherNewsletterDocumentApiPath(organizationId: string, editionId: string): string {
  const query = new URLSearchParams({ organizationId }).toString();
  return `/api/teacher-portal/newsletters/${encodeURIComponent(editionId)}/document?${query}`;
}
