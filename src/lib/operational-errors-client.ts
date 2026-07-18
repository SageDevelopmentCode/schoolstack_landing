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
  if (responseStatus !== undefined && responseStatus >= 400 && responseStatus < 500) {
    return false;
  }
  return isUnexpectedOperationalError(err);
}
