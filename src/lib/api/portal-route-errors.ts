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

  if (
    /^You can only assign forms to your classrooms\.$/.test(message) ||
    /^One or more selected classrooms are invalid\.$/.test(message) ||
    /^You can only assign forms to families in your classrooms\.$/.test(message) ||
    /^One or more selected families are invalid\.$/.test(message)
  ) {
    return { status: 403, message, code: "forbidden" };
  }

  if (/^This form has already been signed\.$/.test(message)) {
    return { status: 400, message, code: "invalid_request" };
  }

  if (
    /^Title is required\.$/.test(message) ||
    /^Select at least one classroom\.$/.test(message) ||
    /^Select at least one family\.$/.test(message) ||
    /^Choose who should receive this form before sending\.$/.test(message) ||
    /^Built forms must include a signature field\.$/.test(message) ||
    /^Upload a document before saving\.$/.test(message) ||
    /^Type your full legal name to sign\.$/.test(message) ||
    /^"[^"]+" is required\.$/.test(message)
  ) {
    return { status: 400, message, code: "invalid_request" };
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
