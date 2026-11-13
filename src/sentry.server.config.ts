import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN =
  process.env.SENTRY_DSN ??
  "https://d69c2a803a697e84f3cc15ad710f104a@o4511681648328704.ingest.us.sentry.io/4511681650556928";

// Off in local dev (it slows compiles and requests); set SENTRY_DEV=1 to debug Sentry locally.
const isDev = process.env.NODE_ENV === "development";

Sentry.init({
  dsn: SENTRY_DSN,
  enabled: !isDev || process.env.SENTRY_DEV === "1",
  tracesSampleRate: isDev ? 0 : 0.1,
  // Attaches the Node inspector to capture locals; too costly for the dev server.
  includeLocalVariables: !isDev,
  enableLogs: true,
});
