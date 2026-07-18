import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN =
  process.env.NEXT_PUBLIC_SENTRY_DSN ??
  "https://d69c2a803a697e84f3cc15ad710f104a@o4511681648328704.ingest.us.sentry.io/4511681650556928";

const isHomepage =
  typeof window !== "undefined" && window.location.pathname === "/";

Sentry.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  replaysSessionSampleRate: isHomepage ? 0 : 0.1,
  replaysOnErrorSampleRate: isHomepage ? 0 : 1.0,
  enableLogs: true,
  integrations: isHomepage
    ? []
    : [
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
