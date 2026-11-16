"use client";

import { useCallback, useState } from "react";
import { uploadGalleryBatch } from "@/lib/school-gallery/upload-gallery-batch";
import { isGalleryUploadPartialFailure } from "@/lib/school-gallery/gallery-upload-partial-error";
import type { GalleryPhoto } from "@/lib/school-gallery/types";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

/*
 * Gallery batch upload controller shared by the teacher sheet (story) and the
 * admin Garden sheet. Same behaviour as before: compress then upload with
 * progress; a partial failure keeps the already-compressed remaining files so
 * pressing Upload again retries only those. The hook never toasts; each sheet
 * says what happened in its own voice.
 */

export type GalleryUploadPhase = "idle" | "preparing" | "uploading";

export type GalleryUploadResult =
  | { status: "done"; photos: GalleryPhoto[] }
  | { status: "partial"; photos: GalleryPhoto[]; remaining: number }
  | { status: "error"; error: unknown };

export function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function computeProgressPercent(
  phase: GalleryUploadPhase,
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

export function useGalleryUpload({
  slug,
  organizationId,
  uploadUrl,
  operationalErrorSurface = "school_admin",
  onUploaded,
}: {
  slug: string;
  organizationId: string;
  uploadUrl?: string;
  operationalErrorSurface?: "school_admin" | "teacher_portal";
  onUploaded: (photos: GalleryPhoto[]) => void;
}) {
  const [photoDate, setPhotoDate] = useState(todayIsoDate());
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [pendingPreparedRetry, setPendingPreparedRetry] = useState<File[] | null>(null);
  const [phase, setPhase] = useState<GalleryUploadPhase>("idle");
  const [prepareIndex, setPrepareIndex] = useState(0);
  const [prepareTotal, setPrepareTotal] = useState(0);
  const [preparedFileNames, setPreparedFileNames] = useState<Set<string>>(() => new Set());
  const [uploadLoaded, setUploadLoaded] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [statusLine, setStatusLine] = useState("");

  const resetProgress = useCallback(() => {
    setPhase("idle");
    setPrepareIndex(0);
    setPrepareTotal(0);
    setPreparedFileNames(new Set());
    setUploadLoaded(0);
    setUploadTotal(0);
    setStatusLine("");
  }, []);

  /** Replace the selection (a new pick clears any pending retry). */
  const selectFiles = useCallback(
    (files: File[]) => {
      setSelectedFiles(files);
      setPendingPreparedRetry(null);
      resetProgress();
    },
    [resetProgress],
  );

  const removeFile = useCallback(
    (index: number) => {
      setSelectedFiles((current) => current.filter((_, i) => i !== index));
      setPendingPreparedRetry(null);
      resetProgress();
    },
    [resetProgress],
  );

  const reset = useCallback(() => {
    setSelectedFiles([]);
    setPendingPreparedRetry(null);
    resetProgress();
  }, [resetProgress]);

  const upload = useCallback(async (): Promise<GalleryUploadResult | null> => {
    if (selectedFiles.length === 0) return null;

    const fileArray = pendingPreparedRetry ?? selectedFiles;
    const alreadyPrepared = pendingPreparedRetry !== null;
    setUploading(true);
    resetProgress();
    if (alreadyPrepared) {
      setPhase("uploading");
      setStatusLine("Uploading…");
    } else {
      setPhase("preparing");
      setPrepareTotal(fileArray.length);
      setStatusLine(`Compressing 0 of ${fileArray.length}…`);
    }

    try {
      const targetUrl = uploadUrl ?? `/api/school/${slug}/gallery`;
      const { photos } = await uploadGalleryBatch({
        files: fileArray,
        photoDate,
        uploadUrl: targetUrl,
        alreadyPrepared,
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
      setSelectedFiles([]);
      setPendingPreparedRetry(null);
      resetProgress();
      return { status: "done", photos };
    } catch (error) {
      resetProgress();
      if (isGalleryUploadPartialFailure(error)) {
        if (error.cause !== undefined) {
          void reportPortalOperationalError(
            operationalErrorSurface,
            { organizationId, operation: "gallery.upload", error: "" },
            error.cause,
          );
        }
        onUploaded(error.uploadedPhotos);
        setSelectedFiles(error.remainingFiles);
        setPendingPreparedRetry(error.remainingFiles);
        return {
          status: "partial",
          photos: error.uploadedPhotos,
          remaining: error.remainingFiles.length,
        };
      }
      void reportPortalOperationalError(
        operationalErrorSurface,
        { organizationId, operation: "gallery.upload", error: "" },
        error,
      );
      return { status: "error", error };
    } finally {
      setUploading(false);
    }
  }, [
    onUploaded,
    operationalErrorSurface,
    organizationId,
    pendingPreparedRetry,
    photoDate,
    resetProgress,
    selectedFiles,
    slug,
    uploadUrl,
  ]);

  return {
    photoDate,
    setPhotoDate,
    uploading,
    selectedFiles,
    selectFiles,
    removeFile,
    reset,
    upload,
    phase,
    statusLine,
    preparedFileNames,
    retryPending: pendingPreparedRetry !== null,
    progressPercent: computeProgressPercent(phase, prepareIndex, prepareTotal, uploadLoaded, uploadTotal),
    showProgress: phase !== "idle",
  };
}

export type GalleryUploadController = ReturnType<typeof useGalleryUpload>;
