"use client";

import { useMemo, useState } from "react";
import GalleryLoadMoreFooter from "@/components/school-gallery/GalleryLoadMoreFooter";
import GalleryPhotoViewer from "@/components/school-gallery/GalleryPhotoViewer";
import GalleryThumbnail from "@/components/school-gallery/GalleryThumbnail";
import { formatGalleryDateLabel } from "@/lib/school-gallery/format-gallery-date";
import { groupGalleryPhotosByDate } from "@/lib/school-gallery/group-gallery-photos";
import { galleryPhotoGridClassName } from "@/components/school-gallery/GalleryPhotoGridSkeleton";
import type { GalleryPhoto } from "@/lib/school-gallery/types";

type SchoolGalleryViewProps = {
  photos: GalleryPhoto[];
  emptyMessage?: string;
  initialError?: string | null;
  onRetryInitial?: () => void;
  loadMoreError?: string | null;
  onRetryLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  loadMoreRef?: React.RefObject<HTMLDivElement | null>;
  onRequestMore?: () => Promise<void>;
};

export default function SchoolGalleryView({
  photos,
  emptyMessage = "No photos yet.",
  initialError = null,
  onRetryInitial,
  loadMoreError = null,
  onRetryLoadMore,
  hasMore = false,
  loadingMore = false,
  loadMoreRef,
  onRequestMore,
}: SchoolGalleryViewProps) {
  const groups = useMemo(() => groupGalleryPhotosByDate(photos), [photos]);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const openPhoto = (photoId: string) => {
    const index = photos.findIndex((photo) => photo.id === photoId);
    if (index >= 0) setViewerIndex(index);
  };

  if (groups.length === 0) {
    if (initialError) {
      return (
        <div
          className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#D8DEDF] bg-white/60 px-6 py-12 text-center"
        >
          <p className="text-sm text-[#65747A]">{initialError}</p>
          {onRetryInitial ? (
            <button
              type="button"
              className="rounded-lg border border-[#D8DEDF] bg-white px-4 py-2 text-sm font-medium text-[#1F2A2E] hover:bg-[#F3F5F6]"
              onClick={() => onRetryInitial()}
            >
              Try again
            </button>
          ) : null}
        </div>
      );
    }

    return (
      <p className="rounded-2xl border border-dashed border-[#D8DEDF] bg-white/60 px-6 py-12 text-center text-sm text-[#65747A]">
        {emptyMessage}
      </p>
    );
  }

  return (
    <>
      <div className="space-y-10">
        {groups.map((group) => (
          <section key={group.photoDate}>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#65747A]">
              {formatGalleryDateLabel(group.photoDate)}
            </h2>
            <div className={galleryPhotoGridClassName}>
              {group.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-square overflow-hidden bg-[#F3F5F6]"
                >
                  <GalleryThumbnail
                    src={photo.imageUrl}
                    alt={photo.fileName}
                    onClick={() => openPhoto(photo.id)}
                    disabled={!photo.imageUrl}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {loadMoreRef ? (
        <GalleryLoadMoreFooter
          loadMoreRef={loadMoreRef}
          loadingMore={loadingMore}
          error={loadMoreError}
          onRetry={onRetryLoadMore}
        />
      ) : null}

      {viewerIndex != null ? (
        <GalleryPhotoViewer
          key={viewerIndex}
          items={photos}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          hasMore={hasMore}
          onRequestMore={onRequestMore}
        />
      ) : null}
    </>
  );
}
