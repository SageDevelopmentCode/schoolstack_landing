"use client";

import { useCallback, useMemo, useState } from "react";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import GalleryPhotoCard from "@/components/school-admin/gallery/GalleryPhotoCard";
import GalleryLoadMoreFooter from "@/components/school-gallery/GalleryLoadMoreFooter";
import GalleryPhotoGridSkeleton from "@/components/school-gallery/GalleryPhotoGridSkeleton";
import { useGalleryPhotosFeed } from "@/components/school-gallery/useGalleryPhotosFeed";
import SchoolAdminSlideOverShell from "@/components/school-admin/ui/SchoolAdminSlideOverShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { MAX_NEWSLETTER_PHOTOS } from "@/lib/school-admin/newsletter/newsletter-limits";
import {
  createNewsletterId,
  type NewsletterEdition,
  type NewsletterPhoto,
} from "@/lib/school-admin/newsletter/newsletter-types";
import type { GalleryPhoto } from "@/lib/school-gallery/types";

type NewsletterGalleryPickerSheetProps = {
  open: boolean;
  slug: string;
  edition: NewsletterEdition;
  mode?: "photos" | "cover";
  onClose: () => void;
  onAddPhotos?: (photos: NewsletterPhoto[]) => void;
  onPickCover?: (cover: { galleryPhotoId: string; src: string }) => void;
};

export default function NewsletterGalleryPickerSheet({
  open,
  slug,
  edition,
  mode = "photos",
  onClose,
  onAddPhotos,
  onPickCover,
}: NewsletterGalleryPickerSheetProps) {
  const { theme, C } = useSchoolAdminStoryTheme();
  const isCoverMode = mode === "cover";
  const listUrl = open ? `/api/school/${slug}/gallery` : null;
  const {
    photos,
    loading,
    loadingMore,
    hasMore,
    loadMoreRef,
    loadMoreError,
    reload,
  } = useGalleryPhotosFeed({ listUrl, enabled: open });

  const existingGalleryIds = useMemo(
    () =>
      new Set(
        edition.photos
          .filter((p) => p.galleryPhotoId)
          .map((p) => p.galleryPhotoId as string),
      ),
    [edition.photos],
  );

  const slotsLeft = MAX_NEWSLETTER_PHOTOS - edition.photos.length;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const isDirty = selectedIds.length > 0;

  const {
    dialogOpen: leaveDialogOpen,
    requestAction,
    confirmLeave,
    cancelLeave,
  } = useUnsavedChangesGuard({ isDirty, enabled: open });

  const forceClose = useCallback(() => {
    setSelectedIds([]);
    onClose();
  }, [onClose]);

  const requestClose = useCallback(() => {
    requestAction(forceClose);
  }, [forceClose, requestAction]);

  const toggleSelect = (photo: GalleryPhoto) => {
    if (!photo.imageUrl) return;
    if (!isCoverMode && existingGalleryIds.has(photo.id)) return;
    setSelectedIds((prev) => {
      if (isCoverMode) {
        return prev.includes(photo.id) ? [] : [photo.id];
      }
      if (prev.includes(photo.id)) {
        return prev.filter((id) => id !== photo.id);
      }
      if (prev.length >= slotsLeft) return prev;
      return [...prev, photo.id];
    });
  };

  const apply = () => {
    const picked = photos.filter((p) => selectedIds.includes(p.id) && p.imageUrl);
    if (isCoverMode) {
      const photo = picked[0];
      if (photo?.imageUrl) {
        onPickCover?.({ galleryPhotoId: photo.id, src: photo.imageUrl });
      }
    } else {
      const newPhotos: NewsletterPhoto[] = picked.map((p) => ({
        id: createNewsletterId(),
        galleryPhotoId: p.id,
        src: p.imageUrl as string,
        caption: "",
      }));
      onAddPhotos?.(newPhotos);
    }
    setSelectedIds([]);
    onClose();
  };

  const title = isCoverMode ? "Choose cover image" : "School photo library";
  const subtitle = isCoverMode
    ? "Pick one photo from your school library for the newsletter cover."
    : `Choose up to ${slotsLeft} photo${slotsLeft === 1 ? "" : "s"} for this newsletter.`;

  return (
    <>
      <SchoolAdminSlideOverShell
        open={open}
        onClose={requestClose}
        title={title}
        subtitle={subtitle}
        C={C}
        widthClassName="w-[min(100%,28rem)]"
        footer={
          <>
            <AdminButton theme={theme} variant="outline" onClick={requestClose}>
              Cancel
            </AdminButton>
            <AdminButton
              theme={theme}
              variant="primary"
              disabled={selectedIds.length === 0}
              onClick={apply}
            >
              {isCoverMode
                ? "Use as cover"
                : `Add ${selectedIds.length > 0 ? selectedIds.length : ""} photo${
                    selectedIds.length === 1 ? "" : "s"
                  }`}
            </AdminButton>
          </>
        }
      >
        <div className="pb-4">
          {loading ? <GalleryPhotoGridSkeleton count={9} /> : null}
          {!loading && photos.length === 0 ? (
            <p className="text-[11px] leading-relaxed" style={{ color: theme.muted }}>
              No photos in your school library yet. Upload photos from My School → Photos.
            </p>
          ) : null}
          {!loading && photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo) => {
                const alreadyAdded = !isCoverMode && existingGalleryIds.has(photo.id);
                const selected = selectedIds.includes(photo.id);
                return (
                  <GalleryPhotoCard
                    key={photo.id}
                    photo={photo}
                    selected={selected}
                    selectionMode
                    showManageActions={false}
                    onToggleSelect={() => {
                      if (!alreadyAdded) toggleSelect(photo);
                    }}
                    onEditDate={() => {}}
                    onDelete={() => {}}
                  />
                );
              })}
            </div>
          ) : null}
          {hasMore ? (
            <GalleryLoadMoreFooter
              loadMoreRef={loadMoreRef}
              loadingMore={loadingMore}
              error={loadMoreError}
              onRetry={reload}
            />
          ) : null}
        </div>
      </SchoolAdminSlideOverShell>

      <ConfirmDialog
        C={C}
        open={leaveDialogOpen}
        title="Unsaved changes"
        description="You have unsaved changes. If you leave now, your changes will be lost."
        confirmLabel="Leave without saving"
        cancelLabel="Keep editing"
        variant="destructive"
        onConfirm={confirmLeave}
        onClose={cancelLeave}
      />
    </>
  );
}
