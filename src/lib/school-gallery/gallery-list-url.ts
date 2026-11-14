export type GalleryListPortal = "parent" | "teacher";

/**
 * List endpoint for a school gallery feed (`useGalleryPhotosFeed`).
 * Admin family preview reads through the admin gallery route; parents and
 * teachers read through their own portal routes.
 */
export function buildGalleryListUrl({
  organizationId,
  slug,
  programId,
  portal,
  previewFamilyId,
}: {
  organizationId: string;
  slug?: string;
  programId?: string;
  portal: GalleryListPortal;
  previewFamilyId?: string;
}): string | null {
  if (!slug) return null;
  if (previewFamilyId) {
    const params = new URLSearchParams({
      familyId: previewFamilyId,
      slug,
    });
    if (programId) params.set("programId", programId);
    return `/api/admin/organizations/${encodeURIComponent(organizationId)}/gallery?${params.toString()}`;
  }
  const params = new URLSearchParams({ organizationId, slug });
  if (programId) params.set("programId", programId);
  const base =
    portal === "parent"
      ? "/api/parent-portal/gallery"
      : "/api/teacher-portal/gallery";
  return `${base}?${params.toString()}`;
}
