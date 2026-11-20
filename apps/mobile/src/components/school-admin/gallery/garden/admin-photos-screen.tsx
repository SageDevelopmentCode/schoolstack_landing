import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { GInlineBanner } from '@/components/parent/garden/fields';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GKicker, GLink, GOutlineButton, GPressable, GSkeleton } from '@/components/parent/garden/ui';
import { AdminPhotoPermissionsSheet } from '@/components/school-admin/gallery/garden/admin-photo-permissions-sheet';
import { AdminPhotoUploadSheet } from '@/components/school-admin/gallery/garden/admin-photo-upload-sheet';
import {
  GalleryEditDateSheet,
  GalleryPhotoActionSheet,
} from '@/components/school-admin/gallery/garden/gallery-photo-sheets';
import {
  useGalleryScreenController,
  type GalleryScreenApi,
} from '@/components/school-admin/gallery/garden/use-gallery-screen-controller';
import { GalleryPhotoGrid } from '@/components/school-admin/gallery/gallery-photo-grid';
import { GalleryPhotoGridSkeleton } from '@/components/school-admin/gallery/gallery-photo-grid-skeleton';
import { GalleryPhotoViewerModal } from '@/components/school-admin/gallery/gallery-photo-viewer-modal';
import { AdminTabHeader, useAdminTopBleed } from '@/components/school-admin/garden/admin-tab-header';
import { AdminEmptyPanel, AdminToolbarButton } from '@/components/school-admin/garden/admin-ui';
import { calmExit, calmRise } from '@/lib/motion/portal-motion';
import { formatGalleryDateLabel } from '@/lib/school-gallery/format-gallery-date';
import {
  deleteGalleryPhoto,
  listGalleryPhotos,
  patchGalleryPhotoDate,
  uploadGalleryBatch,
} from '@/lib/school-gallery/gallery-api';

type Props = { organizationId: string; slug: string; schoolName: string };

const canManageAll = () => true;

/**
 * School admin › More › Photos (Garden). Logic lives in the shared
 * `useGalleryScreenController` (also used by the teacher Photos screen) with the
 * `school_admin_gallery_*` operations; admins can manage every photo and bulk delete.
 */
