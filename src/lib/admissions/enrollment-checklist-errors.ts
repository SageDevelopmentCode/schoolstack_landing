import {
  parseOperationalError,
  reportPublicApplyOperationalError,
  shouldReportApplyClientError,
} from "@/lib/operational-errors-client";

export type EnrollmentChecklistErrorContext = {
  organizationId?: string;
  applicationId?: string;
  instanceId?: string;
};

export type ApiErrorBody = {
  error?: string;
  code?: string;
};

export async function parseApiErrorResponse(
  response: Response,
): Promise<{ message: string; code?: string }> {
  const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
  return {
    message: body.error?.trim() || "Request failed.",
    code: body.code,
  };
}

export function isBenignEnrollmentChecklistErrorCode(code?: string): boolean {
  return code === "already_completed" || code === "already_paid";
}

export function reportEnrollmentChecklistError(
  context: EnrollmentChecklistErrorContext,
  operation: string,
  err: unknown,
  responseStatus?: number,
  responseCode?: string,
): void {
  if (isBenignEnrollmentChecklistErrorCode(responseCode)) {
    return;
  }

  if (!context.organizationId || !shouldReportApplyClientError(err, responseStatus)) {
    return;
  }

  const parsed = parseOperationalError(err);
  void reportPublicApplyOperationalError({
    organizationId: context.organizationId,
    operation,
    error: parsed.message,
    code: responseCode ?? parsed.code,
    details: parsed.details,
    entityType: context.instanceId ? "enrollment_checklist_item" : "application",
    entityId: context.instanceId ?? context.applicationId,
    metadata: {
      applicationId: context.applicationId ?? null,
    },
    notify: true,
  });
}
