"use client";

import { useEffect } from "react";
import { isChunkLoadError, reloadOnceForChunkError } from "@/lib/chunk-load-recovery";
import { isPublicSitePath } from "@/lib/public-site/client-error-filter";
import {
  messageFromRejectionReason,
  PUBLIC_SITE_ERROR_REPORTING_ENABLED,
  reportPublicSiteClientError,
} from "@/lib/public-site/report-client-error";

/**
 * Reports uncaught browser errors on public marketing pages (home, /get-started,
 * /free-preview, tools, blog…) so they reach Discord, not only Sentry. Portals and admin
 * are skipped: they report their own errors. Renders nothing.
 */
export default function PublicSiteErrorReporter() {
  useEffect(() => {
    if (!PUBLIC_SITE_ERROR_REPORTING_ENABLED) return;

    /** A stale chunk on a public page (deploy mid-visit): reload once instead of alerting.
     *  Portals are left alone so a reload never throws away a half-filled form. */
    const recoverFromChunkError = (error: unknown) =>
      isPublicSitePath(window.location.pathname) &&
      isChunkLoadError(error) &&
      reloadOnceForChunkError();

    const onError = (event: ErrorEvent) => {
      const error: unknown = event.error;
      if (recoverFromChunkError(error ?? event.message)) return;
      reportPublicSiteClientError({
        source: "window_error",
        message: event.message || (error instanceof Error ? error.message : ""),
        filename: event.filename,
        stack: error instanceof Error ? error.stack : null,
      });
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const message = messageFromRejectionReason(event.reason);
      if (!message) return;
      if (recoverFromChunkError(event.reason ?? message)) return;
      reportPublicSiteClientError({
        source: "unhandled_rejection",
        message,
        stack: event.reason instanceof Error ? event.reason.stack : null,
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
