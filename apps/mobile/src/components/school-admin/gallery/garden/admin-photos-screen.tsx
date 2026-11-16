import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { closeThen, confirmDestructive, useGardenPullRefresh, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { GDateField, GInlineBanner } from '@/components/parent/garden/fields';
import { GSheet } from '@/components/parent/garden/sheet';
import { Garden, GardenFonts, PORTAL_EASE } from '@/components/parent/garden/tokens';
import { GKicker, GLink, GOutlineButton, GPressable, GSkeleton, GToyButton } from '@/components/parent/garden/ui';
import { AdminPhotoPermissionsSheet } from '@/components/school-admin/gallery/garden/admin-photo-permissions-sheet';
import { AdminPhotoUploadSheet } from '@/components/school-admin/gallery/garden/admin-photo-upload-sheet';
import { GalleryPhotoGrid } from '@/components/school-admin/gallery/gallery-photo-grid';
import { GalleryPhotoGridSkeleton } from '@/components/school-admin/gallery/gallery-photo-grid-skeleton';
import {
  GalleryPhotoViewerModal,
  type GalleryPhotoViewerState,
} from '@/components/school-admin/gallery/gallery-photo-viewer-modal';
import { AdminTabHeader, useAdminTopBleed } from '@/components/school-admin/garden/admin-tab-header';
import { AdminEmptyPanel, AdminToolbarButton, AdminWorkRow } from '@/components/school-admin/garden/admin-ui';
import { useAdminAction } from '@/components/school-admin/garden/use-admin-action';
import { haptic } from '@/lib/haptics';
import { formatGalleryDateLabel } from '@/lib/school-gallery/format-gallery-date';
import {
  deleteGalleryPhoto,
  formatGalleryApiError,
  listGalleryPhotos,
  patchGalleryPhotoDate,
  uploadGalleryBatch,
} from '@/lib/school-gallery/gallery-api';
import { groupGalleryPhotosByDate } from '@/lib/school-gallery/group-gallery-photos';
import type { GalleryPhoto } from '@/lib/school-gallery/types';
import { useGalleryPhotosFeed } from '@/lib/school-gallery/use-gallery-photos-feed';
import { useGalleryUpload } from '@/lib/school-gallery/use-gallery-upload';

const OP = 'school_admin_gallery';

type Props = { organizationId: string; slug: string; schoolName: string };

/**
 * School admin › More › Photos (Garden). Same feed, upload pipeline, delete /
 * bulk delete / edit date calls and `school_admin_gallery_*` operations as the
 * shared Story gallery screen (which the teacher portal still uses).
 */
export function PhotosScreen({ organizationId, slug }: Props) {
  const bleed = useAdminTopBleed();
  const action = useAdminAction(organizationId);
  const { reportError, toast } = action;
  const { readOnly, notifyReadOnly } = useGardenReadOnlyGate();

  const listPage = useCallback((offset: number) => listGalleryPhotos(slug, offset), [slug]);
  const onLoadError = useCallback(
    (error: unknown, phase: 'initial' | 'load_more') => reportError(phase === 'initial' ? `${OP}_list` : `${OP}_load_more`, error),
    [reportError],
  );
  const { photos, loading, loadingMore, initialError, loadMoreError, hasMore, loadMore, prependPhotos, replacePhoto, removePhoto, reload } =
    useGalleryPhotosFeed({ listPage, onLoadError });

  const [uploadOpen, setUploadOpen] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [viewerSession, setViewerSession] = useState<{ photoId: string } | null>(null);
  const [actionPhoto, setActionPhoto] = useState<GalleryPhoto | null>(null);
  const [editPhoto, setEditPhoto] = useState<GalleryPhoto | null>(null);
  const [editDateValue, setEditDateValue] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [savingDate, setSavingDate] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !initialError) queueMicrotask(() => setLastUpdatedAt(Date.now()));
  }, [initialError, loading]);

  const upload = useGalleryUpload({
    organizationId,
    onUploaded: prependPhotos,
    uploadBatch: useCallback((photoDate, files, options) => uploadGalleryBatch(slug, photoDate, files, options), [slug]),
    uploadOperation: `${OP}_upload`,
    uploadSurface: 'school_admin',
    onComplete: ({ uploadedCount, photoDate }) => {
      closeThen(
        () => setUploadOpen(false),
        () =>
          toast.success(`${uploadedCount} photo${uploadedCount === 1 ? '' : 's'} uploaded`, {
            id: 'gallery-upload',
            description: `Added to ${formatGalleryDateLabel(photoDate)}. Families can see them now.`,
          }),
      );
    },
  });

  const groups = useMemo(() => groupGalleryPhotosByDate(photos), [photos]);

  const viewerPayload = useMemo((): GalleryPhotoViewerState | null => {
    if (!viewerSession) return null;
    const index = photos.findIndex((entry) => entry.id === viewerSession.photoId);
    return index < 0 ? null : { photos, index };
  }, [viewerSession, photos]);

  useEffect(() => {
    if (viewerSession && !photos.some((entry) => entry.id === viewerSession.photoId)) {
      queueMicrotask(() => setViewerSession(null));
    }
  }, [photos, viewerSession]);

  const loadingMoreRef = useRef(loadingMore);
  const hasMoreRef = useRef(hasMore);
  const loadMoreErrorRef = useRef(loadMoreError);
  useEffect(() => {
    loadingMoreRef.current = loadingMore;
    hasMoreRef.current = hasMore;
    loadMoreErrorRef.current = loadMoreError;
  }, [hasMore, loadMoreError, loadingMore]);

  useFocusEffect(
    useCallback(
      () => () => {
        setSelectionMode(false);
        setSelectedIds(new Set());
      },
      [],
    ),
  );

  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh: reload,
    error: initialError,
    label: 'Photos',
    id: 'admin-photos-refresh',
  });

  const exitSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const openPhoto = useCallback(
    (photo: GalleryPhoto) => {
      if (selectionMode) {
        haptic.select();
        setSelectedIds((current) => {
          const next = new Set(current);
          if (next.has(photo.id)) next.delete(photo.id);
          else next.add(photo.id);
          return next;
        });
        return;
      }
      if (photos.some((entry) => entry.id === photo.id)) setViewerSession({ photoId: photo.id });
    },
    [photos, selectionMode],
  );

  const showPhotoActions = useCallback(
    (photo: GalleryPhoto) => {
      if (selectionMode) return;
      haptic.select();
      setActionPhoto(photo);
    },
    [selectionMode],
  );

  const deletePhoto = useCallback(
    async (photo: GalleryPhoto) => {
      if (readOnly) return notifyReadOnly();
      const ok = await confirmDestructive({ title: 'Delete photo?', message: `Delete "${photo.fileName}"?` });
      if (!ok) return;
      void action.run(
        async () => {
          await deleteGalleryPhoto(slug, photo.id);
          removePhoto(photo.id);
          setViewerSession((current) => {
            if (!current || current.photoId !== photo.id) return current;
            const deletedIndex = photos.findIndex((entry) => entry.id === photo.id);
            if (deletedIndex < 0) return null;
            const adjacent = photos[deletedIndex + 1] ?? photos[deletedIndex - 1];
            return adjacent ? { photoId: adjacent.id } : null;
          });
        },
        {
          key: `gallery-delete-${photo.id}`,
          operation: `${OP}_delete`,
          retry: true,
          success: { title: 'Photo deleted', description: 'Families no longer see it.' },
          error: (err) => ({ title: 'Could not delete', description: `${formatGalleryApiError(err, 'Could not delete photo.')} The photo is still there.` }),
        },
      );
    },
    [action, notifyReadOnly, photos, readOnly, removePhoto, slug],
  );

  const deleteSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;
    if (readOnly) return notifyReadOnly();
    const ids = [...selectedIds];
    const ok = await confirmDestructive({ title: 'Delete selected?', message: `Delete ${ids.length} selected photo(s)?` });
    if (!ok) return;
    let deleted = 0;
    setBulkProgress({ done: 0, total: ids.length });
    await action.run(
      async () => {
        for (const id of ids) {
          await deleteGalleryPhoto(slug, id);
          removePhoto(id);
          deleted += 1;
          setBulkProgress({ done: deleted, total: ids.length });
        }
        exitSelection();
        setViewerSession(null);
      },
      {
        key: 'gallery-bulk-delete',
        operation: `${OP}_bulk_delete`,
        success: { title: `${ids.length} photo${ids.length === 1 ? '' : 's'} deleted`, description: 'Families no longer see them.' },
        error: (err) => ({
          title: 'Could not delete',
          description: `${formatGalleryApiError(err, 'Could not delete photos.')} ${deleted} of ${ids.length} were deleted; the rest are still selected.`,
        }),
      },
    );
    setSelectedIds((current) => new Set([...current].filter((id) => ids.indexOf(id) >= deleted)));
    setBulkProgress(null);
  }, [action, exitSelection, notifyReadOnly, readOnly, removePhoto, selectedIds, slug]);

  const openEditDate = useCallback((photo: GalleryPhoto) => {
    setEditError(null);
    setEditPhoto(photo);
    setEditDateValue(photo.photoDate);
  }, []);

  const saveDate = useCallback(async () => {
    if (!editPhoto) return;
    const nextDate = editDateValue.trim();
    if (!nextDate || nextDate === editPhoto.photoDate) {
      setEditPhoto(null);
      return;
    }
    if (readOnly) return notifyReadOnly();
    setSavingDate(true);
    setEditError(null);
    try {
      const updated = await patchGalleryPhotoDate(slug, editPhoto.id, nextDate);
      replacePhoto(updated);
      action.flash(`gallery-date-${editPhoto.id}`);
      closeThen(
        () => setEditPhoto(null),
        () => toast.success('Photo date updated', { id: 'gallery-edit-date', description: `Moved to ${formatGalleryDateLabel(nextDate)}.` }),
      );
    } catch (error) {
      reportError(`${OP}_edit_date`, error);
      haptic.error();
      setEditError(`${formatGalleryApiError(error, 'Could not update photo date.')} The date hasn't changed.`);
    } finally {
      setSavingDate(false);
    }
  }, [action, editDateValue, editPhoto, notifyReadOnly, readOnly, replacePhoto, reportError, slug, toast]);

  const handleEndReached = useCallback(() => {
    if (loadingMoreRef.current || !hasMoreRef.current || loadMoreErrorRef.current) return;
    void loadMore();
  }, [loadMore]);

  const openUpload = useCallback(() => {
    if (readOnly) return notifyReadOnly();
    setUploadOpen(true);
  }, [notifyReadOnly, readOnly]);

  const statusLine =
    photos.length === 0
      ? 'No photos yet'
      : `${photos.length}${hasMore ? '+' : ''} photo${photos.length === 1 ? '' : 's'} · newest ${formatGalleryDateLabel(groups[0]?.photoDate ?? '')}`;

  if (loading && photos.length === 0) {
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
        refreshControl={<RefreshControl refreshing={pullRefreshing} onRefresh={() => void onPullRefresh()} tintColor={Garden.soft} />}
        contentContainerStyle={styles.scroll}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          if (contentSize.height - layoutMeasurement.height - contentOffset.y < 240) handleEndReached();
        }}
        scrollEventThrottle={200}>
        <View style={styles.top}>
          <AdminTabHeader
            title="Photos"
            accentWord="Photos"
            statusLine={statusLine}
            lastUpdatedAt={lastUpdatedAt}
            statusTestID="photos-status-line"
            toolbar={
              <AdminToolbarButton icon="cloud-upload-outline" label="Upload" accessibilityLabel="Upload photos" onPress={openUpload} testID="photos-upload" />
            }
          />
          <View style={styles.actions}>
            <GOutlineButton label="Photo permissions" icon="shield-checkmark-outline" onPress={() => setPermissionsOpen(true)} />
            {!selectionMode && photos.length > 0 ? (
              <GOutlineButton
                label="Select"
                icon="checkmark-circle-outline"
                onPress={() => {
                  if (photos.length === 0) return;
                  haptic.select();
                  setSelectionMode(true);
                }}
                accessibilityHint={photos.length === 0 ? 'No photos to select yet' : 'Tap photos to choose which to delete'}
              />
            ) : null}
          </View>
          {selectionMode ? <Text style={styles.hint}>Tap photos to select them, then delete them together.</Text> : null}
          {initialError ? (
            <GInlineBanner
              tone="error"
              title="Couldn't load photos"
              description={initialError}
              action={<GLink label="Try again" icon="refresh" onPress={() => void onPullRefresh()} />}
            />
          ) : null}
        </View>

        {groups.length === 0 && !initialError ? (
          <View style={styles.pad}>
            <AdminEmptyPanel
              icon="images-outline"
              title="No photos yet"
              body="Upload your first batch to get started."
              actionLabel="Upload photos"
              onAction={openUpload}
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
                  onPressPhoto={openPhoto}
                  onLongPressPhoto={showPhotoActions}
                />
              </View>
            ))}
          </View>
        )}

        {loadingMore ? <GalleryPhotoGridSkeleton tileCount={3} /> : null}
        {loadMoreError ? (
          <View style={styles.pad}>
            <GInlineBanner
              tone="error"
              title="Couldn't load more photos"
              description={loadMoreError}
              action={<GLink label="Try again" icon="refresh" onPress={() => void loadMore()} />}
            />
          </View>
        ) : null}
      </ScrollView>

      {selectionMode ? (
        <Animated.View entering={FadeInDown.duration(220).easing(PORTAL_EASE)} exiting={FadeOutDown.duration(160)} style={styles.selectBar}>
          <Text style={styles.selectCount} accessibilityLiveRegion="polite">
            {bulkProgress ? `Deleting ${bulkProgress.done} of ${bulkProgress.total}…` : `${selectedIds.size} selected`}
          </Text>
          <GOutlineButton label="Cancel" onPress={exitSelection} />
          <GPressable
            accessibilityLabel={`Delete ${selectedIds.size} selected`}
            accessibilityState={{ disabled: selectedIds.size === 0 || bulkProgress != null, busy: bulkProgress != null }}
            disabled={selectedIds.size === 0 || bulkProgress != null}
            onPress={() => void deleteSelected()}
            style={[styles.deleteBtn, (selectedIds.size === 0 || bulkProgress != null) && styles.dim]}>
            <Text style={styles.deleteLabel}>Delete selected</Text>
          </GPressable>
        </Animated.View>
      ) : null}

      <AdminPhotoUploadSheet visible={uploadOpen} upload={upload} onClose={() => setUploadOpen(false)} />

      <GSheet
        visible={actionPhoto != null}
        onClose={() => setActionPhoto(null)}
        title={actionPhoto?.fileName ?? 'Photo'}
        subtitle={actionPhoto ? formatGalleryDateLabel(actionPhoto.photoDate) : undefined}>
        {actionPhoto ? (
          <>
            <AdminWorkRow
              icon="expand-outline"
              tint={Garden.sky}
              title="View"
              onPress={() => {
                const photo = actionPhoto;
                closeThen(() => setActionPhoto(null), () => openPhoto(photo));
              }}
            />
            <AdminWorkRow
              divider
              icon="calendar-outline"
              tint={Garden.butter}
              title="Edit date"
              meta="Move it to a different day"
              onPress={() => {
                const photo = actionPhoto;
                closeThen(() => setActionPhoto(null), () => openEditDate(photo));
              }}
            />
            <AdminWorkRow
              divider
              icon="trash-outline"
              tint={Garden.peach}
              title="Delete"
              meta="Families stop seeing it"
              onPress={() => {
                const photo = actionPhoto;
                closeThen(() => setActionPhoto(null), () => void deletePhoto(photo));
              }}
            />
          </>
        ) : null}
      </GSheet>

      <GSheet
        visible={editPhoto != null}
        onClose={() => (savingDate ? undefined : setEditPhoto(null))}
        title="Photo date"
        subtitle={editPhoto?.fileName}
        footer={
          <GToyButton
            label={savingDate ? 'Saving…' : 'Save'}
            icon="checkmark"
            loading={savingDate}
            disabled={savingDate}
            fullWidth
            onPress={() => void saveDate()}
          />
        }>
        <View style={styles.editBody}>
          <GDateField label="Photo date" value={editDateValue} onChange={setEditDateValue} disabled={savingDate} />
          {editError ? <GInlineBanner tone="error" title="Couldn't update the date" description={editError} /> : null}
        </View>
      </GSheet>

      <AdminPhotoPermissionsSheet visible={permissionsOpen} organizationId={organizationId} onClose={() => setPermissionsOpen(false)} />

      <GalleryPhotoViewerModal
        organizationId={organizationId}
        visible={viewerPayload != null}
        viewerState={viewerPayload}
        hasMore={hasMore}
        onClose={() => setViewerSession(null)}
        onChangeIndex={(index) => {
          const active = photos[index];
          if (active) setViewerSession({ photoId: active.id });
        }}
        onRequestMore={loadMore}
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
  editBody: { gap: 14 },
  skeleton: { paddingHorizontal: 16, paddingTop: 8, gap: 12, marginBottom: 14 },
  skTitle: { width: '40%', height: 32, borderRadius: 10, marginTop: 6 },
  skStatus: { width: '70%', height: 16, borderRadius: 8 },
  skActions: { width: '80%', height: 44, borderRadius: 22 },
});
