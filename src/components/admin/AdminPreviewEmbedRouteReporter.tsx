"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAdminPreviewEmbed } from "@/components/admin/useAdminPreviewEmbed";
import {
  ADMIN_PREVIEW_EMBED_ROUTE_MESSAGE,
  buildPreviewOuterHref,
  isAdminPreviewEmbeddablePath,
} from "@/lib/admin/preview-device-viewport";

export default function AdminPreviewEmbedRouteReporter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isEmbed = useAdminPreviewEmbed();

  useEffect(() => {
    if (!isEmbed || typeof window === "undefined") {
      return;
    }
    if (window.parent === window.self) {
      return;
    }
    if (!isAdminPreviewEmbeddablePath(pathname)) {
      return;
    }

    const outerHref = buildPreviewOuterHref(pathname, searchParams);
    let parentHref: string | null = null;
    try {
      const parent = window.parent.location;
      parentHref = buildPreviewOuterHref(parent.pathname, parent.search.slice(1));
    } catch {
      // cross-origin guard (should not happen for admin preview)
    }

    if (parentHref === outerHref) {
      return;
    }

    window.parent.postMessage(
      {
        type: ADMIN_PREVIEW_EMBED_ROUTE_MESSAGE,
        pathname,
        search: searchParams.toString(),
      },
      window.location.origin,
    );
  }, [isEmbed, pathname, searchParams]);

  return null;
}
