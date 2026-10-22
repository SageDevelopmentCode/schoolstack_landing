import { useCallback } from 'react';

import { GalleryPhotosScreen } from '@/components/gallery/gallery-photos-screen';
import { listParentGalleryPhotos } from '@/lib/school-gallery/parent-gallery-api';

type ParentPhotosScreenProps = {
  organizationId: string;
  slug: string;
  programId?: string;
};

export function ParentPhotosScreen({
  organizationId,
  slug,
  programId,
}: ParentPhotosScreenProps) {
  const listPage = useCallback(
    (offset: number) => listParentGalleryPhotos(organizationId, slug, offset, programId),
    [organizationId, slug, programId],
  );

  return (
    <GalleryPhotosScreen
      readOnly
      organizationId={organizationId}
      testId="parent-photos-screen"
      emptyTitle="No photos yet"
      emptyCopy="Your school has not shared any photos yet."
      enableBulkDelete={false}
      listPage={listPage}
      errorOperationPrefix="parent_gallery"
    />
  );
}
