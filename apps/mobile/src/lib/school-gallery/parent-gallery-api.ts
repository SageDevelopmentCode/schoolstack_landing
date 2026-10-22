import { fetchParentApi } from '@/lib/parent/parent-portal-api';
import type { GalleryPhoto, GalleryPhotosPage } from '@/lib/school-gallery/types';

function buildParentGalleryQuery(
  organizationId: string,
  slug: string,
  programId?: string,
): string {
  const params = new URLSearchParams({
    organizationId,
    slug,
  });
  if (programId?.trim()) {
    params.set('programId', programId.trim());
  }
  return params.toString();
}

export async function listParentGalleryPhotos(
  organizationId: string,
  slug: string,
  offset = 0,
  programId?: string,
): Promise<GalleryPhotosPage> {
  const query = buildParentGalleryQuery(organizationId, slug, programId);
  const payload = await fetchParentApi<{
    photos?: GalleryPhoto[];
    hasMore?: boolean;
    nextOffset?: number;
  }>(`/api/parent-portal/gallery?${query}&offset=${offset}`);

  const photos = payload.photos ?? [];
  return {
    photos,
    hasMore: Boolean(payload.hasMore),
    nextOffset:
      typeof payload.nextOffset === 'number' ? payload.nextOffset : offset + photos.length,
  };
}
