import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { GalleryPhotosScreen } from '@/components/gallery/gallery-photos-screen';
import { ParentPhotoPermissionsBanner } from '@/components/parent/photos/parent-photo-permissions-banner';
import { ParentPhotoPermissionsSheet } from '@/components/parent/photos/parent-photo-permissions-sheet';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';
import {
  fetchParentPhotoMediaConsents,
  type ParentPhotoMediaConsentLearner,
} from '@/lib/parent/parent-photo-media-consent-api';
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
  const [learners, setLearners] = useState<ParentPhotoMediaConsentLearner[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { reportError } = useMobileErrorReporter(organizationId);

  const loadConsents = useCallback(async () => {
    try {
      const rows = await fetchParentPhotoMediaConsents(organizationId, slug, programId);
      setLearners(rows);
    } catch (error) {
      reportError('parent_photo_media_consents_load', error);
    }
  }, [organizationId, programId, reportError, slug]);

  useFocusEffect(
    useCallback(() => {
      void loadConsents();
    }, [loadConsents]),
  );

  const listPage = useCallback(
    (offset: number) => listParentGalleryPhotos(organizationId, slug, offset, programId),
    [organizationId, slug, programId],
  );

  const listPrefix =
    learners.length > 0 ? (
      <View style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }}>
        <ParentPhotoPermissionsBanner learners={learners} onPressEdit={() => setSheetOpen(true)} />
      </View>
    ) : null;

  return (
    <>
      <GalleryPhotosScreen
        readOnly
        organizationId={organizationId}
        testId="parent-photos-screen"
        emptyTitle="No photos yet"
        emptyCopy="Your school has not shared any photos yet."
        enableBulkDelete={false}
        listPage={listPage}
        errorOperationPrefix="parent_gallery"
        listPrefix={listPrefix}
        showUploaderOnTiles={false}
      />
      <ParentPhotoPermissionsSheet
        visible={sheetOpen}
        organizationId={organizationId}
        learners={learners}
        onClose={() => setSheetOpen(false)}
        onSaved={(updates) => {
          const byId = new Map(updates.map((row) => [row.studentId, row]));
          setLearners((prev) =>
            prev.map((learner) => byId.get(learner.studentId) ?? learner),
          );
        }}
      />
    </>
  );
}
