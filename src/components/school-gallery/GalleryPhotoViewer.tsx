"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { formatGalleryDateLabel } from "@/lib/school-gallery/format-gallery-date";

export type GalleryPhotoViewerItem = {
  id: string;
  imageUrl?: string | null;
  fileName: string;
  uploadedByName?: string | null;
  photoDate?: string;
};

type GalleryPhotoViewerProps = {
  items: GalleryPhotoViewerItem[];
  initialIndex: number;
  onClose: () => void;
  hasMore?: boolean;
  onRequestMore?: () => void | Promise<void>;
  showStaffDetails?: boolean;
};

export default function GalleryPhotoViewer({
  items,
  initialIndex,
  onClose,
  hasMore = false,
  onRequestMore,
  showStaffDetails = false,
}: GalleryPhotoViewerProps) {
  const [index, setIndex] = useState(initialIndex);
  const [imageLoaded, setImageLoaded] = useState(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const current = items[index];
  const canGoPrev = index > 0;
  const canGoNext = index < items.length - 1 || hasMore;

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    setImageLoaded(false);
  }, [index, current?.imageUrl]);

  useEffect(() => {
    const preload = (offset: number) => {
      const item = items[index + offset];
      if (!item?.imageUrl) return;
      const img = new Image();
      img.src = item.imageUrl;
    };
    preload(1);
    preload(-1);
  }, [index, items]);

  const goPrev = useCallback(() => {
    if (index > 0) setIndex(index - 1);
  }, [index]);

  const goNext = useCallback(async () => {
    const currentItems = itemsRef.current;
    if (index < currentItems.length - 1) {
      setIndex(index + 1);
      return;
    }
    if (hasMore && onRequestMore) {
      await onRequestMore();
      setIndex((currentIndex) => {
        const len = itemsRef.current.length;
        return currentIndex < len - 1 ? currentIndex + 1 : currentIndex;
      });
    }
  }, [hasMore, index, onRequestMore]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "ArrowLeft" && canGoPrev) {
        event.preventDefault();
        goPrev();
      }
      if (event.key === "ArrowRight" && canGoNext) {
        event.preventDefault();
        void goNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canGoNext, canGoPrev, goNext, goPrev, onClose]);

  if (!current) {
    return null;
  }

  const staffCaption = (() => {
    if (!showStaffDetails) return null;
    const name = current.uploadedByName?.trim();
    const dateLabel = current.photoDate
      ? formatGalleryDateLabel(current.photoDate)
      : null;
    if (name && dateLabel) return `Posted by ${name} · ${dateLabel}`;
    if (name) return `Posted by ${name}`;
    if (dateLabel) return dateLabel;
    return null;
  })();

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      {canGoPrev ? (
        <button
          type="button"
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:left-4"
          onClick={(event) => {
            event.stopPropagation();
            goPrev();
          }}
          aria-label="Previous photo"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      ) : null}

      {canGoNext ? (
        <button
          type="button"
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:right-4"
          onClick={(event) => {
            event.stopPropagation();
            void goNext();
          }}
          aria-label="Next photo"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      ) : null}

      <div
        className="relative flex max-h-[90vh] max-w-full flex-col items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative flex max-h-[85vh] max-w-full items-center justify-center">
          {!imageLoaded || !current.imageUrl ? (
            <div
              className="h-[min(70vh,32rem)] w-[min(90vw,32rem)] max-w-full animate-pulse rounded-none bg-white/10"
              aria-hidden
            />
          ) : null}
          {current.imageUrl ? (
            <img
              src={current.imageUrl}
              alt={current.fileName}
              loading="eager"
              className={`max-h-[85vh] max-w-full object-contain ${imageLoaded ? "opacity-100" : "absolute opacity-0"}`}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <p className="text-sm text-white/80">Image unavailable</p>
          )}
        </div>
        {staffCaption ? (
          <p className="mt-3 max-w-lg px-4 text-center text-sm text-white/80">
            {staffCaption}
          </p>
        ) : null}
      </div>
    </div>
  );
}
