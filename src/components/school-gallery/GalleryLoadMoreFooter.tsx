"use client";

import type { RefObject } from "react";
import GalleryPhotoGridSkeleton from "@/components/school-gallery/GalleryPhotoGridSkeleton";

type GalleryLoadMoreFooterProps = {
  loadMoreRef: RefObject<HTMLDivElement | null>;
  loadingMore: boolean;
};

export default function GalleryLoadMoreFooter({
  loadMoreRef,
  loadingMore,
}: GalleryLoadMoreFooterProps) {
  return (
    <>
      <div ref={loadMoreRef} className="h-6 w-full" aria-hidden />
      {loadingMore ? <GalleryPhotoGridSkeleton count={6} /> : null}
    </>
  );
}
