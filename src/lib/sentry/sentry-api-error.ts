export class SentryApiError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(status: number, body: string) {
    const trimmed = body.slice(0, 300);
    super(`Sentry API ${status}: ${trimmed || "request failed"}`);
    this.name = "SentryApiError";
    this.status = status;
    this.body = body;
  }
}

export function isSentryApiError(error: unknown): error is SentryApiError {
  return error instanceof SentryApiError;
}

export async function throwIfSentryResponseNotOk(response: Response): Promise<void> {
  if (response.ok) return;
  const body = await response.text().catch(() => "");
  throw new SentryApiError(response.status, body);
}

export const SENTRY_AUTH_FORBIDDEN_HINT =
  "If your token already lists event:read (Issue & Event → Read), check SENTRY_ORG matches your organization slug and that .env.local uses that token—then restart next dev. Organization tokens with only org:ci cannot call Sentry Explore. Otherwise add Project → Read, Organization → Read, and Issue & Event → Read. See docs/sentry-env-and-verification.md.";

export function sentryApiErrorDebugDetail(body: string): string | undefined {
  if (process.env.NODE_ENV === "production") return undefined;
  const trimmed = body.trim().slice(0, 200);
  return trimmed || undefined;
}
