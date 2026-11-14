"use client";

import { useEffect, useRef, type TouchEvent } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, ImageOff, Loader2, X } from "lucide-react";
import {
  useGalleryPhotoViewerNav,
  type GalleryPhotoViewerItem,
} from "@/components/school-gallery/GalleryPhotoViewer";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import { formatGalleryDateLabel } from "@/lib/school-gallery/format-gallery-date";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

const CONTROL =
  "flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/80 bg-white text-[var(--sf-ink)] shadow-[0_3px_0_0_rgba(0,0,0,0.35)] transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50 disabled:cursor-wait disabled:opacity-70";

const SWIPE_MIN_PX = 48;

/**
 * Parent Garden lightbox: the shared gallery navigation (keyboard, preload,
 * load-more on Next) with a position counter, the photo's date, swipe on
 * touch, and focus that moves in on open and returns to the tile on close.
 * Portalled to <body> with its own Garden scope.
 */
export default function GardenPhotoViewer({
  theme,
  items,
  initialIndex,
  onClose,
  hasMore = false,
  onRequestMore,
}: {
  theme: ParentThemeTokens;
  items: GalleryPhotoViewerItem[];
  initialIndex: number;
  onClose: () => void;
  hasMore?: boolean;
  onRequestMore?: () => void | Promise<void>;
}) {
  const reduce = useReducedMotion() === true;
  const {
    index,
    current,
    currentImageUrl,
    imageLoaded,
    setLoadedUrl,
    canGoPrev,
    canGoNext,
    goPrev,
    goNext,
    loadingNext,
  } = useGalleryPhotoViewerNav({ items, initialIndex, onClose, hasMore, onRequestMore });

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Focus in on open, back to the opener (the tile) on close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => closeRef.current?.focus(), 30);
    return () => {
      window.clearTimeout(timer);
      if (opener && document.contains(opener)) opener.focus();
    };
  }, []);

  // Keep Tab inside the dialog.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;
      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>("button:not([disabled])"),
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!current || typeof document === "undefined") return null;

  const total = items.length;
  const position = `${index + 1} of ${total}${hasMore ? "+" : ""}`;
  const dateLabel = current.photoDate ? formatGalleryDateLabel(current.photoDate) : null;

  const onTouchStart = (event: TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (event: TouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    const end = event.changedTouches[0]?.clientX;
    if (start == null || end == null) return;
    const delta = end - start;
    if (Math.abs(delta) < SWIPE_MIN_PX) return;
    if (delta > 0 && canGoPrev) goPrev();
    if (delta < 0 && canGoNext && !loadingNext) void goNext();
  };

  return createPortal(
    <ParentGardenFrame theme={theme} className="!min-h-0">
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={dateLabel ? `Photo ${position}, ${dateLabel}` : `Photo ${position}`}
        data-testid="parent-photo-viewer"
        className="fixed inset-0 z-[120] flex flex-col bg-[rgba(24,20,16,0.92)] backdrop-blur-[2px]"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: PORTAL_EASE }}
        onClick={onClose}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
          <div className="min-w-0 text-white" onClick={(event) => event.stopPropagation()}>
            <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/65" aria-live="polite">
              Photo {position}
            </p>
            {dateLabel ? (
              <p className="m-0 mt-0.5 truncate text-[15px] font-extrabold">{dateLabel}</p>
            ) : null}
          </div>
          <button
            ref={closeRef}
            type="button"
            className={CONTROL}
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            aria-label="Close photo"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-20">
          <div
            className="relative flex max-h-full max-w-full items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            {currentImageUrl && !imageLoaded ? (
              <div
                className="h-[min(70vh,32rem)] w-[min(90vw,32rem)] max-w-full animate-pulse rounded-[18px] bg-white/10"
                aria-hidden
              />
            ) : null}
            {currentImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={currentImageUrl}
                src={currentImageUrl}
                alt={dateLabel ? `School photo from ${dateLabel}` : current.fileName}
                loading="eager"
                className={`max-h-[calc(100dvh-9rem)] max-w-full rounded-[14px] object-contain shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)] transition-opacity duration-200 ${imageLoaded ? "opacity-100" : "absolute opacity-0"}`}
                onLoad={() => setLoadedUrl(currentImageUrl)}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-[18px] bg-white/10 px-8 py-10 text-center text-white/85">
                <ImageOff className="h-7 w-7" aria-hidden />
                <p className="m-0 text-sm font-bold">This photo isn&apos;t available right now.</p>
              </div>
            )}
          </div>

          {canGoPrev ? (
            <div className="absolute left-2 top-1/2 -translate-y-1/2 sm:left-5">
            <button
              type="button"
              className={CONTROL}
              onClick={(event) => {
                event.stopPropagation();
                goPrev();
              }}
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden />
            </button>
            </div>
          ) : null}

          {canGoNext ? (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 sm:right-5">
            <button
              type="button"
              className={CONTROL}
              onClick={(event) => {
                event.stopPropagation();
                void goNext();
              }}
              disabled={loadingNext}
              aria-busy={loadingNext || undefined}
              aria-label={loadingNext ? "Loading more photos" : "Next photo"}
            >
              {loadingNext ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <ChevronRight className="h-6 w-6" aria-hidden />
              )}
            </button>
            </div>
          ) : null}
        </div>

        <p className="sr-only" aria-live="polite">
          {loadingNext ? "Loading more photos…" : ""}
        </p>
      </motion.div>
    </ParentGardenFrame>,
    document.body,
  );
}
