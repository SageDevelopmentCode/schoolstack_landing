"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect, useState } from "react";
import {
  canReloadForChunkError,
  isChunkLoadError,
  reloadForChunkError,
} from "@/lib/chunk-load-recovery";
import { reportPublicSiteClientError } from "@/lib/public-site/report-client-error";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  // A stale chunk after a deploy heals with one reload: show a blank page while it reloads,
  // not an error page. A second failure within 30 s is reported like any other crash.
  const [reloading] = useState(() => isChunkLoadError(error) && canReloadForChunkError());

  useEffect(() => {
    if (reloading) {
      reloadForChunkError();
      return;
    }

    Sentry.captureException(error);
    // The whole page went blank: alert Discord too when it was a public page.
    reportPublicSiteClientError({
      source: "render_crash",
      message: error.message || "Page crashed while rendering",
      stack: error.stack,
    });
  }, [error, reloading]);

  return (
    <html>
      <body>{reloading ? null : <NextError statusCode={0} />}</body>
    </html>
  );
}
