import * as Sentry from "@sentry/nextjs";
import type { Instrumentation } from "next";
import { reportOperationalError } from "@/lib/operational-errors";
import { createAdminClient } from "@/utils/supabase/admin";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  Sentry.captureRequestError(error, request, context);

  if (context.routeType !== "route" || !request.path.startsWith("/api/")) {
    return;
  }

  const err = error instanceof Error ? error : new Error(String(error));
  const route = context.routePath || request.path;

  await reportOperationalError({
    supabase: createAdminClient(),
    surface: "api",
    operation: route,
    error: err.message,
    notify: true,
    actor: { type: "system" },
    cause: err,
    api: {
      route,
      method: request.method,
      status: 500,
      stack: err.stack,
      digest:
        "digest" in err && typeof err.digest === "string" ? err.digest : undefined,
    },
  });
};
