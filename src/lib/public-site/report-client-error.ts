"use client";

import * as Sentry from "@sentry/nextjs";
import {
  isPublicSitePath,
  isReportablePublicClientError,
  PUBLIC_SITE_CLIENT_ERROR_LIMITS as LIMITS,
  type PublicSiteClientErrorSource,
} from "@/lib/public-site/client-error-filter";

export const PUBLIC_SITE_CLIENT_ERRORS_ENDPOINT = "/api/public-site/client-errors";

/** Same switch as Sentry in instrumentation-client.ts: off in local dev unless opted in. */
export const PUBLIC_SITE_ERROR_REPORTING_ENABLED =
  process.env.NODE_ENV !== "development" || process.env.NEXT_PUBLIC_SENTRY_DEV === "1";

const MAX_REPORTS_PER_PAGE_LOAD = 3;
const SESSION_KEY = "mk-public-errors-reported";

let reportsThisPageLoad = 0;

function alreadyReportedThisSession(fingerprint: string): boolean {
  try {
    const seen: unknown = JSON.parse(window.sessionStorage.getItem(SESSION_KEY) ?? "[]");
    const list = Array.isArray(seen) ? seen.filter((v): v is string => typeof v === "string") : [];
    if (list.includes(fingerprint)) return true;
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify([...list, fingerprint].slice(-20)));
    return false;
  } catch {
    // Storage blocked: fall back to the per-page-load cap.
    return false;
  }
}

/**
 * Sends one browser error from a public page to the server, which may post it to Discord.
 * Never throws; drops errors from portals, foreign scripts and known noise.
 */
export function reportPublicSiteClientError(input: {
  source: PublicSiteClientErrorSource;
  message: string;
  stack?: string | null;
  filename?: string | null;
}): void {
  try {
    if (!PUBLIC_SITE_ERROR_REPORTING_ENABLED || typeof window === "undefined") return;

    const path = window.location.pathname;
    const message = input.message.trim().slice(0, LIMITS.message);
    if (!isPublicSitePath(path)) return;
    if (
      !isReportablePublicClientError({
        message,
        filename: input.filename,
        stack: input.stack,
        pageOrigin: window.location.origin,
      })
    ) {
      return;
    }
    if (reportsThisPageLoad >= MAX_REPORTS_PER_PAGE_LOAD) return;
    if (alreadyReportedThisSession(`${path}\n${message}`)) return;
    reportsThisPageLoad += 1;

    // Let Sentry's own handler record the event first so its id can go in the alert.
    window.setTimeout(() => {
      const sentryEventId = Sentry.lastEventId();
      void fetch(PUBLIC_SITE_CLIENT_ERRORS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          path,
          message,
          source: input.source,
          ...(input.stack ? { stack: input.stack.slice(0, LIMITS.stack) } : {}),
          ...(sentryEventId ? { sentryEventId } : {}),
        }),
      }).catch(() => {
        // Reporting is best effort.
      });
    }, 0);
  } catch {
    // Never let error reporting cause an error.
  }
}

/** Message for a rejection reason, or null when it carries nothing useful. */
export function messageFromRejectionReason(reason: unknown): string | null {
  if (reason instanceof Error) return reason.message || reason.name || null;
  if (typeof reason === "string") return reason.trim() || null;
  return null;
}
