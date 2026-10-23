"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  ADMIN_PREVIEW_EMBED_COOKIE,
  ADMIN_PREVIEW_VIEWPORT_STORAGE_KEY,
  type AdminPreviewViewportMode,
} from "@/lib/admin/preview-device-viewport";

const DEFAULT_MODE: AdminPreviewViewportMode = "desktop";

function readStoredViewport(): AdminPreviewViewportMode {
  if (typeof window === "undefined") {
    return DEFAULT_MODE;
  }
  try {
    const stored = window.localStorage.getItem(ADMIN_PREVIEW_VIEWPORT_STORAGE_KEY);
    return stored === "mobile" ? "mobile" : DEFAULT_MODE;
  } catch {
    return DEFAULT_MODE;
  }
}

function syncEmbedCookie(mode: AdminPreviewViewportMode) {
  if (typeof document === "undefined") {
    return;
  }
  if (mode === "mobile") {
    document.cookie = `${ADMIN_PREVIEW_EMBED_COOKIE}=1; path=/; SameSite=Lax`;
  } else {
    document.cookie = `${ADMIN_PREVIEW_EMBED_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  }
}

const VIEWPORT_CHANGE_EVENT = "admin-preview-viewport-change";

function subscribeToViewportStorage(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === ADMIN_PREVIEW_VIEWPORT_STORAGE_KEY) {
      onStoreChange();
    }
  };
  const onLocalChange = () => onStoreChange();
  window.addEventListener("storage", onStorage);
  window.addEventListener(VIEWPORT_CHANGE_EVENT, onLocalChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(VIEWPORT_CHANGE_EVENT, onLocalChange);
  };
}

export function useAdminPreviewViewport() {
  const viewport = useSyncExternalStore(
    subscribeToViewportStorage,
    readStoredViewport,
    () => DEFAULT_MODE,
  );

  useEffect(() => {
    syncEmbedCookie(viewport);
  }, [viewport]);

  const setViewport = useCallback((mode: AdminPreviewViewportMode) => {
    try {
      window.localStorage.setItem(ADMIN_PREVIEW_VIEWPORT_STORAGE_KEY, mode);
    } catch {
      // ignore quota / private mode
    }
    window.dispatchEvent(new Event(VIEWPORT_CHANGE_EVENT));
  }, []);

  return { viewport, setViewport };
}
