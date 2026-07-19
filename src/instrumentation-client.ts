import * as Sentry from "@sentry/nextjs";

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

Sentry.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  replaysSessionSampleRate: skipReplay ? 0 : 0.1,
  replaysOnErrorSampleRate: skipReplay ? 0 : 1.0,
  enableLogs: true,
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
