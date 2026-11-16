"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGalleryPhotosFeed } from "@/components/school-gallery/useGalleryPhotosFeed";
import { useAdminAction } from "@/components/school-admin/garden/useAdminAction";
import { useAdminConfirm } from "@/components/school-admin/garden/useAdminConfirm";
import { formatGalleryDateLabel } from "@/lib/school-gallery/format-gallery-date";
import { groupGalleryPhotosByDate } from "@/lib/school-gallery/group-gallery-photos";
import type { GalleryPhoto } from "@/lib/school-gallery/types";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

/*
 * Photos view-model (admin Garden). Same gallery API as before
 * (GET/PATCH/DELETE /api/school/{slug}/gallery[/id], batch upload through
 * useGalleryUpload). New: a date dialog instead of window.prompt, confirms
 * instead of window.confirm, and a bulk delete that finishes every photo it
 * can and keeps the ones that failed selected for Retry.
 */

const FLASH_MS = 1800;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function shortGalleryDate(photoDate: string): string {
  const parsed = new Date(`${photoDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return photoDate;
  return parsed.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const photosLabel = (count: number) => `${count} ${count === 1 ? "photo" : "photos"}`;

export function usePhotosModel({
  organizationId,
  slug,
  C,
}: {
  organizationId: string;
  slug: string;
  C: AdminThemeTokens;
}) {
  const feed = useGalleryPhotosFeed({ listUrl: `/api/school/${slug}/gallery` });
  const action = useAdminAction();
  const { confirm, dialog: confirmDialog } = useAdminConfirm(C);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => Date.now());
  const [dateEdit, setDateEdit] = useState<{ photo: GalleryPhoto; value: string; error: string | null } | null>(null);
  const [bulk, setBulk] = useState<{ done: number; total: number } | null>(null);
  const flashTimer = useRef<number | null>(null);
  const photosRef = useRef(feed.photos);

  useEffect(() => {
    photosRef.current = feed.photos;
  }, [feed.photos]);

  useEffect(
    () => () => {
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
    },
    [],
  );

  const groups = useMemo(() => groupGalleryPhotosByDate(feed.photos), [feed.photos]);

  const flash = useCallback((ids: string[]) => {
    setFlashIds(new Set(ids));
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlashIds(new Set()), FLASH_MS);
  }, []);

  const scrollToPhoto = useCallback((photoId: string) => {
    window.setTimeout(() => {
      document
        .querySelector(`[data-photo-id="${photoId}"]`)
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 80);
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await feed.reload();
    setRefreshing(false);
    setLastUpdatedAt(Date.now());
  }, [feed]);

  const openPhoto = useCallback((photoId: string) => {
    const index = photosRef.current.findIndex((photo) => photo.id === photoId);
    if (index >= 0) setViewerIndex(index);
  }, []);

  const handleUploaded = useCallback(
    (uploaded: GalleryPhoto[]) => {
      feed.prependPhotos(uploaded);
      setLastUpdatedAt(Date.now());
      if (uploaded.length > 0) {
        flash(uploaded.map((photo) => photo.id));
        scrollToPhoto(uploaded[0].id);
      }
    },
    [feed, flash, scrollToPhoto],
  );

  /* ---------------- selection ---------------- */

  const startSelecting = useCallback(() => setSelectionMode(true), []);
  const stopSelecting = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);
  const toggleSelected = useCallback((photoId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(photoId)) next.delete(photoId);
      else next.add(photoId);
      return next;
    });
  }, []);
  const setDaySelected = useCallback((photoIds: string[], selected: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const id of photoIds) {
        if (selected) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }, []);
  const selectAllLoaded = useCallback(() => {
    setSelectedIds(new Set(photosRef.current.map((photo) => photo.id)));
  }, []);
  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  /* ---------------- delete ---------------- */

  const deletePhoto = useCallback(
    async (photoId: string) => {
      const response = await fetch(`/api/school/${slug}/gallery/${photoId}`, { method: "DELETE" });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Could not delete photo.");
      }
      const deletedIndex = photosRef.current.findIndex((photo) => photo.id === photoId);
      feed.removePhoto(photoId);
      setViewerIndex((current) => {
        if (current == null) return null;
        if (deletedIndex < 0) return current;
        if (current === deletedIndex) return null;
        if (current > deletedIndex) return current - 1;
        return current;
      });
    },
    [feed, slug],
  );

  const deleteOne = useCallback(
    async (photo: GalleryPhoto) => {
      const ok = await confirm({
        title: `Delete “${photo.fileName}”?`,
        description: "It's removed from the gallery for families and staff. This can't be undone.",
        confirmLabel: "Delete photo",
      });
      if (!ok) return;
      await action.run(
        async () => {
          try {
            await deletePhoto(photo.id);
          } catch (error) {
            void reportPortalOperationalError(
              "school_admin",
              { organizationId, operation: "gallery.delete", error: "" },
              error,
            );
            throw error;
          }
        },
        {
          key: `photo-delete:${photo.id}`,
          id: "photo-delete",
          flashKey: null,
          success: {
            title: "Photo deleted.",
            description: `It's gone from ${shortGalleryDate(photo.photoDate)} in the gallery.`,
          },
          error: {
            title: "Couldn't delete the photo.",
            description: "It's still in the gallery.",
            fallback: "Could not delete photo.",
          },
        },
      );
    },
    [action, confirm, deletePhoto, organizationId],
  );

  const runBulkDeleteRef = useRef<(ids: string[]) => Promise<void>>(async () => {});
  const runBulkDelete = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) return;
      const total = ids.length;
      const failed: string[] = [];
      let lastError: unknown = null;
      setBulk({ done: 0, total });
      for (let index = 0; index < ids.length; index += 1) {
        try {
          await deletePhoto(ids[index]);
        } catch (error) {
          failed.push(ids[index]);
          lastError = error;
        }
        setBulk({ done: index + 1, total });
      }
      setBulk(null);

      const deleted = total - failed.length;
      if (failed.length === 0) {
        adminToast.dismiss("photos-bulk-delete-error");
        adminToast.success(`Deleted ${photosLabel(total)}.`, {
          id: "photos-bulk-delete",
          description: "They're gone from the gallery for families and staff.",
        });
        setSelectedIds(new Set());
        setSelectionMode(false);
        return;
      }

      void reportPortalOperationalError(
        "school_admin",
        { organizationId, operation: "gallery.delete_selected", error: "" },
        lastError,
      );
      setSelectedIds(new Set(failed));
      adminToast.error(
        deleted > 0 ? `Deleted ${deleted} of ${photosLabel(total)}.` : "Couldn't delete the selected photos.",
        {
          id: "photos-bulk-delete-error",
          description: `${formatActionError(lastError, "Could not delete photos.")} ${photosLabel(failed.length)} ${
            failed.length === 1 ? "wasn't" : "weren't"
          } deleted and ${failed.length === 1 ? "is" : "are"} still selected.`,
          action: { label: "Retry", onClick: () => void runBulkDeleteRef.current(failed) },
        },
      );
    },
    [deletePhoto, organizationId],
  );

  useEffect(() => {
    runBulkDeleteRef.current = runBulkDelete;
  }, [runBulkDelete]);

  const deleteSelected = useCallback(async () => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    const ok = await confirm({
      title: `Delete ${photosLabel(ids.length)}?`,
      description: "They're removed from the gallery for families and staff. This can't be undone.",
      confirmLabel: `Delete ${photosLabel(ids.length)}`,
    });
    if (!ok) return;
    await runBulkDelete(ids);
  }, [confirm, runBulkDelete, selectedIds]);

  /* ---------------- edit date ---------------- */

  const openDateEdit = useCallback((photo: GalleryPhoto) => {
    setDateEdit({ photo, value: photo.photoDate, error: null });
  }, []);
  const closeDateEdit = useCallback(() => setDateEdit(null), []);
  const setDateValue = useCallback((value: string) => {
    setDateEdit((current) => (current ? { ...current, value, error: null } : current));
  }, []);

  const saveDate = useCallback(async () => {
    if (!dateEdit) return;
    const { photo } = dateEdit;
    const nextDate = dateEdit.value.trim();
    if (!ISO_DATE.test(nextDate)) {
      setDateEdit((current) => (current ? { ...current, error: "Pick a date." } : current));
      return;
    }
    if (nextDate === photo.photoDate) {
      setDateEdit(null);
      return;
    }
    await action.run(
      async () => {
        const response = await fetch(`/api/school/${slug}/gallery/${photo.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoDate: nextDate }),
        });
        const data = (await response.json().catch(() => ({}))) as { photo?: GalleryPhoto; error?: string };
        if (!response.ok) {
          throw new Error(data.error ?? "Could not update date.");
        }
        if (data.photo) feed.replacePhoto(data.photo);
        // Applied here so a successful Retry from the toast also closes the dialog.
        setDateEdit(null);
        flash([photo.id]);
        scrollToPhoto(photo.id);
        return data.photo ?? { ...photo, photoDate: nextDate };
      },
      {
        key: "photo-date",
        flashKey: null,
        success: (updated) => ({
          title: `Moved to ${shortGalleryDate(updated.photoDate)}.`,
          description: `It now shows under ${formatGalleryDateLabel(updated.photoDate)} in the gallery.`,
        }),
        error: {
          title: "Couldn't change the date.",
          description: `The photo is still on ${shortGalleryDate(photo.photoDate)}.`,
          fallback: "Could not update date.",
        },
      },
    );
  }, [action, dateEdit, feed, flash, scrollToPhoto, slug]);

  const { loadMoreRef, ...feedState } = feed;
  const model = {
    ...feedState,
    groups,
    refreshing,
    refresh,
    lastUpdatedAt,
    uploadOpen,
    setUploadOpen,
    permissionsOpen,
    setPermissionsOpen,
    selectionMode,
    selectedIds,
    startSelecting,
    stopSelecting,
    toggleSelected,
    setDaySelected,
    selectAllLoaded,
    clearSelection,
    viewerIndex,
    setViewerIndex,
    openPhoto,
    handleUploaded,
    flashIds,
    deleteOne,
    deleteSelected,
    bulk,
    pendingKey: action.pendingKey,
    dateEdit,
    openDateEdit,
    closeDateEdit,
    setDateValue,
    saveDate,
    confirmDialog,
  };
  // The infinite-scroll sentinel ref stays outside the model object so the
  // view can read model fields during render.
  return { model, loadMoreRef };
}

export type PhotosModel = ReturnType<typeof usePhotosModel>["model"];
