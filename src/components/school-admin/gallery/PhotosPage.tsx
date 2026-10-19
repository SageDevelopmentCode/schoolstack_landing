"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import GalleryPhotoCard from "@/components/school-admin/gallery/GalleryPhotoCard";
import GalleryUploadSheet from "@/components/school-admin/gallery/GalleryUploadSheet";
import GalleryLoadMoreFooter from "@/components/school-gallery/GalleryLoadMoreFooter";
import GalleryPhotoViewer from "@/components/school-gallery/GalleryPhotoViewer";
import GalleryPhotoGridSkeleton, {
  galleryPhotoGridClassName,
} from "@/components/school-gallery/GalleryPhotoGridSkeleton";
import { useGalleryPhotosFeed } from "@/components/school-gallery/useGalleryPhotosFeed";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import { formatGalleryDateLabel } from "@/lib/school-gallery/format-gallery-date";
import { groupGalleryPhotosByDate } from "@/lib/school-gallery/group-gallery-photos";
import type { GalleryPhoto } from "@/lib/school-gallery/types";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";

type PhotosPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
  schoolName: string;
};

export default function PhotosPage({
  organizationId,
  slug,
  schoolName,
}: PhotosPageProps) {
  const { theme, C } = useSchoolAdminStoryTheme();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const {
    photos,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    loadMoreRef,
    prependPhotos,
    replacePhoto,
    removePhoto,
  } = useGalleryPhotosFeed({
    listUrl: `/api/school/${slug}/gallery`,
  });

  const groups = useMemo(() => groupGalleryPhotosByDate(photos), [photos]);

  const openPhoto = (photoId: string) => {
    const index = photos.findIndex((photo) => photo.id === photoId);
    if (index >= 0) setViewerIndex(index);
  };

  const handleUploaded = (uploaded: GalleryPhoto[]) => {
    prependPhotos(uploaded);
  };

  const handleEditDate = async (photo: GalleryPhoto) => {
    const nextDate = window.prompt(
      "Photo date (YYYY-MM-DD)",
      photo.photoDate,
    )?.trim();
    if (!nextDate || nextDate === photo.photoDate) return;

    try {
      const response = await fetch(
        `/api/school/${slug}/gallery/${photo.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoDate: nextDate }),
        },
      );
      const data = (await response.json()) as {
        photo?: GalleryPhoto;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error ?? "Could not update date.");
      }
      if (data.photo) {
        replacePhoto(data.photo);
      }
      adminToast.success("Photo date updated.");
    } catch (error) {
      adminToast.error(formatActionError(error, "Could not update date."));
    }
  };

  const deletePhoto = async (photoId: string) => {
    const response = await fetch(`/api/school/${slug}/gallery/${photoId}`, {
      method: "DELETE",
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      throw new Error(data.error ?? "Could not delete photo.");
    }
    removePhoto(photoId);
    setViewerIndex((current) => {
      if (current == null) return null;
      const deletedIndex = photos.findIndex((photo) => photo.id === photoId);
      if (deletedIndex < 0) return current;
      if (current === deletedIndex) return null;
      if (current > deletedIndex) return current - 1;
      return current;
    });
  };

  const handleDelete = async (photo: GalleryPhoto) => {
    if (!window.confirm(`Delete "${photo.fileName}"?`)) return;
    try {
      await deletePhoto(photo.id);
      adminToast.success("Photo deleted.");
    } catch (error) {
      adminToast.error(formatActionError(error, "Could not delete photo."));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (
      !window.confirm(`Delete ${selectedIds.size} selected photo(s)?`)
    ) {
      return;
    }

    try {
      for (const id of selectedIds) {
        await deletePhoto(id);
      }
      setSelectedIds(new Set());
      setSelectionMode(false);
      adminToast.success("Selected photos deleted.");
    } catch (error) {
      adminToast.error(formatActionError(error, "Could not delete photos."));
    }
  };

  if (loading) {
    return (
      <div
        className="mx-auto max-w-[1350px] px-[clamp(25px,4vw,56px)] py-[30px] pb-14"
        style={{ color: theme.ink }}
      >
        <GalleryPhotoGridSkeleton />
      </div>
    );
  }

  return (
    <>
      <div
        className="mx-auto max-w-[1350px] px-[clamp(25px,4vw,56px)] py-[30px] pb-14"
        style={{ color: theme.ink }}
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <AdminSectionKicker theme={theme}>Photos</AdminSectionKicker>
            <AdminDisplayHeading theme={theme} as="h1">
              School gallery for {schoolName}
            </AdminDisplayHeading>
            <p className="mt-2 max-w-2xl text-sm text-[#65747A]">
              Upload photos in batches, set the date for each batch, and share
              them with families and staff.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectionMode ? (
              <>
                <AdminButton
                  type="button"
                  theme={theme}
                  variant="outline"
                  onClick={() => {
                    setSelectionMode(false);
                    setSelectedIds(new Set());
                  }}
                >
                  Cancel
                </AdminButton>
                <AdminButton
                  type="button"
                  theme={theme}
                  variant="outline"
                  onClick={() => void handleDeleteSelected()}
                  disabled={selectedIds.size === 0}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete selected
                </AdminButton>
              </>
            ) : (
              <AdminButton
                type="button"
                theme={theme}
                variant="outline"
                onClick={() => setSelectionMode(true)}
                disabled={photos.length === 0}
              >
                Select
              </AdminButton>
            )}
            <AdminButton type="button" theme={theme} onClick={() => setUploadOpen(true)}>
              <Plus className="h-4 w-4" />
              Upload photos
            </AdminButton>
          </div>
        </div>

        {groups.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#D8DEDF] bg-white/60 px-6 py-12 text-center text-sm text-[#65747A]">
            No photos yet. Upload your first batch to get started.
          </p>
        ) : (
          <div className="space-y-10">
            {groups.map((group) => (
              <section key={group.photoDate}>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#65747A]">
                  {formatGalleryDateLabel(group.photoDate)}
                </h2>
                <div className={galleryPhotoGridClassName}>
                  {group.photos.map((photo) => (
                    <GalleryPhotoCard
                      key={photo.id}
                      photo={photo}
                      selectionMode={selectionMode}
                      selected={selectedIds.has(photo.id)}
                      onToggleSelect={() => {
                        setSelectedIds((current) => {
                          const next = new Set(current);
                          if (next.has(photo.id)) next.delete(photo.id);
                          else next.add(photo.id);
                          return next;
                        });
                      }}
                      onViewPhoto={() => openPhoto(photo.id)}
                      onEditDate={() => void handleEditDate(photo)}
                      onDelete={() => void handleDelete(photo)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <GalleryLoadMoreFooter
          loadMoreRef={loadMoreRef}
          loadingMore={loadingMore}
        />
      </div>

      <GalleryUploadSheet
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        slug={slug}
        organizationId={organizationId}
        theme={theme}
        C={C}
        onUploaded={handleUploaded}
      />

      {viewerIndex != null ? (
        <GalleryPhotoViewer
          items={photos}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          hasMore={hasMore}
          onRequestMore={loadMore}
          showStaffDetails
        />
      ) : null}
    </>
  );
}
