import { NextResponse } from "next/server";
import { notifyWebsiteApiError } from "@/lib/discord";

function stackFromCause(cause: unknown): string | undefined {
  if (cause instanceof Error && cause.stack) {
    return cause.stack;
  }
  if (cause !== undefined) {
    return String(cause);
  }
  return undefined;
}

function shouldNotify(status: number, notify?: boolean): boolean {
  if (notify !== undefined) {
    return notify;
  }
  return status >= 500;
}

export function apiError(
  route: string,
  opts: {
    request?: Request;
    method?: string;
    status: number;
    error: string;
    code?: string;
    cause?: unknown;
    notify?: boolean;
  },
): NextResponse {
  const method = opts.method ?? opts.request?.method ?? "UNKNOWN";

  if (opts.status >= 400) {
    console.error(`[${route}] ${opts.status} ${opts.error}`, opts.cause ?? "");
  }

  if (shouldNotify(opts.status, opts.notify)) {
    void notifyWebsiteApiError({
      route,
      method,
      status: opts.status,
      error: opts.error,
      code: opts.code,
      stack: stackFromCause(opts.cause),
    });
  }

  return NextResponse.json(
    {
      error: opts.error,
      ...(opts.code ? { code: opts.code } : {}),
    },
    { status: opts.status },
  );
}
