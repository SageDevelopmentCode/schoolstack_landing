"use client";

import { useRef } from "react";
import { Check, Loader2 } from "lucide-react";
import SchoolAdminSlideOverShell from "@/components/school-admin/ui/SchoolAdminSlideOverShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { useGalleryUpload } from "@/components/school-gallery/useGalleryUpload";
import type { GalleryPhoto } from "@/lib/school-gallery/types";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";

type GalleryUploadSheetProps = {
  open: boolean;
  onClose: () => void;
  slug: string;
  organizationId: string;
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  onUploaded: (photos: GalleryPhoto[]) => void;
  uploadUrl?: string;
  operationalErrorSurface?: "school_admin" | "teacher_portal";
};

export default function GalleryUploadSheet({
  open,
  onClose,
  slug,
  organizationId,
  theme,
  C,
  onUploaded,
  uploadUrl,
  operationalErrorSurface = "school_admin",
}: GalleryUploadSheetProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useGalleryUpload({
    slug,
    organizationId,
    uploadUrl,
    operationalErrorSurface,
    onUploaded,
  });
  const {
    photoDate,
    setPhotoDate,
    uploading,
    selectedFiles,
    phase,
    statusLine,
    preparedFileNames,
    progressPercent,
    showProgress,
  } = upload;

  const handleClose = () => {
    if (uploading) return;
    onClose();
  };

  const handleUpload = async () => {
    const result = await upload.upload();
    if (!result) return;
    if (inputRef.current) inputRef.current.value = "";
    if (result.status === "done") {
      adminToast.success(`Uploaded ${result.photos.length} photo(s).`);
      onClose();
      return;
    }
    if (result.status === "partial") {
      adminToast.info(
        `Uploaded ${result.photos.length} photo(s). ${result.remaining} left — tap Upload to retry.`,
      );
      return;
    }
    adminToast.error(formatActionError(result.error, "Could not upload photos."));
  };

  return (
    <SchoolAdminSlideOverShell
      open={open}
      onClose={handleClose}
      title="Upload photos"
      subtitle="Photos are compressed before upload to save space."
      C={C}
      widthClassName="w-[min(100%,28rem)]"
      footer={
        <div className="flex justify-end gap-2">
          <AdminButton
            type="button"
            theme={theme}
            variant="outline"
            onClick={handleClose}
            disabled={uploading}
          >
            Cancel
          </AdminButton>
          <AdminButton
            type="button"
            theme={theme}
            disabled={uploading || selectedFiles.length === 0}
            onClick={() => void handleUpload()}
          >
            {uploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                Uploading…
              </>
            ) : (
              "Upload"
            )}
          </AdminButton>
        </div>
      }
    >
      <div className="space-y-5">
        <label className="block text-sm">
          <span className="mb-1 block font-medium" style={{ color: theme.ink }}>
            Photo date
          </span>
          <input
            type="date"
            value={photoDate}
            onChange={(event) => setPhotoDate(event.target.value)}
            disabled={uploading}
            className="w-full rounded-lg border border-[#D8DEDF] px-3 py-2 text-sm disabled:opacity-60"
          />
        </label>

        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(event) => {
              const files = event.target.files
                ? Array.from(event.target.files)
                : [];
              upload.selectFiles(files);
            }}
          />
          <AdminButton
            type="button"
            theme={theme}
            variant="outline"
            className="w-full"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            Choose photos
          </AdminButton>
          {selectedFiles.length > 0 ? (
            <p className="mt-2 text-xs text-[#65747A]">
              {selectedFiles.length} file(s) selected
            </p>
          ) : null}
        </div>

        {showProgress ? (
          <div className="space-y-3 rounded-lg border border-[#E4E9EA] bg-[#F8FAFA] p-3">
            <p className="text-xs font-medium text-[#4A5560]">{statusLine}</p>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPercent}
              className="h-2 overflow-hidden rounded-full bg-[#E4E9EA]"
            >
              <div
                className="h-full rounded-full transition-[width] duration-200"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: theme.primary,
                }}
              />
            </div>
            {selectedFiles.length > 0 && phase === "preparing" ? (
              <ul className="max-h-32 space-y-1 overflow-y-auto text-xs text-[#65747A]">
                {selectedFiles.map((file) => (
                  <li key={file.name} className="flex items-center gap-2 truncate">
                    {preparedFileNames.has(file.name) ? (
                      <Check
                        className="h-3.5 w-3.5 shrink-0 text-[#34825A]"
                        aria-hidden
                      />
                    ) : (
                      <span className="inline-block h-3.5 w-3.5 shrink-0" />
                    )}
                    <span className="truncate">{file.name}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </SchoolAdminSlideOverShell>
  );
}
