import { NextResponse } from "next/server";
import { ACTIVITY_ACTIONS, logActivityEvent } from "@/lib/activity-log";
import {
  clampClientErrorString,
  shouldNotifyClientError,
} from "@/lib/client-operational-error-input";
import { notifyPublicSiteClientError } from "@/lib/discord";
import { getRequestIp } from "@/lib/public-forms/request-ip";
import {
  describeUserAgent,
  isPublicSitePath,
  isReportablePublicClientError,
  PUBLIC_SITE_CLIENT_ERROR_LIMITS as LIMITS,
  PUBLIC_SITE_CLIENT_ERROR_SOURCES,
  type PublicSiteClientErrorSource,
} from "@/lib/public-site/client-error-filter";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * Browser errors from public marketing pages (no sign-in), sent by PublicSiteErrorReporter.
 *
 * Anyone can POST here, so the server re-checks everything and stays quiet: it always answers
 * 204, never raises its own alert, and drops reports past the per-IP budget, the global
 * budget, or a repeat of the same error on the same page.
 */

const MAX_BODY_BYTES = 16_000;
const WINDOW_MS = 10 * 60 * 1000;
const GLOBAL_MAX_PER_WINDOW = 20;

const globalHistory: number[] = [];
const recentFingerprints = new Map<string, number>();

function underGlobalBudget(now: number): boolean {
  while (globalHistory.length > 0 && now - globalHistory[0] >= WINDOW_MS) {
    globalHistory.shift();
  }
  if (globalHistory.length >= GLOBAL_MAX_PER_WINDOW) return false;
  globalHistory.push(now);
  return true;
}

/** Same page + same message alerts once per window, however many visitors hit it. */
function isNewFingerprint(fingerprint: string, now: number): boolean {
  for (const [key, at] of recentFingerprints) {
    if (now - at >= WINDOW_MS) recentFingerprints.delete(key);
  }
  if (recentFingerprints.has(fingerprint)) return false;
  recentFingerprints.set(fingerprint, now);
  return true;
}

function noContent() {
  return new NextResponse(null, { status: 204 });
}

function normalizePath(value: unknown): string | null {
  const raw = clampClientErrorString(value, LIMITS.path);
  if (!raw || !raw.startsWith("/")) return null;
  // Never store query strings (ad click ids, emails in links) or fragments.
  return raw.split(/[?#]/)[0] || "/";
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return noContent();
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return noContent();
    body = parsed as Record<string, unknown>;
  } catch {
    return noContent();
  }

  const path = normalizePath(body.path);
  const message = clampClientErrorString(body.message, LIMITS.message);
  const stack = clampClientErrorString(body.stack, LIMITS.stack) ?? undefined;
  const source = clampClientErrorString(body.source, LIMITS.source);
  const sentryEventId =
    clampClientErrorString(body.sentryEventId, LIMITS.sentryEventId) ?? undefined;

  if (
    !path ||
    !message ||
    !source ||
    !PUBLIC_SITE_CLIENT_ERROR_SOURCES.includes(source as PublicSiteClientErrorSource) ||
    !isPublicSitePath(path) ||
    // No pageOrigin here: the browser already compared origins, and the server's own host can
    // differ from the page's (www vs apex, preview URLs). Scheme checks (app://, extensions) still run.
    !isReportablePublicClientError({ message, stack })
  ) {
    return noContent();
  }

  const now = Date.now();
  const ip = getRequestIp(request) ?? "unknown";
  if (!shouldNotifyClientError(`ip:${ip}`, "public_site", now)) return noContent();
  if (!isNewFingerprint(`${path}\n${message}`, now)) return noContent();
  if (!underGlobalBudget(now)) return noContent();

  const userAgent =
    clampClientErrorString(request.headers.get("user-agent"), LIMITS.userAgent) ?? null;
  const browser = describeUserAgent(userAgent);

  // The browser already sent this to Sentry; recording it here would only duplicate the issue.
  await logActivityEvent(createAdminClient(), {
    actorType: "system",
    surface: "public_site",
    action: ACTIVITY_ACTIONS.PUBLIC_SITE_CLIENT_ERROR,
    summary: `${path}: ${message}`.slice(0, 500),
    severity: "error",
    metadata: {
      path,
      source,
      error: message,
      browser,
      userAgent,
      ...(stack ? { stack } : {}),
      ...(sentryEventId ? { sentryEventId } : {}),
    },
  });

  try {
    await notifyPublicSiteClientError({ path, message, source, browser, stack, sentryEventId });
  } catch (err) {
    console.error("[public-site/client-errors] Discord notification failed:", err);
  }

  return noContent();
}
