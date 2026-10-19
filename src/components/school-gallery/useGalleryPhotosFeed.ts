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
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);
  loadingMoreRef.current = loadingMore;

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
    },
    [listUrl],
  );

  const loadInitial = useCallback(async () => {
    if (!listUrl || !enabled) return;
    setLoading(true);
    try {
      await fetchPage(0, false);
    } finally {
      setLoading(false);
    }
  }, [enabled, fetchPage, listUrl]);

  const loadMore = useCallback(async () => {
    if (!listUrl || !enabled || !hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      await fetchPage(nextOffset, true);
    } finally {
      setLoadingMore(false);
    }
  }, [enabled, fetchPage, hasMore, listUrl, loadingMore, nextOffset]);

  const prependPhotos = useCallback((uploaded: GalleryPhoto[]) => {
    setPhotos((current) => [...uploaded, ...current]);
  }, []);

  const replacePhoto = useCallback((photo: GalleryPhoto) => {
    setPhotos((current) =>
      current.map((entry) => (entry.id === photo.id ? photo : entry)),
    );
  }, []);

  const removePhoto = useCallback((photoId: string) => {
    setPhotos((current) => current.filter((photo) => photo.id !== photoId));
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
    hasMore,
    loadMore,
    loadMoreRef,
    prependPhotos,
    replacePhoto,
    removePhoto,
    reload: loadInitial,
  };
}
