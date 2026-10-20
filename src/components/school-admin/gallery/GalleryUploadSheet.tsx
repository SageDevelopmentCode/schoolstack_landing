"use client";

import { useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import SchoolAdminSlideOverShell from "@/components/school-admin/ui/SchoolAdminSlideOverShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { uploadGalleryBatch } from "@/lib/school-gallery/upload-gallery-batch";
import type { GalleryPhoto } from "@/lib/school-gallery/types";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

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

type UploadPhase = "idle" | "preparing" | "uploading";

function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function computeProgressPercent(
  phase: UploadPhase,
  prepareIndex: number,
  prepareTotal: number,
  uploadLoaded: number,
  uploadTotal: number,
): number {
  if (phase === "idle") return 0;
  if (phase === "preparing") {
    if (prepareTotal <= 0) return 5;
    return Math.round((prepareIndex / prepareTotal) * 40);
  }
  if (uploadTotal > 0) {
    return 40 + Math.round((uploadLoaded / uploadTotal) * 60);
  }
  return 55;
}

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
  const [photoDate, setPhotoDate] = useState(todayIsoDate());
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [prepareIndex, setPrepareIndex] = useState(0);
  const [prepareTotal, setPrepareTotal] = useState(0);
  const [preparedFileNames, setPreparedFileNames] = useState<Set<string>>(
    () => new Set(),
  );
  const [uploadLoaded, setUploadLoaded] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [statusLine, setStatusLine] = useState("");

  const resetProgress = () => {
    setPhase("idle");
    setPrepareIndex(0);
    setPrepareTotal(0);
    setPreparedFileNames(new Set());
    setUploadLoaded(0);
    setUploadTotal(0);
    setStatusLine("");
  };

  const handleClose = () => {
    if (uploading) return;
    onClose();
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    setUploading(true);
    resetProgress();
    setPhase("preparing");
    setPrepareTotal(fileArray.length);
    setStatusLine(`Compressing 0 of ${fileArray.length}…`);

    try {
      const targetUrl = uploadUrl ?? `/api/school/${slug}/gallery`;
      const { photos } = await uploadGalleryBatch({
        files: fileArray,
        photoDate,
        uploadUrl: targetUrl,
        onPrepareProgress: ({ index, total, fileName }) => {
          setPrepareIndex(index);
          setPrepareTotal(total);
          setStatusLine(`Compressing ${index} of ${total}…`);
          setPreparedFileNames((current) => {
            const next = new Set(current);
            next.add(fileName);
            return next;
          });
        },
        onUploadProgress: ({ loaded, total }) => {
          setPhase("uploading");
          setUploadLoaded(loaded);
          setUploadTotal(total);
          if (total > 0) {
            const pct = Math.round((loaded / total) * 100);
            setStatusLine(`Uploading… ${pct}%`);
          } else {
            setStatusLine("Uploading…");
          }
        },
      });

      onUploaded(photos);
      adminToast.success(`Uploaded ${photos.length} photo(s).`);
      onClose();
      setSelectedFiles([]);
      resetProgress();
      if (inputRef.current) inputRef.current.value = "";
    } catch (error) {
      resetProgress();
      void reportPortalOperationalError(
        operationalErrorSurface,
        {
          organizationId,
          operation: "gallery.upload",
          error: "",
        },
        error,
      );
      adminToast.error(formatActionError(error, "Could not upload photos."));
    } finally {
      setUploading(false);
    }
  };

  const progressPercent = computeProgressPercent(
    phase,
    prepareIndex,
    prepareTotal,
    uploadLoaded,
    uploadTotal,
  );
  const showProgress = phase !== "idle";

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
            onClick={() => void handleUpload(inputRef.current?.files ?? null)}
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
              setSelectedFiles(files);
              resetProgress();
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
