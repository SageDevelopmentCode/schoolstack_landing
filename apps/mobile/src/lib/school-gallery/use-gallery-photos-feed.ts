import { useCallback, useEffect, useRef, useState } from 'react';

import type { GalleryPhoto, GalleryPhotosPage } from '@/lib/school-gallery/types';

function messageFromError(error: unknown): string {
  return error instanceof Error ? error.message : 'Could not load photos.';
}

export type GalleryPhotosFeedLoadPhase = 'initial' | 'load_more';

export function useGalleryPhotosFeed(options: {
  enabled?: boolean;
  listPage: (offset: number) => Promise<GalleryPhotosPage>;
  onLoadError?: (error: unknown, phase: GalleryPhotosFeedLoadPhase) => void;
}) {
  const { enabled = true, listPage, onLoadError } = options;
  const onLoadErrorRef = useRef(onLoadError);

  useEffect(() => {
    onLoadErrorRef.current = onLoadError;
  }, [onLoadError]);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextOffset, setNextOffset] = useState(0);
  const [initialError, setInitialError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const photosRef = useRef(photos);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  const fetchPage = useCallback(
    async (offset: number, append: boolean) => {
      const page = await listPage(offset);
      setPhotos((current) => (append ? [...current, ...page.photos] : page.photos));
      setHasMore(page.hasMore);
      setNextOffset(page.nextOffset);
      if (append) {
        setLoadMoreError(null);
      } else {
        setInitialError(null);
      }
    },
    [listPage],
  );

  const loadInitial = useCallback(async () => {
    if (!enabled) return;
    setInitialError(null);
    setLoading(true);
    try {
      await fetchPage(0, false);
    } catch (error) {
      onLoadErrorRef.current?.(error, 'initial');
      setInitialError(messageFromError(error));
    } finally {
      setLoading(false);
    }
  }, [enabled, fetchPage]);

  const loadMore = useCallback(async () => {
    if (!enabled || !hasMore || loadingMore) return;
    setLoadMoreError(null);
    setLoadingMore(true);
    try {
      await fetchPage(nextOffset, true);
    } catch (error) {
      onLoadErrorRef.current?.(error, 'load_more');
      setLoadMoreError(messageFromError(error));
    } finally {
      setLoadingMore(false);
    }
  }, [enabled, fetchPage, hasMore, loadingMore, nextOffset]);

  const prependPhotos = useCallback((uploaded: GalleryPhoto[]) => {
    if (uploaded.length === 0) return;
    setPhotos((current) => [...uploaded, ...current]);
    setNextOffset((offset) => offset + uploaded.length);
  }, []);

  const replacePhoto = useCallback((photo: GalleryPhoto) => {
    setPhotos((current) => current.map((entry) => (entry.id === photo.id ? photo : entry)));
  }, []);

  const removePhoto = useCallback((photoId: string) => {
    if (!photosRef.current.some((photo) => photo.id === photoId)) return;
    setPhotos((current) => current.filter((photo) => photo.id !== photoId));
    setNextOffset((offset) => Math.max(0, offset - 1));
  }, []);

  useEffect(() => {
    if (!enabled) return;
    queueMicrotask(() => {
      void loadInitial();
    });
  }, [enabled, loadInitial]);

  return {
    photos,
    loading,
    loadingMore,
    initialError,
    loadMoreError,
    hasMore,
    loadMore,
    prependPhotos,
    replacePhoto,
    removePhoto,
    reload: loadInitial,
  };
}
