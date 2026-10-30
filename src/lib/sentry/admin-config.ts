/**
 * Server-only Sentry org API credentials for platform admin observability.
 * Requires token scopes: org:read, project:read, event:read (Explore spans for performance).
 *
 * Env: SENTRY_ORG, SENTRY_PROJECT (web), SENTRY_MOBILE_PROJECT (Expo app), SENTRY_AUTH_TOKEN.
 * See docs/sentry-env-and-verification.md for DSN and Vercel setup.
 */

export type SentryAdminConfig = {
  orgSlug: string;
  projectSlug: string;
  authToken: string;
  webBaseUrl: string;
};

export type SentryProjectTarget = "web" | "mobile";

function resolveProjectSlug(target: SentryProjectTarget): string | null {
  if (target === "mobile") {
    return process.env.SENTRY_MOBILE_PROJECT?.trim() || null;
  }
  return process.env.SENTRY_PROJECT?.trim() || "mudkitchenweb";
}

export function isSentryAdminConfigured(): boolean {
  return Boolean(
    process.env.SENTRY_AUTH_TOKEN?.trim() &&
      process.env.SENTRY_ORG?.trim() &&
      resolveProjectSlug("web"),
  );
}

export function isSentryMobileAdminConfigured(): boolean {
  return Boolean(
    process.env.SENTRY_AUTH_TOKEN?.trim() &&
      process.env.SENTRY_ORG?.trim() &&
      resolveProjectSlug("mobile"),
  );
}

export function getSentryAdminConfigForProject(
  projectSlug: string,
): SentryAdminConfig {
  const orgSlug = process.env.SENTRY_ORG?.trim();
  const authToken = process.env.SENTRY_AUTH_TOKEN?.trim();

  if (!orgSlug || !authToken || !projectSlug.trim()) {
    throw new Error(
      "Sentry admin API is not configured. Set SENTRY_ORG, SENTRY_PROJECT (or SENTRY_MOBILE_PROJECT), and SENTRY_AUTH_TOKEN.",
    );
  }

  return {
    orgSlug,
    projectSlug: projectSlug.trim(),
    authToken,
    webBaseUrl: `https://${orgSlug}.sentry.io`,
  };
}

/** Web (Next.js) Sentry project — default mudkitchenweb. */
export function getSentryWebAdminConfig(): SentryAdminConfig {
  const projectSlug = resolveProjectSlug("web");
  if (!projectSlug) {
    throw new Error("SENTRY_PROJECT is not configured.");
  }
  return getSentryAdminConfigForProject(projectSlug);
}

/** MudKitchen mobile app Sentry project (React Native). */
export function getSentryMobileAdminConfig(): SentryAdminConfig {
  const projectSlug = resolveProjectSlug("mobile");
  if (!projectSlug) {
    throw new Error(
      "SENTRY_MOBILE_PROJECT is not configured for mobile observability.",
    );
  }
  return getSentryAdminConfigForProject(projectSlug);
}

export function getSentryAdminConfigForTarget(
  target: SentryProjectTarget,
): SentryAdminConfig {
  return target === "mobile"
    ? getSentryMobileAdminConfig()
    : getSentryWebAdminConfig();
}

/** @deprecated Prefer getSentryWebAdminConfig or getSentryAdminConfigForTarget. */
export function getSentryAdminConfig(): SentryAdminConfig {
  return getSentryWebAdminConfig();
}

export function buildSentryIssueUrl(config: SentryAdminConfig, issueId: string): string {
  return `${config.webBaseUrl}/issues/${issueId}/`;
}

export function buildSentryEventUrl(config: SentryAdminConfig, eventId: string): string {
  return `${config.webBaseUrl}/issues/?query=${encodeURIComponent(eventId)}`;
}
