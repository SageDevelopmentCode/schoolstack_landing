/**
 * Server-only Sentry org API credentials for platform admin observability.
 * Requires token scopes: org:read, project:read, event:read (and Discover for performance).
 *
 * Env: SENTRY_ORG, SENTRY_PROJECT, SENTRY_AUTH_TOKEN (same as next.config / source maps).
 */

export type SentryAdminConfig = {
  orgSlug: string;
  projectSlug: string;
  authToken: string;
  webBaseUrl: string;
};

export function isSentryAdminConfigured(): boolean {
  return Boolean(
    process.env.SENTRY_AUTH_TOKEN?.trim() &&
      process.env.SENTRY_ORG?.trim() &&
      process.env.SENTRY_PROJECT?.trim(),
  );
}

export function getSentryAdminConfig(): SentryAdminConfig {
  const orgSlug = process.env.SENTRY_ORG?.trim();
  const projectSlug = process.env.SENTRY_PROJECT?.trim();
  const authToken = process.env.SENTRY_AUTH_TOKEN?.trim();

  if (!orgSlug || !projectSlug || !authToken) {
    throw new Error(
      "Sentry admin API is not configured. Set SENTRY_ORG, SENTRY_PROJECT, and SENTRY_AUTH_TOKEN.",
    );
  }

  return {
    orgSlug,
    projectSlug,
    authToken,
    webBaseUrl: `https://${orgSlug}.sentry.io`,
  };
}

export function buildSentryIssueUrl(config: SentryAdminConfig, issueId: string): string {
  return `${config.webBaseUrl}/issues/${issueId}/`;
}

export function buildSentryEventUrl(config: SentryAdminConfig, eventId: string): string {
  return `${config.webBaseUrl}/issues/?query=${encodeURIComponent(eventId)}`;
}
