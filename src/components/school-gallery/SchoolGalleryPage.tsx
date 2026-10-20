"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import GalleryPhotoCard from "@/components/school-admin/gallery/GalleryPhotoCard";
import GalleryUploadSheet from "@/components/school-admin/gallery/GalleryUploadSheet";
import GalleryLoadMoreFooter from "@/components/school-gallery/GalleryLoadMoreFooter";
import GalleryPhotoViewer from "@/components/school-gallery/GalleryPhotoViewer";
import GalleryPhotoGridSkeleton, {
  galleryPhotoGridClassName,
} from "@/components/school-gallery/GalleryPhotoGridSkeleton";
import SchoolGalleryView from "@/components/school-gallery/SchoolGalleryView";
import {
  useGalleryPhotosFeed,
  type GalleryPhotosFeedInitial,
} from "@/components/school-gallery/useGalleryPhotosFeed";
import { canManageGalleryPhoto } from "@/lib/school-gallery/gallery-access";
import { formatGalleryDateLabel } from "@/lib/school-gallery/format-gallery-date";
import { groupGalleryPhotosByDate } from "@/lib/school-gallery/group-gallery-photos";
import type { GalleryPhoto } from "@/lib/school-gallery/types";
import { DEFAULT_BRANDING } from "@/lib/organization-settings/catalog";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { buildParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";

type SchoolGalleryPageProps = {
  organizationId: string;
  slug?: string;
  programId?: string;
  portal: "parent" | "teacher";
  initialFeed?: GalleryPhotosFeedInitial | null;
  readOnly?: boolean;
  currentUserId?: string;
  branding?: OrganizationBranding;
};

export default function SchoolGalleryPage({
  organizationId,
  slug,
  programId,
  portal,
  initialFeed,
  readOnly = true,
  currentUserId,
  branding,
}: SchoolGalleryPageProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const listUrl = useMemo(() => {
    if (!slug) return null;
    const params = new URLSearchParams({ organizationId, slug });
    if (programId) params.set("programId", programId);
    const base =
      portal === "parent"
        ? "/api/parent-portal/gallery"
        : "/api/teacher-portal/gallery";
    return `${base}?${params.toString()}`;
  }, [organizationId, portal, programId, slug]);

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
    listUrl,
    initial: initialFeed,
  });

  const teacherManageMode =
    portal === "teacher" && Boolean(currentUserId && slug) && !readOnly;
  const resolvedBranding = branding ?? DEFAULT_BRANDING;
  const theme = useMemo(
    () => buildParentThemeTokens(resolvedBranding),
    [resolvedBranding],
  );
  const C = useMemo(
    () => buildAdminThemeTokens(resolvedBranding),
    [resolvedBranding],
  );

  const groups = useMemo(() => groupGalleryPhotosByDate(photos), [photos]);

  const teacherUploadUrl =
    teacherManageMode && slug
      ? `/api/teacher-portal/gallery?organizationId=${encodeURIComponent(organizationId)}&slug=${encodeURIComponent(slug)}`
      : undefined;

  const handleUploaded = (uploaded: GalleryPhoto[]) => {
    prependPhotos(uploaded);
  };

  const patchTeacherPhoto = async (photo: GalleryPhoto, photoDate: string) => {
    if (!slug) return;
    const params = new URLSearchParams({
      organizationId,
      slug,
    });
    const response = await fetch(
      `/api/teacher-portal/gallery/${photo.id}?${params.toString()}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoDate }),
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
  };

  const deleteTeacherPhoto = async (photoId: string) => {
    if (!slug) return;
    const params = new URLSearchParams({
      organizationId,
      slug,
    });
    const response = await fetch(
      `/api/teacher-portal/gallery/${photoId}?${params.toString()}`,
      { method: "DELETE" },
    );
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      throw new Error(data.error ?? "Could not delete photo.");
    }
    removePhoto(photoId);
  };

  const handleEditDate = async (photo: GalleryPhoto) => {
    const nextDate = window.prompt(
      "Photo date (YYYY-MM-DD)",
      photo.photoDate,
    )?.trim();
    if (!nextDate || nextDate === photo.photoDate) return;

    try {
      await patchTeacherPhoto(photo, nextDate);
      adminToast.success("Photo date updated.");
    } catch (error) {
      adminToast.error(formatActionError(error, "Could not update date."));
    }
  };

  const handleDelete = async (photo: GalleryPhoto) => {
    if (!window.confirm(`Delete "${photo.fileName}"?`)) return;
    try {
      await deleteTeacherPhoto(photo.id);
      adminToast.success("Photo deleted.");
    } catch (error) {
      adminToast.error(formatActionError(error, "Could not delete photo."));
    }
  };

  if (loading) {
    return <GalleryPhotoGridSkeleton />;
  }

  if (!teacherManageMode) {
    return (
      <SchoolGalleryView
        photos={photos}
        emptyMessage={
          readOnly
            ? "Your school has not shared any photos yet."
            : "No photos yet."
        }
        hasMore={hasMore}
        loadingMore={loadingMore}
        loadMoreRef={loadMoreRef}
        onRequestMore={loadMore}
      />
    );
  }

  const openPhoto = (photoId: string) => {
    const index = photos.findIndex((photo) => photo.id === photoId);
    if (index >= 0) setViewerIndex(index);
  };

  return (
    <>
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-[#1F2A2E] px-4 py-2 text-sm font-medium text-white hover:bg-[#2C3A40]"
          onClick={() => setUploadOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Upload photos
        </button>
      </div>

      {groups.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#D8DEDF] bg-white/60 px-6 py-12 text-center text-sm text-[#65747A]">
          No photos yet. Upload your first batch to share with families.
        </p>
      ) : (
        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.photoDate}>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#65747A]">
                {formatGalleryDateLabel(group.photoDate)}
              </h2>
              <div className={galleryPhotoGridClassName}>
                {group.photos.map((photo) => {
                  const manageable = canManageGalleryPhoto({
                    isOrgAdmin: false,
                    userId: currentUserId,
                    photo,
                  });
                  return (
                    <GalleryPhotoCard
                      key={photo.id}
                      photo={photo}
                      selectionMode={false}
                      selected={false}
                      onToggleSelect={() => undefined}
                      onViewPhoto={() => openPhoto(photo.id)}
                      onEditDate={
                        manageable ? () => void handleEditDate(photo) : () => undefined
                      }
                      onDelete={
                        manageable ? () => void handleDelete(photo) : () => undefined
                      }
                      showManageActions={manageable}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <GalleryLoadMoreFooter
        loadMoreRef={loadMoreRef}
        loadingMore={loadingMore}
      />

      <GalleryUploadSheet
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        slug={slug!}
        organizationId={organizationId}
        theme={theme}
        C={C}
        uploadUrl={teacherUploadUrl}
        operationalErrorSurface="teacher_portal"
        onUploaded={handleUploaded}
      />

      {viewerIndex != null ? (
        <GalleryPhotoViewer
          key={viewerIndex}
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
