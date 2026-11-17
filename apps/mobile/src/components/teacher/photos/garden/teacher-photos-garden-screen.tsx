import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { GBackHeader } from '@/components/parent/garden/back-header';
import { GCelebrate } from '@/components/parent/garden/celebrate';
import { GInlineBanner } from '@/components/parent/garden/fields';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import {
  GCard,
  GChip,
  GDashedRule,
  GErrorCard,
  GIcon,
  GOutlineButton,
  GSkeleton,
  GToyButton,
  gText,
} from '@/components/parent/garden/ui';
import { PhotoDayGrid, PhotoGridSkeleton, photoTileSize } from '@/components/parent/photos/garden/photo-day-grid';
import { ParentPhotoViewer } from '@/components/parent/photos/garden/parent-photo-viewer';
import { photoCountLabel } from '@/components/parent/photos/garden/photo-permissions-ui';
import { AdminPhotoUploadSheet } from '@/components/school-admin/gallery/garden/admin-photo-upload-sheet';
import {
  GalleryEditDateSheet,
  GalleryPhotoActionSheet,
} from '@/components/school-admin/gallery/garden/gallery-photo-sheets';
import {
  useGalleryScreenController,
  type GalleryScreenApi,
} from '@/components/school-admin/gallery/garden/use-gallery-screen-controller';
import { useAuth } from '@/contexts/auth-context';
import { goBackOrReplace } from '@/lib/navigation';
import { canManageGalleryPhoto } from '@/lib/school-gallery/gallery-access';
import type { GalleryPhoto } from '@/lib/school-gallery/types';
import type { GalleryPhotoDateGroup } from '@/lib/school-gallery/group-gallery-photos';
import {
  deleteTeacherGalleryPhoto,
  listTeacherGalleryPhotos,
  patchTeacherGalleryPhotoDate,
  uploadTeacherGalleryBatch,
} from '@/lib/school-gallery/teacher-gallery-api';
import { teacherTabRoute } from '@/lib/teacher/teacher-nav';

const TEST_ID = 'teacher-photos-screen';
const H_PADDING = 16;
/** The viewer is a native fade modal; a sheet presented before it is gone is dropped on iOS. */
const VIEWER_DISMISS_MS = 450;
const OWN_PHOTOS_RULE = 'You can edit or delete photos you uploaded.';

/**
 * Teacher › More › Photos (Garden). The school gallery by day with an upload
 * card as the one toy button; long-press (or the viewer's options button) on a
 * photo you uploaded to change its date or delete it. Same `teacher_gallery_*`
 * operations and own-uploads-only rule as before; bulk delete stays off.
 */
