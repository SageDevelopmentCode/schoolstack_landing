"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Camera, ImageOff, Loader2, RotateCw } from "lucide-react";
import {
  useGalleryPhotosFeed,
  type GalleryPhotosFeedInitial,
} from "@/components/school-gallery/useGalleryPhotosFeed";
import {
  DateStamp,
  GCard,
  GChip,
  GIcon,
  G_FOCUS,
  PANEL_TINTS,
  gBtnOutlineSm,
} from "@/components/school-parent/garden/ui";
import GardenPhotoViewer from "@/components/school-parent/photos/garden/GardenPhotoViewer";
import { parentToast } from "@/lib/school-parent/parent-toast";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { formatGalleryDateLabel } from "@/lib/school-gallery/format-gallery-date";
import { buildGalleryListUrl } from "@/lib/school-gallery/gallery-list-url";
import { groupGalleryPhotosByDate } from "@/lib/school-gallery/group-gallery-photos";
import type { GalleryPhoto } from "@/lib/school-gallery/types";

const GRID = "grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-5";
const LOAD_TOAST_ID = "parent-photos-load-error";

function GallerySkeleton({ count = 10, label = "Loading photos" }: { count?: number; label?: string }) {
  return (
    <div className={GRID} aria-busy="true" aria-label={label} role="status">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="aspect-square animate-pulse rounded-[14px] bg-[var(--sf-ink)]/[0.07]" />
      ))}
    </div>
  );
}

