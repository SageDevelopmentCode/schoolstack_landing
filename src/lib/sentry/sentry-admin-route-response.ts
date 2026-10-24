import { NextResponse } from "next/server";
import {
  isSentryApiError,
  SENTRY_AUTH_FORBIDDEN_HINT,
  sentryApiErrorDebugDetail,
} from "@/lib/sentry/sentry-api-error";

export function sentryApiErrorResponse(
  error: unknown,
  extra?: Record<string, unknown>,
): NextResponse | null {
  if (!isSentryApiError(error)) return null;

  const sentryDetail = sentryApiErrorDebugDetail(error.body);

  if (error.status === 401 || error.status === 403) {
    return NextResponse.json(
      {
        error: "Sentry rejected this request (permission denied).",
        code: "sentry_forbidden",
        hint: SENTRY_AUTH_FORBIDDEN_HINT,
        sentryStatus: error.status,
        ...(sentryDetail ? { sentryDetail } : {}),
        ...extra,
      },
      { status: error.status },
    );
  }

  if (error.status >= 400 && error.status < 500) {
    return NextResponse.json(
      {
        error: error.message,
        code: "sentry_client_error",
        sentryStatus: error.status,
        ...(sentryDetail ? { sentryDetail } : {}),
        ...extra,
      },
      { status: error.status },
    );
  }

  return null;
}
