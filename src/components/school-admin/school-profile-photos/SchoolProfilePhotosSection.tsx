"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { MAX_SCHOOL_PROFILE_PHOTOS } from "@/lib/school-admin/school-profile-photos/constants";
import { prepareSchoolProfilePhotoForUpload } from "@/lib/school-admin/school-profile-photos/storage";
import type { SchoolProfilePhoto } from "@/lib/school-admin/school-profile-photos/types";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportClientOperationalError } from "@/lib/operational-errors-client";

type SchoolProfilePhotosSectionProps = {
  organizationId: string;
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
};

export default function SchoolProfilePhotosSection({
  organizationId,
  theme,
  C,
}: SchoolProfilePhotosSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<SchoolProfilePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [prepareLabel, setPrepareLabel] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SchoolProfilePhoto | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const slotsRemaining = MAX_SCHOOL_PROFILE_PHOTOS - photos.length;
  const atMax = slotsRemaining <= 0;

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/school-admin/school-profile-photos?organizationId=${encodeURIComponent(organizationId)}`,
      );
      const payload = (await response.json().catch(() => null)) as {
        photos?: SchoolProfilePhoto[];
        error?: string;
      } | null;
      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to load school photos.");
      }
      setPhotos(payload?.photos ?? []);
    } catch (error) {
      adminToast.error(formatActionError(error, "Could not load school photos."));
      void reportClientOperationalError({
        operation: "school_profile_photos_load",
        error: formatActionError(error, "Could not load school photos."),
        organizationId,
      });
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void loadPhotos();
  }, [loadPhotos]);

  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    if (atMax) {
      adminToast.error(
        `You can add up to ${MAX_SCHOOL_PROFILE_PHOTOS} school photos.`,
      );
      return;
    }

    const selected = Array.from(fileList).slice(0, slotsRemaining);
    setUploading(true);
    setPrepareLabel(null);

    try {
      const prepared: File[] = [];
      for (let i = 0; i < selected.length; i++) {
        const file = selected[i];
        setPrepareLabel(`Compressing ${i + 1} of ${selected.length}…`);
        prepared.push(await prepareSchoolProfilePhotoForUpload(file));
      }

      setPrepareLabel("Uploading…");
      const formData = new FormData();
      formData.set("organizationId", organizationId);
      for (const file of prepared) {
        formData.append("files", file);
      }

      const response = await fetch("/api/school-admin/school-profile-photos", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json().catch(() => null)) as {
        photos?: SchoolProfilePhoto[];
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Upload failed.");
      }

      const uploaded = payload?.photos ?? [];
      setPhotos((prev) =>
        [...prev, ...uploaded].sort((a, b) => a.sortOrder - b.sortOrder),
      );
      adminToast.success(
        uploaded.length === 1
          ? "Photo added."
          : `${uploaded.length} photos added.`,
      );
    } catch (error) {
      adminToast.error(formatActionError(error, "Could not upload photos."));
      void reportClientOperationalError({
        operation: "school_profile_photos_upload",
        error: formatActionError(error, "Could not upload photos."),
        organizationId,
      });
    } finally {
      setUploading(false);
      setPrepareLabel(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await fetch(
        `/api/school-admin/school-profile-photos/${encodeURIComponent(deleteTarget.id)}?organizationId=${encodeURIComponent(organizationId)}`,
        { method: "DELETE" },
      );
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok) {
        throw new Error(payload?.error ?? "Delete failed.");
      }
      setPhotos((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      adminToast.success("Photo removed.");
      setDeleteTarget(null);
    } catch (error) {
      adminToast.error(formatActionError(error, "Could not remove photo."));
      void reportClientOperationalError({
        operation: "school_profile_photos_delete",
        error: formatActionError(error, "Could not remove photo."),
        organizationId,
        entityType: "organization_school_profile_photo",
        entityId: deleteTarget.id,
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <AdminCard theme={theme} padding="canvas" className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-bold text-[#2F3D33]">School photos</h2>
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              disabled={uploading || atMax}
              onChange={(event) => void handleFilesSelected(event.target.files)}
            />
            <AdminButton
              type="button"
              theme={theme}
              disabled={uploading || atMax || loading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  {prepareLabel ?? "Uploading…"}
                </>
              ) : (
                <>
                  <ImagePlus className="h-3.5 w-3.5" aria-hidden />
                  Add photos
                </>
              )}
            </AdminButton>
            {!atMax && photos.length > 0 ? (
              <p className="text-xs" style={{ color: theme.muted }}>
                {slotsRemaining} slot{slotsRemaining === 1 ? "" : "s"} left
              </p>
            ) : null}
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader2
              className="h-6 w-6 animate-spin text-[#6B7A6E]"
              aria-label="Loading photos"
            />
          </div>
        ) : photos.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm font-medium" style={{ color: theme.ink }}>
              No school photos yet
            </p>
            <p className="max-w-sm text-[13px]" style={{ color: theme.muted }}>
              Add up to {MAX_SCHOOL_PROFILE_PHOTOS} campus photos. Images are
              compressed before upload.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((photo) => (
              <li key={photo.id} className="group relative">
                <div className="aspect-[4/3] overflow-hidden rounded-xl border border-[#D8DEDF] bg-[#F4F6F5]">
                  {photo.url ? (
                    <img
                      src={photo.url}
                      alt={photo.fileName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-full items-center justify-center text-xs"
                      style={{ color: theme.muted }}
                    >
                      Preview unavailable
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="absolute right-2 top-2 rounded-lg border border-[#D8DEDF] bg-white/95 p-1.5 opacity-0 shadow-sm transition group-hover:opacity-100 focus:opacity-100"
                  aria-label={`Remove ${photo.fileName}`}
                  disabled={uploading || deleting}
                  onClick={() => setDeleteTarget(photo)}
                >
                  <Trash2 className="h-4 w-4 text-[#6B7A6E]" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>

      <ConfirmDialog
        C={C}
        open={Boolean(deleteTarget)}
        title="Remove photo?"
        description="This photo will be deleted from your school profile."
        confirmLabel="Remove"
        variant="destructive"
        loading={deleting}
        onConfirm={() => void confirmDelete()}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      />
    </>
  );
}
