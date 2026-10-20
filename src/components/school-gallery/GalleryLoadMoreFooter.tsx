"use client";

import type { RefObject } from "react";
import GalleryPhotoGridSkeleton from "@/components/school-gallery/GalleryPhotoGridSkeleton";

type GalleryLoadMoreFooterProps = {
  loadMoreRef: RefObject<HTMLDivElement | null>;
  loadingMore: boolean;
  error?: string | null;
  onRetry?: () => void;
};

export default function GalleryLoadMoreFooter({
  loadMoreRef,
  loadingMore,
  error = null,
  onRetry,
}: GalleryLoadMoreFooterProps) {
  return (
    <>
      <div ref={loadMoreRef} className="h-6 w-full" aria-hidden />
      {loadingMore ? <GalleryPhotoGridSkeleton count={6} /> : null}
      {error && !loadingMore ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-sm text-[#65747A]">{error}</p>
          {onRetry ? (
            <button
              type="button"
              className="rounded-lg border border-[#D8DEDF] bg-white px-4 py-2 text-sm font-medium text-[#1F2A2E] hover:bg-[#F3F5F6]"
              onClick={() => onRetry()}
            >
              Try again
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
