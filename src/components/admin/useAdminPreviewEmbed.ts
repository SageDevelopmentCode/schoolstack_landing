"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import {
  ADMIN_PREVIEW_EMBED_PARAM,
  isAdminPreviewEmbeddablePath,
  isAdminPreviewEmbedSearchParam,
} from "@/lib/admin/preview-device-viewport";

function subscribeToEmbedFrame() {
  return () => {};
}

function getIsInsidePreviewIframe(pathname: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  if (window.self === window.top) {
    return false;
  }
  return isAdminPreviewEmbeddablePath(pathname);
}

export function useAdminPreviewEmbed(): boolean {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const embedParam = searchParams.get(ADMIN_PREVIEW_EMBED_PARAM);

  const insideIframe = useSyncExternalStore(
    subscribeToEmbedFrame,
    () => getIsInsidePreviewIframe(pathname),
    () => false,
  );

  if (isAdminPreviewEmbedSearchParam(embedParam)) {
    return true;
  }

  return insideIframe;
}
