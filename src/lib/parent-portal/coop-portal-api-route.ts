import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";

export function coopPortalApiError(
  route: string,
  request: Request,
  err: unknown,
  fallbackMessage: string,
): ReturnType<typeof apiError> {
  if (err instanceof Error) {
    if (err.message === "forbidden") {
      return apiError(route, {
        request,
        status: 403,
        error: "You do not have access to this program.",
        code: "forbidden",
      });
    }
    if (err.message === "coop_not_enabled") {
      return apiError(route, {
        request,
        status: 404,
        error: "Co-op content is not available for this program.",
        code: "not_found",
      });
    }
  }

  const resolved = portalRouteErrorStatus(err, fallbackMessage);
  return apiError(route, {
    request,
    status: resolved.status,
    error: resolved.message,
    code: resolved.code,
    cause: err,
  });
}
