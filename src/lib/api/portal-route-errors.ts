export class PortalRouteError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "PortalRouteError";
    this.status = status;
    this.code = code;
  }
}

export function portalRouteErrorStatus(
  err: unknown,
  fallbackMessage: string,
): { status: number; message: string; code: string } {
  if (err instanceof PortalRouteError) {
    return {
      status: err.status,
      message: err.message,
      code: err.code,
    };
  }

  const message = err instanceof Error ? err.message : fallbackMessage;

  if (/^You do not have access/i.test(message) || /^Admin access required/i.test(message)) {
    return { status: 403, message, code: "forbidden" };
  }

  if (/not signed up for this/i.test(message)) {
    return { status: 403, message, code: "forbidden" };
  }

  if (/already/i.test(message)) {
    return { status: 409, message, code: "conflict" };
  }

  if (
    /not found$/i.test(message) ||
    /cannot accept/i.test(message) ||
    /already filled/i.test(message)
  ) {
    return { status: 400, message, code: "invalid_request" };
  }

  return { status: 500, message, code: "internal_error" };
}