export function TeacherPhotosGardenScreen({ organizationId, slug }: { organizationId: string; slug: string }) {
  const router = useRouter();
  const accent = useGardenAccent();
  const { width } = useWindowDimensions();
  const tileSize = photoTileSize(width - H_PADDING * 2);
  const { user } = useAuth();
  const userId = user?.id;
  const [uploadedThisVisit, setUploadedThisVisit] = useState(false);

  const api = useMemo<GalleryScreenApi>(
    () => ({
      listPage: (offset) => listTeacherGalleryPhotos(organizationId, slug, offset),
      uploadBatch: (photoDate, files, options) =>
        uploadTeacherGalleryBatch(organizationId, slug, photoDate, files, options),
      patchDate: (photoId, photoDate) => patchTeacherGalleryPhotoDate(organizationId, slug, photoId, photoDate),
      deletePhotoById: (photoId) => deleteTeacherGalleryPhoto(organizationId, slug, photoId),
    }),
    [organizationId, slug],
  );
  const canManagePhoto = useCallback(
    (photo: GalleryPhoto) => canManageGalleryPhoto({ isOrgAdmin: false, userId, photo }),
    [userId],
  );
  const onUploadComplete = useCallback(() => setUploadedThisVisit(true), []);

  const gallery = useGalleryScreenController({
    organizationId,
    operationPrefix: 'teacher_gallery',
    uploadSurface: 'teacher_portal',
    api,
    canManagePhoto,
    refreshToastId: 'teacher-photos-refresh',
    onUploadComplete,
  });

  const onBack = useCallback(() => goBackOrReplace(router, teacherTabRoute(slug, 'home')), [router, slug]);
  const ownCount = useMemo(() => gallery.photos.filter(canManagePhoto).length, [canManagePhoto, gallery.photos]);

  const tileBadge = useCallback(
    (photo: GalleryPhoto) =>
      canManagePhoto(photo)
        ? { label: 'You', mine: true }
        : photo.uploadedByName
          ? { label: photo.uploadedByName }
          : null,
    [canManagePhoto],
  );
  const tileHint = useCallback(
    (photo: GalleryPhoto) =>
      canManagePhoto(photo)
        ? 'Opens the photo full screen. Press and hold to change its date or delete it.'
        : 'Opens the photo full screen, where you can swipe and share',
    [canManagePhoto],
  );

  const viewerPhoto = gallery.viewerVisible ? gallery.orderedPhotos[gallery.viewerIndex] ?? null : null;
  const { closeViewer, showPhotoActions } = gallery;
  /** Close the full-screen viewer, then open the options sheet once its fade has finished. */
  const viewerOptions = useCallback(
    (photo: GalleryPhoto) => {
      closeViewer();
      setTimeout(() => showPhotoActions(photo), VIEWER_DISMISS_MS);
    },
    [closeViewer, showPhotoActions],
  );

  const header = (
    <View style={styles.header}>
      <GBackHeader
        backLabel="More"
        backAccessibilityLabel="Back to More"
        onBack={onBack}
        title="Photos"
        accentWord="Photos"
        subtitle={`Upload batches to share with families. ${OWN_PHOTOS_RULE}`}
      />

      <GCard index={0} title="Upload photos" testID="teacher-photos-upload-card">
        <View style={styles.uploadRow}>
          <GIcon name="cloud-upload-outline" bg={Garden.sky} />
          <View style={styles.uploadCopy}>
            <Text style={gText.body}>Pick a date, choose up to 25 photos, and they’re added to that day.</Text>
            <Text style={gText.meta}>Up to 25 images per batch. JPEG, PNG, or WebP.</Text>
          </View>
        </View>
        <GToyButton
          testID="teacher-photos-upload"
          label="Upload photos"
          icon="images-outline"
          size="md"
          fullWidth
          onPress={gallery.openUpload}
          accessibilityHint="Opens the upload sheet"
          style={styles.uploadButton}
        />
      </GCard>

      {gallery.photos.length === 0 && gallery.initialError ? (
        <GErrorCard
          title="We couldn't load photos"
          message={`${gallery.initialError} Check your connection, then try again.`}
          onRetry={() => void gallery.onPullRefresh()}
        />
      ) : gallery.initialError ? (
        <GInlineBanner
          tone="error"
          title="Couldn't refresh photos"
          description={`${gallery.initialError} You're seeing the last photos we loaded.`}
          action={<GOutlineButton label="Try again" icon="refresh" onPress={() => void gallery.onPullRefresh()} />}
        />
      ) : null}

      {gallery.photos.length === 0 && !gallery.initialError ? (
        <GCard index={1} title="No photos yet" testID="teacher-photos-empty">
          <Text style={gText.body}>Upload your first batch to share with families.</Text>
          <Text style={[gText.meta, styles.emptyMeta]}>Photos show up here by day, newest first.</Text>
        </GCard>
      ) : null}

      {gallery.photos.length > 0 ? (
        <>
          <View style={styles.galleryHead}>
            <Text accessibilityRole="header" style={styles.galleryTitle}>
              School gallery
            </Text>
            <GChip tone="neutral" icon="images-outline" label={photoCountLabel(gallery.photos.length, gallery.hasMore)} />
          </View>
          {ownCount > 0 ? (
            <View style={[styles.tip, { backgroundColor: accent.wash }]}>
              <View style={styles.youBadge}>
                <Text style={styles.youText}>You</Text>
              </View>
              <Text style={styles.tipText}>
                Press and hold a photo you uploaded to change its date or delete it.
              </Text>
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );

  if (gallery.loading && gallery.photos.length === 0) {
    return (
      <View style={styles.root} testID={TEST_ID}>
        <StatusBar style="dark" />
        <View style={styles.content} testID="photos-list-skeleton" accessibilityLabel="Loading photos">
          <View style={styles.header}>
            <GBackHeader
              backLabel="More"
              backAccessibilityLabel="Back to More"
              onBack={onBack}
              title="Photos"
              accentWord="Photos"
              subtitle={`Upload batches to share with families. ${OWN_PHOTOS_RULE}`}
            />
            <GSkeleton style={styles.skUpload} />
            <GSkeleton style={styles.skDay} />
            <PhotoGridSkeleton tileSize={tileSize} tiles={9} />
          </View>
        </View>
      </View>
    );
  }

  const footer =
    gallery.photos.length === 0 ? null : gallery.loadingMore ? (
      <PhotoGridSkeleton tileSize={tileSize} tiles={3} />
    ) : gallery.loadMoreError ? (
      <GInlineBanner
        tone="error"
        title="Couldn't load more photos"
        description={`${gallery.loadMoreError} Check your connection, then try again.`}
        action={<GOutlineButton label="Try again" icon="refresh" onPress={() => void gallery.loadMore()} />}
      />
    ) : !gallery.hasMore ? (
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
        data={gallery.groups}
        keyExtractor={(group) => group.photoDate}
        contentContainerStyle={styles.content}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        renderItem={({ item, index }) => (
          <PhotoDayGrid
            group={item}
            latest={index === 0}
            showCount={gallery.groups.length > 1}
            tileSize={tileSize}
            onOpenPhoto={gallery.openPhoto}
            onLongPressPhoto={gallery.showPhotoActions}
            tileBadge={tileBadge}
            tileHint={tileHint}
            tileTestIDPrefix="teacher-photo-tile"
          />
        )}
        onEndReached={gallery.handleEndReached}
        onEndReachedThreshold={0.6}
        initialNumToRender={4}
        windowSize={7}
        refreshControl={
          <RefreshControl
            refreshing={gallery.pullRefreshing}
            onRefresh={() => void gallery.onPullRefresh()}
            tintColor={accent.clay}
          />
        }
      />

      <ParentPhotoViewer
        organizationId={organizationId}
        photos={gallery.orderedPhotos}
        index={gallery.viewerIndex}
        visible={gallery.viewerVisible}
        hasMore={gallery.hasMore}
        onClose={gallery.closeViewer}
        onChangeIndex={gallery.setViewerIndex}
        onRequestMore={() => void gallery.loadMore()}
        testIDPrefix="teacher-photo-viewer"
        onPhotoOptions={viewerPhoto && canManagePhoto(viewerPhoto) ? viewerOptions : null}
      />

      <AdminPhotoUploadSheet visible={gallery.uploadOpen} upload={gallery.upload} onClose={gallery.closeUpload} />
      <GalleryPhotoActionSheet controller={gallery} cannotManageNote={OWN_PHOTOS_RULE} />
      <GalleryEditDateSheet controller={gallery} />

      <GCelebrate active={uploadedThisVisit && !gallery.readOnly} celebrationKey={`teacher-photos-upload-${slug}`} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  content: { paddingHorizontal: H_PADDING, paddingTop: 12, paddingBottom: 48, gap: 22 },
  header: { gap: 16 },
  uploadRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  uploadCopy: { flex: 1, minWidth: 0, gap: 4 },
  uploadButton: { marginTop: 14 },
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
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Garden.ink10,
  },
  youBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: Garden.butter,
    borderWidth: 1,
    borderColor: Garden.ink25,
  },
  youText: { fontFamily: GardenFonts.bodyExtra, fontSize: 11, color: Garden.ink },
  tipText: { flex: 1, fontFamily: GardenFonts.bodySemi, fontSize: 13.5, lineHeight: 19, color: Garden.ink },
  skUpload: { height: 150, borderRadius: 24 },
  skDay: { height: 18, width: '40%', borderRadius: 6 },
  endRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  endRule: { flex: 1 },
  endText: { fontFamily: GardenFonts.bodyBold, fontSize: 12.5, color: Garden.soft },
});
