export type ClientOperationalErrorPayload = {
  organizationId: string;
  operation: string;
  error: string;
  code?: string;
  details?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  notify?: boolean;
};

type SupabaseErrorShape = {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
};

export function parseOperationalError(err: unknown): {
  message: string;
  code?: string;
  details?: string;
} {
  if (err && typeof err === "object") {
    const error = err as SupabaseErrorShape;
    const parts = [error.message, error.details, error.hint].filter(
      (part): part is string => Boolean(part && part.trim()),
    );
    if (parts.length > 0) {
      return {
        message: parts.join(" — "),
        code: error.code,
        details: error.details,
      };
    }
  }

  if (err instanceof Error && err.message) {
    return { message: err.message };
  }

  if (typeof err === "string" && err.trim()) {
    return { message: err.trim() };
  }

  return { message: "Unknown error" };
}

export function isUnexpectedOperationalError(err: unknown): boolean {
  if (err instanceof Error) {
    return true;
  }

  if (err && typeof err === "object") {
    const error = err as SupabaseErrorShape;
    if (error.code || error.details || error.hint) {
      return true;
    }
    if (error.message?.trim()) {
      return true;
    }
  }

  return false;
}

export async function reportClientOperationalError(
  payload: ClientOperationalErrorPayload,
): Promise<void> {
  try {
    await fetch("/api/school-admin/operational-errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (reportError) {
    console.error("[operational-errors] client report failed:", reportError);
  }
}

export async function reportPublicApplyOperationalError(
  payload: ClientOperationalErrorPayload,
): Promise<void> {
  try {
    await fetch("/api/admissions/operational-errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (reportError) {
    console.error("[operational-errors] public apply report failed:", reportError);
  }
}

export function shouldReportApplyClientError(
  err: unknown,
  responseStatus?: number,
): boolean {
  return shouldReportPortalClientError(err, responseStatus);
}

export function reportApplyOperationalError(
  organizationId: string | undefined,
  operation: string,
  err: unknown,
  options?: {
    responseStatus?: number;
    entityType?: string;
    entityId?: string;
  },
): void {
  if (!organizationId || !shouldReportApplyClientError(err, options?.responseStatus)) {
    return;
  }

  const parsed = parseOperationalError(err);
  void reportPublicApplyOperationalError({
    organizationId,
    operation,
    error: parsed.message,
    code: parsed.code,
    details: parsed.details,
    entityType: options?.entityType,
    entityId: options?.entityId,
    notify: true,
  });
}

export function shouldReportPortalClientError(
  err: unknown,
  responseStatus?: number,
): boolean {
  if (responseStatus !== undefined && responseStatus >= 400 && responseStatus < 500) {
    return false;
  }

  if (err instanceof DOMException && err.name === "AbortError") {
    return false;
  }

  return isUnexpectedOperationalError(err);
}

async function postOperationalError(
  endpoint: string,
  payload: ClientOperationalErrorPayload,
  logLabel: string,
): Promise<void> {
  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (reportError) {
    console.error(`[operational-errors] ${logLabel} report failed:`, reportError);
  }
}

export async function reportParentPortalOperationalError(
  payload: ClientOperationalErrorPayload,
): Promise<void> {
  await postOperationalError(
    "/api/parent-portal/operational-errors",
    payload,
    "parent portal",
  );
}

export async function reportTeacherPortalOperationalError(
  payload: ClientOperationalErrorPayload,
): Promise<void> {
  await postOperationalError(
    "/api/teacher-portal/operational-errors",
    payload,
    "teacher portal",
  );
}
