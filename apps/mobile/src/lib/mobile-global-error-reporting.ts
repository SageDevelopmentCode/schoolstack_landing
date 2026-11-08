import type { MobileErrorReportOptions, MobileErrorReporter } from '@/lib/mobile-error-reporter';

let reporter: MobileErrorReporter | null = null;

export function setMobileGlobalErrorReporter(next: MobileErrorReporter | null): void {
  reporter = next;
}

export function reportMobileGlobalOperationalError(
  operation: string,
  err: unknown,
  options?: MobileErrorReportOptions,
): void {
  reporter?.(operation, err, options);
}

const RECENT_GLOBAL_ERROR_WINDOW_MS = 60_000;
const recentGlobalErrors = new Map<string, number>();

/** True when the same global error was already reported in the last minute (loops, double paths). */
function isRecentDuplicateGlobalError(key: string, now: number): boolean {
  const last = recentGlobalErrors.get(key);
  if (last !== undefined && now - last < RECENT_GLOBAL_ERROR_WINDOW_MS) {
    return true;
  }
  recentGlobalErrors.set(key, now);

  if (recentGlobalErrors.size > 100) {
    for (const [entryKey, timestamp] of recentGlobalErrors) {
      if (now - timestamp >= RECENT_GLOBAL_ERROR_WINDOW_MS) {
        recentGlobalErrors.delete(entryKey);
      }
    }
  }
  return false;
}

/** Test helper. */
export function resetMobileGlobalErrorDedupeForTests(): void {
  recentGlobalErrors.clear();
  recentMediaFailures.clear();
}

function globalErrorKey(operation: string, err: unknown): string {
  if (err instanceof Error) {
    return `${operation}:${err.name}:${err.message}`;
  }
  return `${operation}:${String(err)}`;
}

/**
 * Reports an uncaught error (JS exception or unhandled promise rejection) with duplicate
 * suppression. Safe to call from several sources (ErrorUtils handler, Sentry hook).
 */
export function reportMobileUncaughtError(
  operation: 'uncaught_js_error' | 'unhandled_promise_rejection',
  err: unknown,
  options?: MobileErrorReportOptions,
): void {
  if (isRecentDuplicateGlobalError(globalErrorKey(operation, err), Date.now())) {
    return;
  }
  reportMobileGlobalOperationalError(operation, err, options);
}

const MEDIA_FAILURE_WINDOW_MS = 10 * 60_000;
const recentMediaFailures = new Map<string, number>();

/**
 * Reports a media (image/logo) load failure at most once per kind + host per 10 minutes, so a
 * broken storage host or expired signed URLs reach Discord without a per-tile flood.
 */
export function reportMobileMediaLoadFailure(kind: string, url: string | null | undefined): void {
  let host = 'unknown';
  try {
    if (url) host = new URL(url).host || 'unknown';
  } catch {
    host = 'invalid_url';
  }

  const key = `${kind}:${host}`;
  const now = Date.now();
  const last = recentMediaFailures.get(key);
  if (last !== undefined && now - last < MEDIA_FAILURE_WINDOW_MS) {
    return;
  }
  recentMediaFailures.set(key, now);

  reportMobileGlobalOperationalError(`media_load_failed_${kind}`, new Error(`Image failed to load from ${host}`), {
    metadata: { kind, host },
  });
}

type GlobalErrorHandler = (error: unknown, isFatal?: boolean) => void;

type ErrorUtilsLike = {
  getGlobalHandler?: () => GlobalErrorHandler;
  setGlobalHandler?: (handler: GlobalErrorHandler) => void;
};

function getErrorUtils(): ErrorUtilsLike | undefined {
  return (globalThis as { ErrorUtils?: ErrorUtilsLike }).ErrorUtils;
}

/**
 * Chains a React Native global error handler in front of the existing one (React Native's red
 * box / Sentry) so uncaught JS exceptions reach Discord. The previous handler always runs, so
 * fatal-error behavior and Sentry capture are unchanged. Returns an uninstall function.
 */
export function installMobileUncaughtErrorHandler(): () => void {
  const errorUtils = getErrorUtils();
  if (!errorUtils?.getGlobalHandler || !errorUtils.setGlobalHandler) {
    return () => undefined;
  }

  const previousHandler = errorUtils.getGlobalHandler();

  const handler: GlobalErrorHandler = (error, isFatal) => {
    try {
      reportMobileUncaughtError('uncaught_js_error', error, {
        metadata: { isFatal: Boolean(isFatal) },
      });
    } catch {
      // Reporting must never break the underlying error handling.
    }
    previousHandler?.(error, isFatal);
  };

  errorUtils.setGlobalHandler(handler);

  return () => {
    if (errorUtils.getGlobalHandler?.() === handler && previousHandler) {
      errorUtils.setGlobalHandler?.(previousHandler);
    }
  };
}

type SentryEventLike = {
  exception?: {
    values?: Array<{
      type?: string;
      value?: string;
      mechanism?: { type?: string; handled?: boolean };
    }>;
  };
};

/**
 * Sentry `beforeSend` hook: unhandled promise rejections are only observable through Sentry's
 * rejection tracker (installing a second tracker would replace Sentry's), so forward them here.
 */
export function reportUnhandledRejectionFromSentryEvent(event: SentryEventLike): void {
  const value = event.exception?.values?.find(
    (candidate) => candidate.mechanism?.type === 'onunhandledrejection',
  );
  if (!value) return;

  const message = value.value?.trim() || 'Unhandled promise rejection';
  const error = new Error(message);
  error.name = value.type?.trim() || 'UnhandledRejection';
  reportMobileUncaughtError('unhandled_promise_rejection', error);
}
