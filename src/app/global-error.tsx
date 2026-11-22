"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";
import { reportPublicSiteClientError } from "@/lib/public-site/report-client-error";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
    // The whole page went blank: alert Discord too when it was a public page.
    reportPublicSiteClientError({
      source: "render_crash",
      message: error.message || "Page crashed while rendering",
      stack: error.stack,
    });
  }, [error]);

  return (
    <html>
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
