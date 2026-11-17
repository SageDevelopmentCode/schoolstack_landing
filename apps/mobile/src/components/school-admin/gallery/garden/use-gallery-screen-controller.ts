import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { closeThen, confirmDestructive, useGardenPullRefresh, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { useAdminAction } from '@/components/school-admin/garden/use-admin-action';
import { haptic } from '@/lib/haptics';
import { formatGalleryDateLabel } from '@/lib/school-gallery/format-gallery-date';
import {
  formatGalleryApiError,
  type GalleryBatchUploadOptions,
  type PreparedGalleryUploadFile,
} from '@/lib/school-gallery/gallery-api';
import { groupGalleryPhotosByDate } from '@/lib/school-gallery/group-gallery-photos';
import type { GalleryPhoto, GalleryPhotosPage } from '@/lib/school-gallery/types';
import { useGalleryPhotosFeed } from '@/lib/school-gallery/use-gallery-photos-feed';
import { useGalleryUpload, type UseGalleryUploadOptions } from '@/lib/school-gallery/use-gallery-upload';

export type GalleryScreenApi = {
  listPage: (offset: number) => Promise<GalleryPhotosPage>;
  uploadBatch: (
    photoDate: string,
    files: PreparedGalleryUploadFile[],
    options?: GalleryBatchUploadOptions,
  ) => Promise<GalleryPhoto[]>;
  patchDate: (photoId: string, photoDate: string) => Promise<GalleryPhoto>;
  deletePhotoById: (photoId: string) => Promise<void>;
};

/**
 * School gallery screen logic shared by the admin and teacher Garden Photos
 * screens: feed + paging, upload, viewer session (in grid order), long-press
 * actions, delete / bulk delete, edit date, pull to refresh and read-only gating.
 * Operations are `${operationPrefix}_list | _load_more | _upload | _delete |
 * _bulk_delete | _edit_date`, so each portal keeps its own names.
 */
export function useGalleryScreenController({
  organizationId,
  operationPrefix,
  uploadSurface,
  api,
  canManagePhoto,
  refreshToastId,
  onUploadComplete,
}: {
  organizationId: string;
  operationPrefix: string;
  uploadSurface: UseGalleryUploadOptions['uploadSurface'];
  api: GalleryScreenApi;
  canManagePhoto: (photo: GalleryPhoto) => boolean;
  refreshToastId: string;
  onUploadComplete?: (uploadedCount: number) => void;
}) {
  const OP = operationPrefix;
  const action = useAdminAction(organizationId);
  const { reportError, toast } = action;
  const { readOnly, notifyReadOnly } = useGardenReadOnlyGate();

  const onLoadError = useCallback(
    (error: unknown, phase: 'initial' | 'load_more') =>
      reportError(phase === 'initial' ? `${OP}_list` : `${OP}_load_more`, error),
    [OP, reportError],
  );
  const { photos, loading, loadingMore, initialError, loadMoreError, hasMore, loadMore, prependPhotos, replacePhoto, removePhoto, reload } =
    useGalleryPhotosFeed({ listPage: api.listPage, onLoadError });

  const [uploadOpen, setUploadOpen] = useState(false);
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
    uploadBatch: api.uploadBatch,
    uploadOperation: `${OP}_upload`,
    uploadSurface,
    onComplete: ({ uploadedCount, photoDate }) => {
      closeThen(
        () => setUploadOpen(false),
        () => {
          toast.success(`${uploadedCount} photo${uploadedCount === 1 ? '' : 's'} uploaded`, {
            id: 'gallery-upload',
            description: `Added to ${formatGalleryDateLabel(photoDate)}. Families can see them now.`,
          });
          onUploadComplete?.(uploadedCount);
        },
      );
    },
  });

  const groups = useMemo(() => groupGalleryPhotosByDate(photos), [photos]);
  /** The viewer swipes in the same order as the grid. */
  const orderedPhotos = useMemo(() => groups.flatMap((group) => group.photos), [groups]);

  const viewerIndex = useMemo(() => {
    if (!viewerSession) return -1;
    return orderedPhotos.findIndex((entry) => entry.id === viewerSession.photoId);
  }, [orderedPhotos, viewerSession]);

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
    id: refreshToastId,
  });

  const exitSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const startSelection = useCallback(() => {
    if (photos.length === 0) return;
    haptic.select();
    setSelectionMode(true);
  }, [photos.length]);

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
      if (!canManagePhoto(photo)) return;
      const ok = await confirmDestructive({ title: 'Delete photo?', message: `Delete "${photo.fileName}"?` });
      if (!ok) return;
      void action.run(
        async () => {
          await api.deletePhotoById(photo.id);
          removePhoto(photo.id);
          setViewerSession((current) => {
            if (!current || current.photoId !== photo.id) return current;
            const deletedIndex = orderedPhotos.findIndex((entry) => entry.id === photo.id);
            if (deletedIndex < 0) return null;
            const adjacent = orderedPhotos[deletedIndex + 1] ?? orderedPhotos[deletedIndex - 1];
            return adjacent ? { photoId: adjacent.id } : null;
          });
        },
        {
          key: `gallery-delete-${photo.id}`,
          operation: `${OP}_delete`,
          retry: true,
          success: { title: 'Photo deleted', description: 'Families no longer see it.' },
          error: (err) => ({
            title: 'Could not delete',
            description: `${formatGalleryApiError(err, 'Could not delete photo.')} The photo is still there.`,
          }),
        },
      );
    },
    [OP, action, api, canManagePhoto, notifyReadOnly, orderedPhotos, readOnly, removePhoto],
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
          await api.deletePhotoById(id);
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
  }, [OP, action, api, exitSelection, notifyReadOnly, readOnly, removePhoto, selectedIds]);

  const openEditDate = useCallback(
    (photo: GalleryPhoto) => {
      if (!canManagePhoto(photo)) return;
      setEditError(null);
      setEditPhoto(photo);
      setEditDateValue(photo.photoDate);
    },
    [canManagePhoto],
  );

  const closeEditDate = useCallback(() => {
    if (!savingDate) setEditPhoto(null);
  }, [savingDate]);

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
      const updated = await api.patchDate(editPhoto.id, nextDate);
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
  }, [OP, action, api, editDateValue, editPhoto, notifyReadOnly, readOnly, replacePhoto, reportError, toast]);

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

  return {
    readOnly,
    photos,
    orderedPhotos,
    groups,
    loading,
    loadingMore,
    initialError,
    loadMoreError,
    hasMore,
    loadMore,
    handleEndReached,
    lastUpdatedAt,
    statusLine,
    pullRefreshing,
    onPullRefresh,

    upload,
    uploadOpen,
    openUpload,
    closeUpload: useCallback(() => setUploadOpen(false), []),

    selectionMode,
    selectedIds,
    bulkProgress,
    startSelection,
    exitSelection,
    deleteSelected,

    viewerVisible: viewerIndex >= 0,
    viewerIndex: Math.max(0, viewerIndex),
    closeViewer: useCallback(() => setViewerSession(null), []),
    setViewerIndex: useCallback(
      (index: number) => {
        const active = orderedPhotos[index];
        if (active) setViewerSession({ photoId: active.id });
      },
      [orderedPhotos],
    ),
    openPhoto,

    actionPhoto,
    showPhotoActions,
    closePhotoActions: useCallback(() => setActionPhoto(null), []),
    canManagePhoto,
    deletePhoto,

    editPhoto,
    editDateValue,
    setEditDateValue,
    editError,
    savingDate,
    openEditDate,
    closeEditDate,
    saveDate,
  };
}

export type GalleryScreenController = ReturnType<typeof useGalleryScreenController>;
