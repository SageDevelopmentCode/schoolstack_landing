"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, UploadCloud } from "lucide-react";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import { GardenLoadError } from "@/components/school-admin/garden/kit";
import { NOT_SAVED } from "@/components/school-admin/garden/useAdminAction";
import { GCard, GChip, GSkeleton, G_FOCUS } from "@/components/school-parent/garden/ui";
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
  /** Reports the photo count after load / upload / delete. */
  onCountChange?: (count: number) => void;
};

/**
 * School photos (Garden): drop zone + grid. Photos save immediately; every
 * upload and removal gets a toast, failures keep what's there and offer
 * Retry. Rendered inside the Garden School Profile page.
 */
export default function SchoolProfilePhotosSection({
  organizationId,
  theme,
  C,
  onCountChange,
}: SchoolProfilePhotosSectionProps) {
  void theme;
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<SchoolProfilePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [prepareLabel, setPrepareLabel] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SchoolProfilePhoto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [flashIds, setFlashIds] = useState<string[]>([]);
  const onCountChangeRef = useRef(onCountChange);
  useEffect(() => {
    onCountChangeRef.current = onCountChange;
  }, [onCountChange]);

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
      const next = payload?.photos ?? [];
      setPhotos(next);
      setLoadError(null);
      onCountChangeRef.current?.(next.length);
    } catch (error) {
      setLoadError(formatActionError(error, "Could not load school photos."));
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
    queueMicrotask(() => {
      void loadPhotos();
    });
  }, [loadPhotos]);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    if (atMax) {
      adminToast.error(`You can add up to ${MAX_SCHOOL_PROFILE_PHOTOS} school photos.`, {
        id: "school-photos-max-error",
        description: "Remove a photo to make room for a new one.",
      });
      return;
    }

    const selected = files.slice(0, slotsRemaining);
    const skipped = files.length - selected.length;
    setUploading(true);
    setPrepareLabel(null);

    try {
      const prepared: File[] = [];
      for (let i = 0; i < selected.length; i++) {
        setPrepareLabel(`Compressing ${i + 1} of ${selected.length}…`);
        prepared.push(await prepareSchoolProfilePhotoForUpload(selected[i]));
      }

      setPrepareLabel("Uploading…");
      const formData = new FormData();
      formData.set("organizationId", organizationId);
      for (const file of prepared) formData.append("files", file);

      const response = await fetch("/api/school-admin/school-profile-photos", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json().catch(() => null)) as {
        photos?: SchoolProfilePhoto[];
        error?: string;
      } | null;
      if (!response.ok) throw new Error(payload?.error ?? "Upload failed.");

      const uploaded = payload?.photos ?? [];
      const nextPhotos = [...photos, ...uploaded].sort((a, b) => a.sortOrder - b.sortOrder);
      setPhotos(nextPhotos);
      onCountChangeRef.current?.(nextPhotos.length);
      setFlashIds(uploaded.map((photo) => photo.id));
      window.setTimeout(() => setFlashIds([]), 1600);
      const total = nextPhotos.length;
      adminToast.dismiss("school-photos-upload-error");
      adminToast.success(uploaded.length === 1 ? "Photo added." : `${uploaded.length} photos added.`, {
        id: "school-photos-upload",
        description: [
          `${total} of ${MAX_SCHOOL_PROFILE_PHOTOS} photos on your profile.`,
          skipped > 0 ? `${skipped} skipped because the limit is ${MAX_SCHOOL_PROFILE_PHOTOS}.` : null,
        ]
          .filter(Boolean)
          .join(" "),
      });
    } catch (error) {
      adminToast.error("Couldn't upload photos.", {
        id: "school-photos-upload-error",
        description: `${formatActionError(error, "Upload failed.")} ${NOT_SAVED}`,
        action: { label: "Retry", onClick: () => void handleFiles(selected) },
      });
      void reportClientOperationalError({
        operation: "school_profile_photos_upload",
        error: formatActionError(error, "Could not upload photos."),
        organizationId,
      });
    } finally {
      setUploading(false);
      setPrepareLabel(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleting(true);
    try {
      const response = await fetch(
        `/api/school-admin/school-profile-photos/${encodeURIComponent(target.id)}?organizationId=${encodeURIComponent(organizationId)}`,
        { method: "DELETE" },
      );
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(payload?.error ?? "Delete failed.");
      const remaining = photos.filter((p) => p.id !== target.id);
      setPhotos(remaining);
      onCountChangeRef.current?.(remaining.length);
      adminToast.dismiss("school-photos-delete-error");
      adminToast.success("Photo removed.", {
        id: "school-photos-delete",
        description: `${remaining.length} of ${MAX_SCHOOL_PROFILE_PHOTOS} photos on your profile.`,
      });
      setDeleteTarget(null);
    } catch (error) {
      adminToast.error("Couldn't remove the photo.", {
        id: "school-photos-delete-error",
        description: `${formatActionError(error, "Delete failed.")} The photo is still on your profile.`,
      });
      void reportClientOperationalError({
        operation: "school_profile_photos_delete",
        error: formatActionError(error, "Could not remove photo."),
        organizationId,
        entityType: "organization_school_profile_photo",
        entityId: target.id,
      });
    } finally {
      setDeleting(false);
    }
  };

  const pickFiles = () => inputRef.current?.click();
  const dropDisabled = uploading || atMax || loading || Boolean(loadError);

  return (
    <>
      <GCard
        index={1}
        kicker="Section"
        title="School photos"
        action={
          loading || loadError ? null : (
            <GChip tone={atMax ? "warning" : "neutral"}>
              <span className="tabular-nums">
                {photos.length} of {MAX_SCHOOL_PROFILE_PHOTOS}
              </span>
            </GChip>
          )
        }
        data-testid="school-profile-photos"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          disabled={dropDisabled}
          onChange={(event) => void handleFiles(Array.from(event.target.files ?? []))}
        />

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="status" aria-live="polite">
            <span className="sr-only">Loading photos</span>
            {Array.from({ length: 3 }).map((_, i) => (
              <GSkeleton key={i} className="aspect-[4/3] !rounded-[16px]" />
            ))}
          </div>
        ) : loadError ? (
          <GardenLoadError title="School photos didn't load" description={loadError} onRetry={() => void loadPhotos()} />
        ) : (
          <div className="flex flex-col gap-4">
            {/* Drop zone */}
            <button
              type="button"
              onClick={pickFiles}
              disabled={dropDisabled}
              aria-busy={uploading || undefined}
              onDragOver={(event) => {
                if (dropDisabled) return;
                event.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragOver(false);
                if (dropDisabled) return;
                void handleFiles(
                  Array.from(event.dataTransfer.files).filter((file) => /^image\/(jpeg|png|webp)$/.test(file.type)),
                );
              }}
              className={`flex w-full flex-col items-center justify-center gap-2 rounded-[18px] border-2 border-dashed px-4 py-7 text-center transition-colors disabled:cursor-not-allowed ${
                dragOver
                  ? "border-[var(--sf-clay)] bg-[var(--sf-accent-wash)]"
                  : "border-[var(--sf-ink)]/18 bg-[var(--sf-paper)] hover:border-[var(--sf-clay)]/50 hover:bg-[var(--sf-accent-wash)]"
              } ${atMax ? "opacity-70" : ""} ${G_FOCUS}`}
              data-testid="school-profile-photos-add"
            >
              <span
                aria-hidden
                className="flex h-11 w-11 items-center justify-center rounded-[14px] border-[1.5px] border-[var(--sf-ink)]/15 bg-[var(--sf-butter)]"
              >
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-[var(--sf-ink)]/70" />
                ) : atMax ? (
                  <ImagePlus className="h-5 w-5 text-[var(--sf-ink)]/70" />
                ) : (
                  <UploadCloud className="h-5 w-5 text-[var(--sf-ink)]/70" />
                )}
              </span>
              <span className="text-[14.5px] font-extrabold text-[var(--sf-ink)]" aria-live="polite">
                {uploading
                  ? prepareLabel ?? "Uploading…"
                  : atMax
                    ? `All ${MAX_SCHOOL_PROFILE_PHOTOS} photo slots are used`
                    : "Add photos"}
              </span>
              <span className="max-w-[44ch] text-[12.5px] font-semibold text-[var(--sf-soft)]">
                {atMax
                  ? "Remove a photo to make room for a new one."
                  : `Drop JPG, PNG or WebP images here or click to choose. ${slotsRemaining} slot${
                      slotsRemaining === 1 ? "" : "s"
                    } left. Images are compressed before upload.`}
              </span>
            </button>

            {photos.length === 0 ? (
              <p className="m-0 text-center text-[13px] font-semibold text-[var(--sf-soft)]">No school photos yet.</p>
            ) : (
              <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3">
                {photos.map((photo) => (
                  <li key={photo.id} className="group relative">
                    <div
                      className={`aspect-[4/3] overflow-hidden rounded-[16px] border-[1.5px] bg-[var(--sf-paper)] transition-colors duration-500 ${
                        flashIds.includes(photo.id)
                          ? "border-[var(--sf-forest)] ring-4 ring-[var(--sf-mint)]"
                          : "border-[var(--sf-ink)]/12"
                      }`}
                    >
                      {photo.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photo.url} alt={photo.fileName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[12px] font-semibold text-[var(--sf-soft)]">
                          Preview unavailable
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      className={`absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-[var(--sf-ink)]/20 bg-white/95 text-[var(--sf-ink)]/70 shadow-sm transition hover:text-[#9a3422] focus:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 ${G_FOCUS}`}
                      aria-label={`Remove ${photo.fileName}`}
                      disabled={uploading || deleting}
                      onClick={() => setDeleteTarget(photo)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </GCard>

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
