import * as Sentry from "@sentry/nextjs";
import type { ErrorEvent as SentryErrorEvent } from "@sentry/nextjs";
import { isForeignOnlyError } from "@/lib/public-site/client-error-filter";

const SENTRY_DSN =
  process.env.NEXT_PUBLIC_SENTRY_DSN ??
  "https://d69c2a803a697e84f3cc15ad710f104a@o4511681648328704.ingest.us.sentry.io/4511681650556928";

function shouldSkipSessionReplay(): boolean {
  if (typeof window === "undefined") return false;

  const pathname = window.location.pathname;
  if (pathname === "/") return true;

  if (!pathname.startsWith("/school/")) return false;

  return (
    pathname.includes("/forms/") ||
    pathname.includes("/apply") ||
    pathname.includes("/parent")
  );
}

const skipReplay = shouldSkipSessionReplay();

/**
 * Drops errors thrown only by scripts we don't serve, such as the logger Instagram's in-app
 * browser injects (`app://navigation_performance_logger_android`, "Java object is gone") or
 * browser extensions. Our own frames show up as https URLs or Sentry's `app:///_next/…`.
 * Scheme-only check, so errors from any https script (ours or third-party) are kept.
 */
function dropForeignScriptErrors(event: SentryErrorEvent): SentryErrorEvent | null {
  const values = event.exception?.values ?? [];
  const messages = values.map((value) => value.value ?? "");
  if (messages.some((message) => /java object is gone/i.test(message))) return null;

  const filenames = values.flatMap(
    (value) => value.stacktrace?.frames?.map((frame) => frame.filename ?? "") ?? [],
  );
  // No pageOrigin: errors from third-party scripts we load on purpose (Stripe, analytics) stay.
  return isForeignOnlyError(filenames) ? null : event;
}

// Off in local dev; set NEXT_PUBLIC_SENTRY_DEV=1 to debug Sentry locally.
const isDev = process.env.NODE_ENV === "development";

Sentry.init({
  dsn: SENTRY_DSN,
  enabled: !isDev || process.env.NEXT_PUBLIC_SENTRY_DEV === "1",
  tracesSampleRate: isDev ? 0 : 0.1,
  replaysSessionSampleRate: skipReplay ? 0 : 0.1,
  replaysOnErrorSampleRate: skipReplay ? 0 : 1.0,
  enableLogs: true,
  beforeSend: dropForeignScriptErrors,
  integrations: skipReplay
    ? []
    : [
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
