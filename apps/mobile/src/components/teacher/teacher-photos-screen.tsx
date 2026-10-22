import { useCallback } from 'react';

import { GalleryPhotosScreen } from '@/components/gallery/gallery-photos-screen';
import { useAuth } from '@/contexts/auth-context';
import { canManageGalleryPhoto } from '@/lib/school-gallery/gallery-access';
import {
  deleteTeacherGalleryPhoto,
  listTeacherGalleryPhotos,
  patchTeacherGalleryPhotoDate,
  uploadTeacherGalleryBatch,
} from '@/lib/school-gallery/teacher-gallery-api';

type TeacherPhotosScreenProps = {
  organizationId: string;
  slug: string;
  schoolName: string;
};

export function TeacherPhotosScreen({
  organizationId,
  slug,
  schoolName: _schoolName,
}: TeacherPhotosScreenProps) {
  const { user } = useAuth();
  const userId = user?.id;

  const listPage = useCallback(
    (offset: number) => listTeacherGalleryPhotos(organizationId, slug, offset),
    [organizationId, slug],
  );
  const uploadBatch = useCallback(
    (photoDate: string, files: Parameters<typeof uploadTeacherGalleryBatch>[3]) =>
      uploadTeacherGalleryBatch(organizationId, slug, photoDate, files),
    [organizationId, slug],
  );
  const patchDate = useCallback(
    (photoId: string, photoDate: string) =>
      patchTeacherGalleryPhotoDate(organizationId, slug, photoId, photoDate),
    [organizationId, slug],
  );
  const deletePhotoById = useCallback(
    (photoId: string) => deleteTeacherGalleryPhoto(organizationId, slug, photoId),
    [organizationId, slug],
  );
  const canManagePhoto = useCallback(
    (photo: { uploadedBy: string | null }) =>
      canManageGalleryPhoto({ isOrgAdmin: false, userId, photo }),
    [userId],
  );

  return (
    <GalleryPhotosScreen
      organizationId={organizationId}
      testId="teacher-photos-screen"
      emptyTitle="No photos yet"
      emptyCopy="Upload your first batch to share with families."
      enableBulkDelete={false}
      listPage={listPage}
      uploadBatch={uploadBatch}
      patchDate={patchDate}
      deletePhotoById={deletePhotoById}
      canManagePhoto={canManagePhoto}
      errorOperationPrefix="teacher_gallery"
      uploadOperation="teacher_gallery_upload"
      uploadSurface="teacher_portal"
    />
  );
}
