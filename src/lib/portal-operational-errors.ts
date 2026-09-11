import type { ActivitySurface } from "@/lib/activity-log";
import {
  type ClientOperationalErrorPayload,
  parseOperationalError,
  reportClientOperationalError,
  reportParentPortalOperationalError,
  reportTeacherPortalOperationalError,
  shouldReportPortalClientError,
} from "@/lib/operational-errors-client";

export type PortalOperationalSurface =
  | "parent_portal"
  | "teacher_portal"
  | "school_admin";

const BENIGN_ERROR_CODES = new Set(["already_completed", "already_paid"]);

export function isBenignPortalErrorCode(code?: string): boolean {
  return code ? BENIGN_ERROR_CODES.has(code) : false;
}

export async function reportPortalOperationalError(
  surface: PortalOperationalSurface,
  payload: ClientOperationalErrorPayload,
  err: unknown,
  responseStatus?: number,
  responseCode?: string,
): Promise<void> {
  if (isBenignPortalErrorCode(responseCode ?? payload.code)) {
    return;
  }

  if (!payload.organizationId || !shouldReportPortalClientError(err, responseStatus)) {
    return;
  }

  const parsed = parseOperationalError(err);
  const reportPayload: ClientOperationalErrorPayload = {
    ...payload,
    error: payload.error || parsed.message,
    code: responseCode ?? payload.code ?? parsed.code,
    details: payload.details ?? parsed.details,
    notify: payload.notify ?? true,
  };

  if (surface === "parent_portal") {
    await reportParentPortalOperationalError(reportPayload);
    return;
  }

  if (surface === "teacher_portal") {
    await reportTeacherPortalOperationalError(reportPayload);
    return;
  }

  await reportClientOperationalError(reportPayload);
}

export function portalSurfaceLabel(surface: ActivitySurface): string {
  switch (surface) {
    case "parent_portal":
      return "Parent portal";
    case "teacher_portal":
      return "Teacher portal";
    case "school_admin":
      return "School admin";
    case "public_apply":
      return "Apply flow";
    case "api":
      return "API";
    case "system":
      return "System";
    default:
      return "Portal";
  }
}
