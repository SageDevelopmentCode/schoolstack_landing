import {
  fetchSchoolAdminApi,
  fetchSchoolAdminApiFormData,
} from '@/lib/school-admin-api';
import {
  loadGalleryUploadBlobParts,
  postGalleryFormDataChunks,
  type GalleryUploadChunkProgress,
} from '@/lib/school-gallery/gallery-chunked-upload';
import type { GalleryPhoto, GalleryPhotosPage } from '@/lib/school-gallery/types';

export type PreparedGalleryUploadFile = {
  uri: string;
  name: string;
  type: string;
};

export type GalleryBatchUploadOptions = {
  onChunkProgress?: (progress: GalleryUploadChunkProgress) => void;
};

export function formatGalleryApiError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

export async function listGalleryPhotos(slug: string, offset = 0): Promise<GalleryPhotosPage> {
  const payload = await fetchSchoolAdminApi<{
    photos?: GalleryPhoto[];
    hasMore?: boolean;
    nextOffset?: number;
  }>(`/api/school/${encodeURIComponent(slug)}/gallery?offset=${offset}`);

  const photos = payload.photos ?? [];
  return {
    photos,
    hasMore: Boolean(payload.hasMore),
    nextOffset:
      typeof payload.nextOffset === 'number' ? payload.nextOffset : offset + photos.length,
  };
}

export async function uploadGalleryBatch(
  slug: string,
  photoDate: string,
  files: PreparedGalleryUploadFile[],
  options?: GalleryBatchUploadOptions,
): Promise<GalleryPhoto[]> {
  const parts = await loadGalleryUploadBlobParts(files);
  const path = `/api/school/${encodeURIComponent(slug)}/gallery`;

  return postGalleryFormDataChunks({
    path,
    photoDate,
    parts,
    onChunkProgress: options?.onChunkProgress,
    postFormData: (uploadPath, formData) =>
      fetchSchoolAdminApiFormData<{ photos?: GalleryPhoto[] }>(uploadPath, formData),
  });
}

export async function patchGalleryPhotoDate(
  slug: string,
  photoId: string,
  photoDate: string,
): Promise<GalleryPhoto> {
  const payload = await fetchSchoolAdminApi<{ photo?: GalleryPhoto }>(
    `/api/school/${encodeURIComponent(slug)}/gallery/${encodeURIComponent(photoId)}`,
    {
      method: 'PATCH',
      body: { photoDate },
    },
  );

  if (!payload.photo) {
    throw new Error('Could not update photo date.');
  }

  return payload.photo;
}

export async function deleteGalleryPhoto(slug: string, photoId: string): Promise<void> {
  await fetchSchoolAdminApi(
    `/api/school/${encodeURIComponent(slug)}/gallery/${encodeURIComponent(photoId)}`,
    { method: 'DELETE' },
  );
}
