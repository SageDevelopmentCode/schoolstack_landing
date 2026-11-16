"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ImagePlus, Loader2, Upload, X } from "lucide-react";
import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import { GProgress, G_FOCUS, gBtnOutlineSm, gBtnPopSm } from "@/components/school-parent/garden/ui";
import {
  BusyLabel,
  GardenField,
  GardenNotice,
  GardenNumberedSection,
  gInputClass,
} from "@/components/school-admin/garden/kit";
import { useGalleryUpload } from "@/components/school-gallery/useGalleryUpload";
import { formatGalleryDateLabel } from "@/lib/school-gallery/format-gallery-date";
import type { GalleryPhoto } from "@/lib/school-gallery/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { shortGalleryDate } from "./usePhotosModel";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const photosLabel = (count: number) => `${count} ${count === 1 ? "photo" : "photos"}`;

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function StepStrip({ steps }: { steps: { label: string; state: "done" | "current" | "todo" }[] }) {
  return (
    <ol className="m-0 flex list-none items-center gap-2 px-5 pb-3 sm:px-6" aria-label="Upload steps">
      {steps.map((step, index) => (
        <li key={step.label} className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[11.5px] font-extrabold ${
              step.state === "done"
                ? "border-[var(--sf-forest)] bg-[var(--sf-mint)] text-[var(--sf-forest)]"
                : step.state === "current"
                  ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white"
                  : "border-[var(--sf-ink)]/20 bg-white text-[var(--sf-ink)]/50"
            }`}
          >
            {step.state === "done" ? <Check className="h-3.5 w-3.5" /> : index + 1}
          </span>
          <span
            className={`truncate text-[12.5px] font-extrabold ${
              step.state === "todo" ? "text-[var(--sf-ink)]/45" : "text-[var(--sf-ink)]"
            }`}
          >
            <span className="sr-only">{`Step ${index + 1}, ${step.state === "done" ? "done" : step.state === "current" ? "current" : "to do"}: `}</span>
            {step.label}
          </span>
          {index < steps.length - 1 ? <span aria-hidden className="h-px w-4 bg-[var(--sf-ink)]/20 sm:w-8" /> : null}
        </li>
      ))}
    </ol>
  );
}

/** Admin Garden upload: 1 Date · 2 Photos (drop, paste, pick) · 3 Upload with progress. */
export default function GardenGalleryUploadSheet({
  open,
  onClose,
  slug,
  organizationId,
  theme,
  onUploaded,
}: {
  open: boolean;
  onClose: () => void;
  slug: string;
  organizationId: string;
  theme: ParentThemeTokens;
  onUploaded: (photos: GalleryPhoto[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useGalleryUpload({ slug, organizationId, onUploaded });
  const [dragOver, setDragOver] = useState(false);
  const [skipped, setSkipped] = useState(0);
  const { selectedFiles, uploading, photoDate } = upload;

  const previews = useMemo(
    () => selectedFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [selectedFiles],
  );
  useEffect(
    () => () => {
      for (const preview of previews) URL.revokeObjectURL(preview.url);
    },
    [previews],
  );
  const totalBytes = selectedFiles.reduce((sum, file) => sum + file.size, 0);

  const addFiles = (incoming: File[]) => {
    const accepted = incoming.filter((file) => ACCEPTED.includes(file.type));
    setSkipped(incoming.length - accepted.length);
    if (accepted.length === 0) return;
    // Picking more adds to the batch (deduped by name + size).
    const key = (file: File) => `${file.name}:${file.size}`;
    const existing = new Set(selectedFiles.map(key));
    upload.selectFiles([...selectedFiles, ...accepted.filter((file) => !existing.has(key(file)))]);
  };

  // Paste images straight from the clipboard while the panel is open.
  const addFilesRef = useRef(addFiles);
  useEffect(() => {
    addFilesRef.current = addFiles;
  });
  useEffect(() => {
    if (!open) return;
    const onPaste = (event: ClipboardEvent) => {
      const files = Array.from(event.clipboardData?.files ?? []);
      if (files.length === 0) return;
      event.preventDefault();
      addFilesRef.current(files);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [open]);

  const handleClose = () => {
    if (uploading) return;
    setSkipped(0);
    onClose();
  };

  const handleUpload = async () => {
    const result = await upload.upload();
    if (!result) return;
    if (inputRef.current) inputRef.current.value = "";
    if (result.status === "done") {
      adminToast.dismiss("gallery-upload-error");
      adminToast.success(`Uploaded ${photosLabel(result.photos.length)} to ${shortGalleryDate(photoDate)}.`, {
        id: "gallery-upload",
        description: "Families and staff can see them in the gallery now.",
      });
      setSkipped(0);
      onClose();
      return;
    }
    if (result.status === "partial") {
      adminToast.error(`Uploaded ${photosLabel(result.photos.length)}. ${result.remaining} didn't make it.`, {
        id: "gallery-upload-error",
        description: `${photosLabel(result.remaining)} ${result.remaining === 1 ? "is" : "are"} still in the batch — press Upload to try again.`,
      });
      return;
    }
    adminToast.error("Couldn't upload the photos.", {
      id: "gallery-upload-error",
      description: `${formatActionError(result.error, "Could not upload photos.")} Nothing was added to the gallery.`,
      action: { label: "Retry", onClick: () => void handleUploadRef.current() },
    });
  };
  const handleUploadRef = useRef(handleUpload);
  useEffect(() => {
    handleUploadRef.current = handleUpload;
  });

  const steps = [
    { label: "Date", state: "done" as const },
    { label: "Photos", state: selectedFiles.length > 0 ? ("done" as const) : ("current" as const) },
    { label: "Upload", state: selectedFiles.length > 0 ? ("current" as const) : ("todo" as const) },
  ];

  return (
    <GSidePanel
      theme={theme}
      open={open}
      onClose={handleClose}
      title="Upload photos"
      kicker="Gallery"
      subtitle="Photos are compressed before upload to save space."
      testId="admin-gallery-upload-panel"
      panelId="admin-gallery-upload"
      headerBelow={<StepStrip steps={steps} />}
      footer={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0 text-[12.5px] font-bold tabular-nums text-[var(--sf-soft)]" aria-live="polite">
            {uploading
              ? upload.statusLine
              : selectedFiles.length > 0
                ? `${photosLabel(selectedFiles.length)} ready · ${formatBytes(totalBytes)}`
                : "Choose photos to upload"}
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <button type="button" className={gBtnOutlineSm} onClick={handleClose} disabled={uploading}>
              Cancel
            </button>
            <button
              type="button"
              className={gBtnPopSm}
              onClick={() => void handleUpload()}
              disabled={uploading || selectedFiles.length === 0}
              aria-busy={uploading || undefined}
              data-testid="admin-gallery-upload-submit"
            >
              <BusyLabel busy={uploading} busyLabel="Uploading…" icon={<Upload className="h-4 w-4" aria-hidden />}>
                {selectedFiles.length > 0
                  ? upload.retryPending
                    ? `Retry ${photosLabel(selectedFiles.length)}`
                    : `Upload ${photosLabel(selectedFiles.length)}`
                  : "Upload"}
              </BusyLabel>
            </button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-7">
        <GardenNumberedSection
          step={1}
          title="Pick the day"
          description="The gallery groups photos by this date."
          done
          id="gallery-upload-date"
        >
          <GardenField id="gallery-upload-date-input" label={<span className="sr-only">Photo date</span>} hint={photoDate ? formatGalleryDateLabel(photoDate) : undefined}>
            <input
              id="gallery-upload-date-input"
              type="date"
              value={photoDate}
              onChange={(event) => upload.setPhotoDate(event.target.value)}
              disabled={uploading}
              className={gInputClass(null, "sm:max-w-[240px]")}
              data-garden-skip
            />
          </GardenField>
        </GardenNumberedSection>

        <GardenNumberedSection
          step={2}
          title="Add photos"
          description="JPEG, PNG or WebP · drop, paste, or choose"
          done={selectedFiles.length > 0}
          id="gallery-upload-files"
          action={
            selectedFiles.length > 0 && !uploading ? (
              <button type="button" className="text-[12.5px] font-extrabold text-[var(--sf-clay-deep)] hover:underline" onClick={() => upload.reset()}>
                Clear all
              </button>
            ) : undefined
          }
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            multiple
            className="hidden"
            data-garden-skip
            onChange={(event) => {
              addFiles(event.target.files ? Array.from(event.target.files) : []);
              event.target.value = "";
            }}
          />
          <div
            role="button"
            tabIndex={uploading ? -1 : 0}
            aria-disabled={uploading}
            aria-label="Choose photos to upload"
            onClick={() => !uploading && inputRef.current?.click()}
            onKeyDown={(event) => {
              if (uploading) return;
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              if (!uploading) setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragOver(false);
              if (uploading) return;
              addFiles(Array.from(event.dataTransfer.files));
            }}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-[18px] border-2 border-dashed px-4 py-7 text-center transition-colors ${G_FOCUS} ${
              uploading
                ? "cursor-not-allowed border-[var(--sf-ink)]/12 bg-[var(--sf-paper)] opacity-70"
                : dragOver
                  ? "cursor-copy border-[var(--sf-clay)] bg-[var(--sf-accent-wash)]"
                  : "cursor-pointer border-[var(--sf-ink)]/22 bg-[var(--sf-paper)] hover:border-[var(--sf-clay)]/60 hover:bg-[var(--sf-accent-wash)]"
            }`}
            data-testid="admin-gallery-dropzone"
          >
            <span aria-hidden className="flex h-11 w-11 items-center justify-center rounded-[14px] border-[1.5px] border-[var(--sf-ink)]/15 bg-white">
              <ImagePlus className="h-5 w-5 text-[var(--sf-ink)]/70" />
            </span>
            <p className="m-0 text-[14px] font-extrabold text-[var(--sf-ink)]">
              {dragOver ? "Drop to add" : selectedFiles.length > 0 ? "Add more photos" : "Drop photos here or click to choose"}
            </p>
            <p className="m-0 text-[12.5px] font-semibold text-[var(--sf-soft)]">You can also paste images.</p>
          </div>

          {skipped > 0 ? (
            <GardenNotice tone="warning" className="mt-3" role="status">
              {skipped} {skipped === 1 ? "file was" : "files were"} skipped — only JPEG, PNG or WebP photos can be uploaded.
            </GardenNotice>
          ) : null}

          {previews.length > 0 ? (
            <ul className="m-0 mt-3 grid list-none grid-cols-3 gap-2 p-0 sm:grid-cols-4" aria-label="Photos to upload">
              {previews.map(({ file, url }, index) => {
                const prepared = upload.preparedFileNames.has(file.name);
                return (
                  <li key={`${file.name}-${file.size}-${index}`} className="relative aspect-square overflow-hidden rounded-[12px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={file.name} className="h-full w-full object-cover" />
                    {uploading ? (
                      <span
                        aria-hidden
                        className={`absolute inset-0 flex items-center justify-center transition-colors ${
                          prepared || upload.phase === "uploading" ? "bg-[var(--sf-forest)]/35" : "bg-black/30"
                        }`}
                      >
                        {prepared || upload.phase === "uploading" ? (
                          <Check className="h-5 w-5 text-white" strokeWidth={3} />
                        ) : (
                          <Loader2 className="h-5 w-5 animate-spin text-white" />
                        )}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => upload.removeFile(index)}
                        aria-label={`Remove ${file.name}`}
                        className={`absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full border-[1.5px] border-white/80 bg-[rgba(24,20,16,0.62)] text-white hover:bg-[rgba(24,20,16,0.85)] ${G_FOCUS}`}
                      >
                        <X className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </GardenNumberedSection>

        <GardenNumberedSection
          step={3}
          title="Upload"
          description={
            upload.retryPending
              ? "Some photos didn't upload last time. They're ready to try again."
              : "Press Upload. You can keep this panel open to watch progress."
          }
          id="gallery-upload-go"
        >
          {upload.showProgress ? (
            <div className="flex flex-col gap-2 rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-3.5">
              <p className="m-0 text-[13px] font-extrabold text-[var(--sf-ink)]">{upload.statusLine}</p>
              <GProgress value={upload.progressPercent} total={100} label="Upload progress" />
            </div>
          ) : (
            <p className="m-0 text-[13px] font-semibold text-[var(--sf-soft)]">
              {selectedFiles.length > 0
                ? `${photosLabel(selectedFiles.length)} will be added to ${formatGalleryDateLabel(photoDate)}.`
                : "Nothing selected yet."}
            </p>
          )}
        </GardenNumberedSection>
      </div>
    </GSidePanel>
  );
}
