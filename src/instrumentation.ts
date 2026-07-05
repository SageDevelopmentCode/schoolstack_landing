import type { Instrumentation } from "next";
import { notifyWebsiteApiError } from "@/lib/discord";

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  if (context.routeType !== "route" || !request.path.startsWith("/api/")) {
    return;
  }

  const err = error instanceof Error ? error : new Error(String(error));

  await notifyWebsiteApiError({
    route: context.routePath || request.path,
    method: request.method,
    status: 500,
    error: err.message,
    stack: err.stack,
    digest: "digest" in err && typeof err.digest === "string" ? err.digest : undefined,
  });
};