export function PhotosScreen({ organizationId, slug }: Props) {
  const bleed = useAdminTopBleed();
  const api = useMemo<GalleryScreenApi>(
    () => ({
      listPage: (offset) => listGalleryPhotos(slug, offset),
      uploadBatch: (photoDate, files, options) => uploadGalleryBatch(slug, photoDate, files, options),
      patchDate: (photoId, photoDate) => patchGalleryPhotoDate(slug, photoId, photoDate),
      deletePhotoById: (photoId) => deleteGalleryPhoto(slug, photoId),
    }),
    [slug],
  );
  const gallery = useGalleryScreenController({
    organizationId,
    operationPrefix: 'school_admin_gallery',
    uploadSurface: 'school_admin',
    api,
    canManagePhoto: canManageAll,
    refreshToastId: 'admin-photos-refresh',
  });
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const { photos, groups, selectionMode, selectedIds, bulkProgress } = gallery;

  if (gallery.loading && photos.length === 0) {
    return (
      <View style={[styles.root, bleed]} testID="photos-screen">
        <StatusBar style="dark" />
        <View style={styles.skeleton} testID="photos-list-skeleton" accessibilityLabel="Loading photos">
          <GSkeleton style={styles.skTitle} />
          <GSkeleton style={styles.skStatus} />
          <GSkeleton style={styles.skActions} />
        </View>
        <GalleryPhotoGridSkeleton tileCount={12} />
      </View>
    );
  }

  return (
    <View style={[styles.root, bleed]} testID="photos-screen">
      <StatusBar style="dark" />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={gallery.pullRefreshing} onRefresh={() => void gallery.onPullRefresh()} tintColor={Garden.soft} />
        }
        contentContainerStyle={styles.scroll}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          if (contentSize.height - layoutMeasurement.height - contentOffset.y < 240) gallery.handleEndReached();
        }}
        scrollEventThrottle={200}>
        <View style={styles.top}>
          <AdminTabHeader
            title="Photos"
            accentWord="Photos"
            statusLine={gallery.statusLine}
            lastUpdatedAt={gallery.lastUpdatedAt}
            statusTestID="photos-status-line"
            toolbar={
              <AdminToolbarButton
                icon="cloud-upload-outline"
                label="Upload"
                accessibilityLabel="Upload photos"
                onPress={gallery.openUpload}
                testID="photos-upload"
              />
            }
          />
          <View style={styles.actions}>
            <GOutlineButton label="Photo permissions" icon="shield-checkmark-outline" onPress={() => setPermissionsOpen(true)} />
            {!selectionMode && photos.length > 0 ? (
              <GOutlineButton
                label="Select"
                icon="checkmark-circle-outline"
                onPress={gallery.startSelection}
                accessibilityHint="Tap photos to choose which to delete"
              />
            ) : null}
          </View>
          {selectionMode ? <Text style={styles.hint}>Tap photos to select them, then delete them together.</Text> : null}
          {gallery.initialError ? (
            <GInlineBanner
              tone="error"
              title="Couldn't load photos"
              description={gallery.initialError}
              action={<GLink label="Try again" icon="refresh" onPress={() => void gallery.onPullRefresh()} />}
            />
          ) : null}
        </View>

        {groups.length === 0 && !gallery.initialError ? (
          <View style={styles.pad}>
            <AdminEmptyPanel
              icon="images-outline"
              title="No photos yet"
              body="Upload your first batch to get started."
              actionLabel="Upload photos"
              onAction={gallery.openUpload}
            />
          </View>
        ) : (
          <View style={styles.groups}>
            {groups.map((group) => (
              <View key={group.photoDate} style={styles.group}>
                <View style={styles.groupHead}>
                  <GKicker>{formatGalleryDateLabel(group.photoDate)}</GKicker>
                  <Text style={styles.groupCount}>{group.photos.length}</Text>
                </View>
                <GalleryPhotoGrid
                  photos={group.photos}
                  selectionMode={selectionMode}
                  selectedIds={selectedIds}
                  showUploaderOnTiles
                  onPressPhoto={gallery.openPhoto}
                  onLongPressPhoto={gallery.showPhotoActions}
                />
              </View>
            ))}
          </View>
        )}

        {gallery.loadingMore ? <GalleryPhotoGridSkeleton tileCount={3} /> : null}
        {gallery.loadMoreError ? (
          <View style={styles.pad}>
            <GInlineBanner
              tone="error"
              title="Couldn't load more photos"
              description={gallery.loadMoreError}
              action={<GLink label="Try again" icon="refresh" onPress={() => void gallery.loadMore()} />}
            />
          </View>
        ) : null}
      </ScrollView>

      {selectionMode ? (
        <Animated.View entering={calmRise()} exiting={calmExit()} style={styles.selectBar}>
          <Text style={styles.selectCount} accessibilityLiveRegion="polite">
            {bulkProgress ? `Deleting ${bulkProgress.done} of ${bulkProgress.total}…` : `${selectedIds.size} selected`}
          </Text>
          <GOutlineButton label="Cancel" onPress={gallery.exitSelection} />
          <GPressable
            accessibilityLabel={`Delete ${selectedIds.size} selected`}
            accessibilityState={{ disabled: selectedIds.size === 0 || bulkProgress != null, busy: bulkProgress != null }}
            disabled={selectedIds.size === 0 || bulkProgress != null}
            onPress={() => void gallery.deleteSelected()}
            style={[styles.deleteBtn, (selectedIds.size === 0 || bulkProgress != null) && styles.dim]}>
            <Text style={styles.deleteLabel}>Delete selected</Text>
          </GPressable>
        </Animated.View>
      ) : null}

      <AdminPhotoUploadSheet visible={gallery.uploadOpen} upload={gallery.upload} onClose={gallery.closeUpload} />
      <GalleryPhotoActionSheet controller={gallery} />
      <GalleryEditDateSheet controller={gallery} />
      <AdminPhotoPermissionsSheet visible={permissionsOpen} organizationId={organizationId} onClose={() => setPermissionsOpen(false)} />

      <GalleryPhotoViewerModal
        organizationId={organizationId}
        visible={gallery.viewerVisible}
        viewerState={gallery.viewerVisible ? { photos: gallery.orderedPhotos, index: gallery.viewerIndex } : null}
        hasMore={gallery.hasMore}
        onClose={gallery.closeViewer}
        onChangeIndex={gallery.setViewerIndex}
        onRequestMore={gallery.loadMore}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  scroll: { paddingBottom: 120 },
  top: { paddingHorizontal: 16, paddingTop: 8, gap: 12, marginBottom: 14 },
  pad: { paddingHorizontal: 16 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  hint: { fontFamily: GardenFonts.bodySemi, fontSize: 13.5, color: Garden.soft },
  groups: { gap: 18 },
  group: { gap: 8 },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16 },
  groupCount: { fontFamily: GardenFonts.bodyBold, fontSize: 12.5, color: Garden.soft, fontVariant: ['tabular-nums'] },
  selectBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 22,
    backgroundColor: Garden.white,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  selectCount: { flex: 1, fontFamily: GardenFonts.bodyExtra, fontSize: 15, color: Garden.ink, fontVariant: ['tabular-nums'] },
  deleteBtn: {
    minHeight: 44,
    borderRadius: 999,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: '#F9E5DA',
    borderWidth: 1.5,
    borderColor: '#C2714F',
  },
  deleteLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, color: '#9F3A1E' },
  dim: { opacity: 0.5 },
  skeleton: { paddingHorizontal: 16, paddingTop: 8, gap: 12, marginBottom: 14 },
  skTitle: { width: '40%', height: 32, borderRadius: 10, marginTop: 6 },
  skStatus: { width: '70%', height: 16, borderRadius: 8 },
  skActions: { width: '80%', height: 44, borderRadius: 22 },
});
