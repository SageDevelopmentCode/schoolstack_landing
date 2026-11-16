import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { GBackHeader } from '@/components/parent/garden/back-header';
import { GCelebrate } from '@/components/parent/garden/celebrate';
import { GInlineBanner } from '@/components/parent/garden/fields';
import {
  closeThen,
  useGardenPullRefresh,
  useGardenReadOnlyGate,
} from '@/components/parent/garden/feedback';
import { useGardenToast } from '@/components/parent/garden/toast';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import {
  GCard,
  GChip,
  GDashedRule,
  GErrorCard,
  GHand,
  GOutlineButton,
  GSkeleton,
  gText,
} from '@/components/parent/garden/ui';
import { ParentPhotoViewer } from '@/components/parent/photos/garden/parent-photo-viewer';
import {
  PhotoDayGrid,
  PhotoGridSkeleton,
  photoTileSize,
} from '@/components/parent/photos/garden/photo-day-grid';
import { PhotoPermissionsCard } from '@/components/parent/photos/garden/photo-permissions-card';
import { PhotoPermissionsSheet } from '@/components/parent/photos/garden/photo-permissions-sheet';
import { photoCountLabel } from '@/components/parent/photos/garden/photo-permissions-ui';
import type { ParentPhotosController } from '@/components/parent/photos/garden/use-parent-photos-controller';
import type { GalleryPhotoDateGroup } from '@/lib/school-gallery/group-gallery-photos';
import type { GalleryPhoto } from '@/lib/school-gallery/types';

const H_PADDING = 16;
const TEST_ID = 'parent-photos-screen';

export const PHOTOS_HEADER = {
  backLabel: 'More',
  backAccessibilityLabel: 'Back',
  title: 'Photos',
  accentWord: 'Photos',
  subtitle: "School gallery and your child's photo permissions in one place.",
} as const;

/**
 * Parent Photos in Garden: back header, each child's photo permission (the
 * primary action while any is unset), then the school gallery by day with a
 * full-screen viewer. Pull to refresh reloads both.
 */
