"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryPhoto } from "@/lib/school-gallery/types";

export type GalleryPhotosFeedInitial = {
  photos: GalleryPhoto[];
  hasMore: boolean;
  nextOffset: number;
};

type GalleryPageResponse = {
  photos?: GalleryPhoto[];
  hasMore?: boolean;
  nextOffset?: number;
  error?: string;
};

function messageFromError(error: unknown): string {
  return error instanceof Error ? error.message : "Could not load photos.";
}

export function useGalleryPhotosFeed(options: {
  listUrl: string | null;
  enabled?: boolean;
  initial?: GalleryPhotosFeedInitial | null;
}) {
  const { listUrl, enabled = true, initial } = options;
  const [photos, setPhotos] = useState<GalleryPhoto[]>(initial?.photos ?? []);
  const [loading, setLoading] = useState(enabled && !initial);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initial?.hasMore ?? false);
  const [nextOffset, setNextOffset] = useState(initial?.nextOffset ?? 0);
  const [initialError, setInitialError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);
  const loadMoreErrorRef = useRef(false);
  const photosRef = useRef(photos);

  useEffect(() => {
    loadingMoreRef.current = loadingMore;
  }, [loadingMore]);

  useEffect(() => {
    loadMoreErrorRef.current = Boolean(loadMoreError);
  }, [loadMoreError]);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  const fetchPage = useCallback(
    async (offset: number, append: boolean) => {
      if (!listUrl) return;

      const url = new URL(listUrl, window.location.origin);
      url.searchParams.set("offset", String(offset));

      const response = await fetch(url.toString());
      const data = (await response.json()) as GalleryPageResponse;
      if (!response.ok) {
        throw new Error(data.error ?? "Could not load photos.");
      }

      const pagePhotos = data.photos ?? [];
      setPhotos((current) =>
        append ? [...current, ...pagePhotos] : pagePhotos,
      );
      setHasMore(Boolean(data.hasMore));
      setNextOffset(
        typeof data.nextOffset === "number"
          ? data.nextOffset
          : offset + pagePhotos.length,
      );
      if (append) {
        setLoadMoreError(null);
      } else {
        setInitialError(null);
      }
    },
    [listUrl],
  );

  const loadInitial = useCallback(async () => {
    if (!listUrl || !enabled) return;
    setInitialError(null);
    setLoading(true);
    try {
      await fetchPage(0, false);
    } catch (error) {
      setInitialError(messageFromError(error));
    } finally {
      setLoading(false);
    }
  }, [enabled, fetchPage, listUrl]);

  const loadMore = useCallback(async () => {
    if (!listUrl || !enabled || !hasMore || loadingMore) return;
    setLoadMoreError(null);
    setLoadingMore(true);
    try {
      await fetchPage(nextOffset, true);
    } catch (error) {
      setLoadMoreError(messageFromError(error));
    } finally {
      setLoadingMore(false);
    }
  }, [enabled, fetchPage, hasMore, listUrl, loadingMore, nextOffset]);

  const prependPhotos = useCallback((uploaded: GalleryPhoto[]) => {
    if (uploaded.length === 0) return;
    setPhotos((current) => [...uploaded, ...current]);
    setNextOffset((offset) => offset + uploaded.length);
  }, []);

  const replacePhoto = useCallback((photo: GalleryPhoto) => {
    setPhotos((current) =>
      current.map((entry) => (entry.id === photo.id ? photo : entry)),
    );
  }, []);

  const removePhoto = useCallback((photoId: string) => {
    if (!photosRef.current.some((photo) => photo.id === photoId)) return;
    setPhotos((current) => current.filter((photo) => photo.id !== photoId));
    setNextOffset((offset) => Math.max(0, offset - 1));
  }, []);

  useEffect(() => {
    if (initial || !enabled) return;
    queueMicrotask(() => {
      void loadInitial();
    });
  }, [enabled, initial, loadInitial]);

  useEffect(() => {
    if (!enabled || !hasMore) return;
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (loadingMoreRef.current) return;
        if (loadMoreErrorRef.current) return;
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [enabled, hasMore, loadMore, loadingMore, photos.length]);

  return {
    photos,
    setPhotos,
    loading,
    loadingMore,
    initialError,
    loadMoreError,
    hasMore,
    loadMore,
    loadMoreRef,
    prependPhotos,
    replacePhoto,
    removePhoto,
    reload: loadInitial,
  };
}
