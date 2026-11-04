type JsonErrorPayload = {
  error?: string;
  code?: string;
};

export class PortalJsonApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "PortalJsonApiError";
    this.status = status;
    this.code = code;
  }
}

export function portalJsonApiErrorStatus(err: unknown): number | undefined {
  if (err instanceof PortalJsonApiError) {
    return err.status;
  }
  return undefined;
}

export function portalJsonApiErrorCode(err: unknown): string | undefined {
  if (err instanceof PortalJsonApiError) {
    return err.code;
  }
  return undefined;
}

export function throwPortalJsonApiError(
  payload: unknown,
  status: number,
  fallback: string,
): never {
  const body =
    payload && typeof payload === "object"
      ? (payload as JsonErrorPayload)
      : null;
  const message =
    body && typeof body.error === "string" && body.error.trim()
      ? body.error.trim()
      : fallback;
  const code =
    body && typeof body.code === "string" && body.code.trim()
      ? body.code.trim()
      : undefined;
  throw new PortalJsonApiError(message, status, code);
}