function PhotoTile({
  photo,
  label,
  index,
  onOpen,
}: {
  photo: GalleryPhoto;
  label: string;
  index: number;
  onOpen: () => void;
}) {
  const [loaded, setLoaded] = useState(false);

  if (!photo.imageUrl) {
    return (
      <div
        className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-[14px] border-[1.5px] border-[var(--sf-ink)]/10 text-[var(--sf-ink)]/60 ${PANEL_TINTS[index % PANEL_TINTS.length]}`}
        role="img"
        aria-label="Photo unavailable"
      >
        <ImageOff className="h-5 w-5" aria-hidden />
        <span className="text-[11px] font-extrabold">Unavailable</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={label}
      className={`group relative block aspect-square w-full overflow-hidden rounded-[14px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-ink)]/[0.06] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/40 hover:shadow-[0_4px_0_0_rgba(43,36,29,0.18)] ${G_FOCUS}`}
    >
      {!loaded ? <span className="absolute inset-0 animate-pulse bg-[var(--sf-ink)]/[0.06]" aria-hidden /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.imageUrl}
        alt=""
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-[opacity,transform] duration-300 group-hover:scale-[1.04] ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </button>
  );
}

type ParentGardenGalleryProps = {
  theme: ParentThemeTokens;
  organizationId: string;
  slug: string;
  programId?: string;
  previewFamilyId?: string;
  initialFeed?: GalleryPhotosFeedInitial | null;
  index?: number;
};

/** School gallery for parents: date groups of photos, newest first, with a Garden lightbox. */
export default function ParentGardenGallery({
  theme,
  organizationId,
  slug,
  programId,
  previewFamilyId,
  initialFeed,
  index = 1,
}: ParentGardenGalleryProps) {
  const listUrl = useMemo(
    () =>
      buildGalleryListUrl({
        organizationId,
        slug,
        programId,
        portal: "parent",
        previewFamilyId,
      }),
    [organizationId, previewFamilyId, programId, slug],
  );

  const {
    photos,
    loading,
    loadingMore,
    initialError,
    loadMoreError,
    hasMore,
    loadMore,
    loadMoreRef,
    reload,
  } = useGalleryPhotosFeed({ listUrl, initial: initialFeed });

  const groups = useMemo(() => groupGalleryPhotosByDate(photos), [photos]);
  // The lightbox steps through photos in the same order they appear on screen.
  const orderedPhotos = useMemo(() => groups.flatMap((group) => group.photos), [groups]);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  // Feedback after a parent-initiated retry: toast if it failed again, clear the old toast if it worked.
  const pendingRetry = useRef<"initial" | "more" | null>(null);
  useEffect(() => {
    const kind = pendingRetry.current;
    if (!kind) return;
    if (kind === "initial" && loading) return;
    if (kind === "more" && loadingMore) return;
    pendingRetry.current = null;
    const error = kind === "initial" ? initialError : loadMoreError;
    if (error) {
      parentToast.error("Still couldn't load photos", {
        id: LOAD_TOAST_ID,
        description: `${error} Check your connection, then try again.`,
      });
    } else {
      parentToast.dismiss(LOAD_TOAST_ID);
      if (kind === "initial") parentToast.success("Photos loaded");
    }
  }, [initialError, loadMoreError, loading, loadingMore]);

  const retryInitial = () => {
    pendingRetry.current = "initial";
    void reload();
  };
  const retryMore = () => {
    pendingRetry.current = "more";
    void loadMore();
  };

  const openPhoto = (photoId: string) => {
    const i = orderedPhotos.findIndex((photo) => photo.id === photoId);
    if (i >= 0) setViewerIndex(i);
  };

  let body: React.ReactNode;
  if (loading) {
    body = <GallerySkeleton />;
  } else if (groups.length === 0 && initialError) {
    body = (
      <div
        className="flex flex-col items-center gap-3 rounded-[20px] border-[1.5px] border-[var(--sf-clay-deep)]/25 bg-[var(--sf-peach)] px-6 py-10 text-center"
        role="alert"
        data-testid="parent-photos-error"
      >
        <GIcon>
          <AlertCircle />
        </GIcon>
        <div>
          <p className="m-0 text-[16px] font-extrabold text-[var(--sf-ink)]">We couldn&apos;t load your school&apos;s photos</p>
          <p className="m-0 mt-1 text-[13px] font-semibold text-[var(--sf-clay-deep)]">{initialError}</p>
        </div>
        <button type="button" className={gBtnOutlineSm} onClick={retryInitial}>
          <RotateCw className="h-4 w-4" aria-hidden />
          Try again
        </button>
      </div>
    );
  } else if (groups.length === 0) {
    body = (
      <div
        className="sf-paper flex flex-col items-center gap-3 rounded-[20px] border-[1.5px] border-dashed border-[var(--sf-ink)]/20 px-6 py-12 text-center"
        data-testid="parent-photos-empty"
      >
        <GIcon size="lg">
          <Camera />
        </GIcon>
        <div>
          <p className="m-0 text-[16px] font-extrabold text-[var(--sf-ink)]">Your school has not shared any photos yet.</p>
          <p className="m-0 mt-1 text-[13px] font-semibold text-[var(--sf-soft)]">
            When your school shares photos, they&apos;ll appear here, newest first.
          </p>
        </div>
        <p className="sf-hand m-0 text-[1.35rem] lowercase text-[var(--sf-clay-deep)]" aria-hidden="true">
          fresh photos will land here ✿
        </p>
      </div>
    );
  } else {
    body = (
      <>
        <div className="flex flex-col gap-6">
          {groups.map((group, groupIndex) => {
            const dateLabel = formatGalleryDateLabel(group.photoDate);
            const complete = !(hasMore && groupIndex === groups.length - 1);
            return (
              <section key={group.photoDate} aria-label={dateLabel} data-testid="parent-photos-day">
                <div className="sticky top-0 z-[2] -mx-1 mb-3 flex items-center gap-3 bg-white/95 px-1 py-1.5 backdrop-blur-sm">
                  <DateStamp date={group.photoDate} size="sm" />
                  <div className="min-w-0">
                    <h3 className="m-0 truncate text-[15px] font-extrabold text-[var(--sf-ink)]">{dateLabel}</h3>
                    {complete ? (
                      <p className="m-0 text-[13px] font-semibold text-[var(--sf-soft)]">
                        {group.photos.length} {group.photos.length === 1 ? "photo" : "photos"}
                      </p>
                    ) : null}
                  </div>
                </div>
                <ul className={`${GRID} m-0 list-none p-0`}>
                  {group.photos.map((photo, i) => (
                    <li key={photo.id}>
                      <PhotoTile
                        photo={photo}
                        index={i}
                        label={`Open photo ${i + 1} from ${dateLabel}`}
                        onOpen={() => openPhoto(photo.id)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <div ref={loadMoreRef} className="h-4 w-full" aria-hidden />
        {loadingMore ? (
          <div className="mt-2">
            <GallerySkeleton count={5} label="Loading more photos" />
            <p className="m-0 mt-3 flex items-center justify-center gap-2 text-[13px] font-bold text-[var(--sf-soft)]" aria-live="polite">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Loading more photos…
            </p>
          </div>
        ) : null}
        {loadMoreError && !loadingMore ? (
          <div
            className="mt-2 flex flex-col items-center gap-3 rounded-[18px] border-[1.5px] border-[var(--sf-clay-deep)]/25 bg-[var(--sf-peach)] px-4 py-4 text-center sm:flex-row sm:justify-between sm:text-left"
            role="alert"
          >
            <p className="m-0 text-[13px] font-bold text-[var(--sf-clay-deep)]">
              Couldn&apos;t load more photos. {loadMoreError}
            </p>
            <button type="button" className={gBtnOutlineSm} onClick={retryMore}>
              <RotateCw className="h-4 w-4" aria-hidden />
              Try again
            </button>
          </div>
        ) : null}
        {hasMore && !loadingMore && !loadMoreError ? (
          <div className="mt-2 flex justify-center">
            <button type="button" className={gBtnOutlineSm} onClick={() => void loadMore()}>
              Show more photos
            </button>
          </div>
        ) : null}
        {!hasMore ? (
          <p className="m-0 mt-2 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/15 pt-4 text-center text-[13px] font-bold text-[var(--sf-soft)]">
            That&apos;s every photo shared so far.
          </p>
        ) : null}
      </>
    );
  }

  return (
    <>
      <GCard
        index={index}
        kicker="School gallery"
        title="Shared by your school"
        action={groups.length > 0 ? <GChip tone="neutral">Newest first</GChip> : null}
        data-testid="parent-photos-gallery"
      >
        {body}
      </GCard>

      {viewerIndex != null ? (
        <GardenPhotoViewer
          key={viewerIndex}
          theme={theme}
          items={orderedPhotos}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          hasMore={hasMore}
          onRequestMore={loadMore}
        />
      ) : null}
    </>
  );
}