export function ParentPhotosGardenScreen({ controller }: { controller: ParentPhotosController }) {
  const accent = useGardenAccent();
  const toast = useGardenToast();
  const { width } = useWindowDimensions();
  const tileSize = photoTileSize(width - H_PADDING * 2);
  const { readOnly, guard } = useGardenReadOnlyGate();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [viewerPhotoId, setViewerPhotoId] = useState<string | null>(null);

  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh: controller.refresh,
    error: controller.initialError,
    label: 'Photos',
    id: 'photos-refresh',
  });

  const openSheet = useMemo(() => guard(() => setSheetOpen(true)), [guard]);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  const onSaved = useCallback(
    (summary: string) => {
      closeThen(closeSheet, () => {
        toast.success('Photo permissions saved', {
          id: 'photo-permissions-saved',
          description: summary || 'The school will follow your choices.',
        });
      });
    },
    [closeSheet, toast],
  );

  const openPhoto = useCallback((photo: GalleryPhoto) => setViewerPhotoId(photo.id), []);
  const viewerIndex = viewerPhotoId
    ? controller.photos.findIndex((photo) => photo.id === viewerPhotoId)
    : -1;

  const permissions = (
    <PhotoPermissionsCard
      index={1}
      status={controller.consentsStatus}
      learners={controller.learners}
      unsetLearners={controller.unsetLearners}
      setCount={controller.setCount}
      recentlyUpdatedIds={controller.recentlyUpdatedIds}
      onEdit={openSheet}
      onRetry={controller.retryConsents}
    />
  );

  if (controller.isInitialLoading) {
    return (
      <View style={styles.root} testID={TEST_ID}>
        <StatusBar style="dark" />
        <View style={styles.content}>
          <View style={styles.header}>
            <GBackHeader onBack={controller.onBack} {...PHOTOS_HEADER} />
            {permissions}
            <View style={styles.galleryHeadSkeleton}>
              <GSkeleton style={styles.skeletonTitle} />
              <GSkeleton style={styles.skeletonChip} />
            </View>
            <GSkeleton style={styles.skeletonDay} />
            <PhotoGridSkeleton tileSize={tileSize} tiles={9} />
          </View>
        </View>
      </View>
    );
  }

  const firstLoadFailed = controller.photos.length === 0 && Boolean(controller.initialError);
  const isEmpty = controller.photos.length === 0 && !controller.initialError;

  const header = (
    <View style={styles.header}>
      <GBackHeader onBack={controller.onBack} {...PHOTOS_HEADER} />
      {permissions}

      {firstLoadFailed && controller.initialError ? (
        <GErrorCard
          title="We couldn't load photos"
          message={`${controller.initialError} Check your connection, then try again.`}
          onRetry={controller.retryGallery}
        />
      ) : null}

      {isEmpty ? (
        <GCard index={2} title="No photos yet" testID="parent-photos-empty">
          <Text style={gText.body}>Your school has not shared any photos yet.</Text>
          <Text style={[gText.meta, styles.emptyMeta]}>
            New photos show up here by day. Pull down to check for new ones.
          </Text>
          <View style={styles.hand}>
            <GHand>Check back soon.</GHand>
          </View>
        </GCard>
      ) : null}

      {controller.photos.length > 0 ? (
        <View style={styles.galleryHead}>
          <Text accessibilityRole="header" style={styles.galleryTitle}>
            Shared by your school
          </Text>
          <GChip
            tone="neutral"
            icon="images-outline"
            label={photoCountLabel(controller.photos.length, controller.hasMore)}
          />
        </View>
      ) : null}
    </View>
  );

  const footer =
    controller.photos.length === 0 ? null : controller.loadingMore ? (
      <View style={styles.footer}>
        <PhotoGridSkeleton tileSize={tileSize} tiles={3} />
      </View>
    ) : controller.loadMoreError ? (
      <View style={styles.footer}>
        <GInlineBanner
          tone="error"
          title="Couldn't load more photos"
          description={`${controller.loadMoreError} Check your connection, then try again.`}
          action={
            <GOutlineButton
              label="Try again"
              icon="refresh"
              onPress={controller.retryLoadMore}
              style={styles.retry}
            />
          }
        />
      </View>
    ) : !controller.hasMore ? (
      <View style={styles.endRow} accessible accessibilityLabel="That's every photo for now">
        <GDashedRule style={styles.endRule} />
        <Text style={styles.endText}>That&apos;s every photo for now</Text>
        <GDashedRule style={styles.endRule} />
      </View>
    ) : null;

  return (
    <View style={styles.root} testID={TEST_ID}>
      <StatusBar style="dark" />
      <FlatList<GalleryPhotoDateGroup>
        data={controller.groups}
        keyExtractor={(group) => group.photoDate}
        contentContainerStyle={styles.content}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        renderItem={({ item, index }) => (
          <PhotoDayGrid
            group={item}
            latest={index === 0}
            showCount={controller.groups.length > 1}
            tileSize={tileSize}
            onOpenPhoto={openPhoto}
          />
        )}
        onEndReached={controller.loadMore}
        onEndReachedThreshold={0.6}
        initialNumToRender={4}
        windowSize={7}
        refreshControl={
          <RefreshControl
            refreshing={pullRefreshing}
            onRefresh={() => void onPullRefresh()}
            tintColor={accent.clay}
          />
        }
      />

      <ParentPhotoViewer
        organizationId={controller.organizationId}
        photos={controller.photos}
        index={viewerIndex}
        visible={viewerIndex >= 0}
        hasMore={controller.hasMore}
        onClose={() => setViewerPhotoId(null)}
        onChangeIndex={(next) => {
          const photo = controller.photos[next];
          if (photo) setViewerPhotoId(photo.id);
        }}
        onRequestMore={controller.loadMore}
      />

      {controller.learners.length > 0 ? (
        <PhotoPermissionsSheet
          visible={sheetOpen && !readOnly}
          learners={controller.learners}
          onClose={closeSheet}
          onSave={controller.savePermissions}
          onSaved={onSaved}
        />
      ) : null}

      <GCelebrate
        active={controller.justCompletedAll && !readOnly}
        celebrationKey={`parent-photos-permissions-complete-${controller.slug}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  content: { paddingHorizontal: H_PADDING, paddingTop: 12, paddingBottom: 48, gap: 22 },
  header: { gap: 16 },
  hand: { marginTop: 10 },
  emptyMeta: { marginTop: 6 },
  galleryHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  galleryTitle: {
    flex: 1,
    fontFamily: GardenFonts.display,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.6,
    color: Garden.ink,
  },
  galleryHeadSkeleton: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  skeletonTitle: { height: 24, width: '55%', borderRadius: 8 },
  skeletonChip: { height: 22, width: 76, borderRadius: 999, marginLeft: 'auto' },
  skeletonDay: { height: 18, width: '40%', borderRadius: 6 },
  footer: { marginTop: -4 },
  retry: { marginTop: 8 },
  endRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  endRule: { flex: 1 },
  endText: { fontFamily: GardenFonts.bodyBold, fontSize: 12.5, color: Garden.soft },
});
