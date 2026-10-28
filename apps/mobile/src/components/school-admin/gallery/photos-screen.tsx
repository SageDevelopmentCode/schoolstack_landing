import { useCallback, useState } from 'react';

import { GalleryPhotosScreen } from '@/components/gallery/gallery-photos-screen';
import { SchoolAdminPhotoMediaPermissionsSheet } from '@/components/school-admin/gallery/school-admin-photo-media-permissions-sheet';
import { StoryButton } from '@/components/story/story-button';
import {
  deleteGalleryPhoto,
  listGalleryPhotos,
  patchGalleryPhotoDate,
  uploadGalleryBatch,
} from '@/lib/school-gallery/gallery-api';

type PhotosScreenProps = {
  organizationId: string;
  slug: string;
  schoolName: string;
};

export function PhotosScreen({ organizationId, slug, schoolName: _schoolName }: PhotosScreenProps) {
  const [permissionsOpen, setPermissionsOpen] = useState(false);

  const listPage = useCallback((offset: number) => listGalleryPhotos(slug, offset), [slug]);
  const uploadBatch = useCallback(
    (photoDate: string, files: Parameters<typeof uploadGalleryBatch>[2]) =>
      uploadGalleryBatch(slug, photoDate, files),
    [slug],
  );
  const patchDate = useCallback(
    (photoId: string, photoDate: string) => patchGalleryPhotoDate(slug, photoId, photoDate),
    [slug],
  );
  const deletePhotoById = useCallback(
    (photoId: string) => deleteGalleryPhoto(slug, photoId),
    [slug],
  );

  return (
    <>
      <GalleryPhotosScreen
        organizationId={organizationId}
        emptyTitle="No photos yet"
        emptyCopy="Upload your first batch to get started."
        enableBulkDelete
        listPage={listPage}
        uploadBatch={uploadBatch}
        patchDate={patchDate}
        deletePhotoById={deletePhotoById}
        canManagePhoto={() => true}
        errorOperationPrefix="school_admin_gallery"
        uploadOperation="school_admin_gallery_upload"
        uploadSurface="school_admin"
        extraHeaderActions={
          <StoryButton
            label="Photo permissions"
            variant="outline"
            onPress={() => setPermissionsOpen(true)}
          />
        }
      />
      <SchoolAdminPhotoMediaPermissionsSheet
        visible={permissionsOpen}
        organizationId={organizationId}
        onClose={() => setPermissionsOpen(false)}
      />
    </>
  );
}
