import { isBenignClientNetworkError } from "@/lib/client-network-errors";

/**
 * Decides which browser errors on public marketing pages are worth a Discord alert, and
 * labels the visitor's browser for the alert. Pure and dependency-free so the browser
 * reporter, the API route and Sentry's `beforeSend` all share the same rules.
 */

export const PUBLIC_SITE_CLIENT_ERROR_LIMITS = {
  path: 300,
  message: 1000,
  stack: 4000,
  source: 40,
  sentryEventId: 64,
  userAgent: 400,
} as const;

export type PublicSiteClientErrorSource =
  | "window_error"
  | "unhandled_rejection"
  | "render_crash";

export const PUBLIC_SITE_CLIENT_ERROR_SOURCES: readonly PublicSiteClientErrorSource[] = [
  "window_error",
  "unhandled_rejection",
  "render_crash",
];

export type PublicSiteClientErrorReport = {
  path: string;
  message: string;
  stack?: string;
  source: PublicSiteClientErrorSource;
  sentryEventId?: string;
};

/** Paths whose browser errors are reported. The portals and admin have their own reporting. */
const NON_PUBLIC_PATH_PREFIXES = ["/school/", "/admin", "/api"];

export function isPublicSitePath(pathname: string): boolean {
  return !NON_PUBLIC_PATH_PREFIXES.some(
    (prefix) => pathname === prefix.replace(/\/$/, "") || pathname.startsWith(prefix),
  );
}

/**
 * Messages that never point at a bug in our code: opaque cross-origin errors, the
 * ResizeObserver warning, aborted requests, flaky networks, and in-app browsers
 * (Instagram, Facebook) whose injected scripts fail after their WebView is torn down.
 */
const IGNORED_MESSAGE_PATTERNS: RegExp[] = [
  /^(uncaught )?script error\.?$/i,
  /resizeobserver loop/i,
  /java object is gone/i,
  /^aborterror\b/i,
  /the operation was aborted/i,
  /the user aborted a request/i,
];

export function isIgnorableClientErrorMessage(message: string): boolean {
  const trimmed = message.trim().replace(/^(uncaught )?(error|typeerror): /i, "");
  if (!trimmed) return true;
  if (isBenignClientNetworkError(trimmed)) return true;
  return IGNORED_MESSAGE_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/**
 * True for scripts we did not serve: browser extensions, Safari's masked extension URLs,
 * in-app browser scripts (`app://navigation_performance_logger_android`) and other origins.
 * `app:///…` (three slashes) is how Sentry rewrites our own `_next` frames, so it is ours.
 */
export function isForeignScriptUrl(url: string, pageOrigin?: string): boolean {
  const value = url.trim();
  if (!value) return false;
  if (value.startsWith("app:///")) return false;
  if (/^app:\/\//i.test(value)) return true;
  if (/^[a-z-]*extension:\/\//i.test(value)) return true;
  if (/^webkit-masked-url:\/\//i.test(value)) return true;

  if (pageOrigin && /^https?:\/\//i.test(value)) {
    try {
      return new URL(value).origin !== pageOrigin;
    } catch {
      return false;
    }
  }

  return false;
}

const STACK_URL_PATTERN = /\b((?:https?|app|file|webkit-masked-url|[a-z-]*extension):\/\/[^\s)]+)/gi;

export function extractStackUrls(stack: string): string[] {
  return Array.from(stack.matchAll(STACK_URL_PATTERN), (match) => match[1]);
}

/** True when there is at least one known source and every one of them is foreign. */
export function isForeignOnlyError(sources: string[], pageOrigin?: string): boolean {
  const known = sources.filter((source) => source.trim());
  return known.length > 0 && known.every((source) => isForeignScriptUrl(source, pageOrigin));
}

export function isReportablePublicClientError(input: {
  message: string;
  filename?: string | null;
  stack?: string | null;
  pageOrigin?: string;
}): boolean {
  if (isIgnorableClientErrorMessage(input.message)) return false;

  if (input.filename?.trim()) {
    return !isForeignScriptUrl(input.filename, input.pageOrigin);
  }

  if (input.stack) {
    return !isForeignOnlyError(extractStackUrls(input.stack), input.pageOrigin);
  }

  return true;
}

/** Short label for the Discord alert, e.g. "Instagram in-app · Android". */
export function describeUserAgent(userAgent: string | null | undefined): string {
  const ua = userAgent?.trim() ?? "";
  if (!ua) return "Unknown";

  const inApp: [RegExp, string][] = [
    [/Instagram/i, "Instagram in-app"],
    [/FBAN|FBAV|FB_IAB/i, "Facebook in-app"],
    [/musical_ly|BytedanceWebview|TikTok/i, "TikTok in-app"],
    [/LinkedInApp/i, "LinkedIn in-app"],
    [/Pinterest/i, "Pinterest in-app"],
    [/Snapchat/i, "Snapchat in-app"],
  ];
  const browsers: [RegExp, string][] = [
    [/Edg(e|A|iOS)?\//, "Edge"],
    [/SamsungBrowser/, "Samsung Internet"],
    [/OPR\//, "Opera"],
    [/CriOS|Chrome\//, "Chrome"],
    [/FxiOS|Firefox\//, "Firefox"],
    [/Safari\//, "Safari"],
  ];
  const systems: [RegExp, string][] = [
    [/Android/, "Android"],
    [/iPhone|iPad|iPod/, "iOS"],
    [/Mac OS X|Macintosh/, "macOS"],
    [/Windows/, "Windows"],
    [/CrOS/, "ChromeOS"],
    [/Linux/, "Linux"],
  ];

  const app = inApp.find(([pattern]) => pattern.test(ua))?.[1];
  const browser = app ?? browsers.find(([pattern]) => pattern.test(ua))?.[1] ?? "Other browser";
  const os = systems.find(([pattern]) => pattern.test(ua))?.[1];
  return os ? `${browser} · ${os}` : browser;
}
