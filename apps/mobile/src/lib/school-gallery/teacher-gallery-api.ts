import { fetchTeacherApi, fetchTeacherApiFormData } from '@/lib/teacher/teacher-portal-api';
import type { PreparedGalleryUploadFile } from '@/lib/school-gallery/gallery-api';
import type { GalleryPhoto, GalleryPhotosPage } from '@/lib/school-gallery/types';

function buildTeacherGalleryQuery(organizationId: string, slug: string): string {
  return new URLSearchParams({
    organizationId,
    slug,
  }).toString();
}

export async function listTeacherGalleryPhotos(
  organizationId: string,
  slug: string,
  offset = 0,
): Promise<GalleryPhotosPage> {
  const query = buildTeacherGalleryQuery(organizationId, slug);
  const payload = await fetchTeacherApi<{
    photos?: GalleryPhoto[];
    hasMore?: boolean;
    nextOffset?: number;
  }>(`/api/teacher-portal/gallery?${query}&offset=${offset}`);

  const photos = payload.photos ?? [];
  return {
    photos,
    hasMore: Boolean(payload.hasMore),
    nextOffset:
      typeof payload.nextOffset === 'number' ? payload.nextOffset : offset + photos.length,
  };
}

export async function uploadTeacherGalleryBatch(
  organizationId: string,
  slug: string,
  photoDate: string,
  files: PreparedGalleryUploadFile[],
): Promise<GalleryPhoto[]> {
  const formData = new FormData();
  formData.append('photoDate', photoDate);
  for (const file of files) {
    formData.append(
      'files',
      {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as unknown as Blob,
    );
  }

  const query = buildTeacherGalleryQuery(organizationId, slug);
  const payload = await fetchTeacherApiFormData<{ photos?: GalleryPhoto[] }>(
    `/api/teacher-portal/gallery?${query}`,
    formData,
  );

  if (!payload.photos?.length) {
    throw new Error('Upload failed.');
  }

  return payload.photos;
}

export async function patchTeacherGalleryPhotoDate(
  organizationId: string,
  slug: string,
  photoId: string,
  photoDate: string,
): Promise<GalleryPhoto> {
  const query = buildTeacherGalleryQuery(organizationId, slug);
  const payload = await fetchTeacherApi<{ photo?: GalleryPhoto }>(
    `/api/teacher-portal/gallery/${encodeURIComponent(photoId)}?${query}`,
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

export async function deleteTeacherGalleryPhoto(
  organizationId: string,
  slug: string,
  photoId: string,
): Promise<void> {
  const query = buildTeacherGalleryQuery(organizationId, slug);
  await fetchTeacherApi(`/api/teacher-portal/gallery/${encodeURIComponent(photoId)}?${query}`, {
    method: 'DELETE',
  });
}
