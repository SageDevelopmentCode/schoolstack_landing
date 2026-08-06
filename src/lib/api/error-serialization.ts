function serializeUnknownCause(cause: unknown): string | undefined {
  if (cause === undefined) return undefined;
  if (typeof cause === "string") return cause;
  if (cause instanceof Error) {
    return cause.stack ?? cause.message;
  }
  if (typeof cause === "object" && cause !== null) {
    try {
      return JSON.stringify(cause, null, 2);
    } catch {
      return String(cause);
    }
  }
  return String(cause);
}

export function messageFromCause(cause: unknown): string | undefined {
  if (cause instanceof Error) {
    return cause.message;
  }
  if (
    cause &&
    typeof cause === "object" &&
    "message" in cause &&
    typeof (cause as { message?: unknown }).message === "string"
  ) {
    const message = (cause as { message: string }).message;
    const details =
      "details" in cause && typeof (cause as { details?: unknown }).details === "string"
        ? (cause as { details: string }).details
        : null;
    return details ? `${message} — ${details}` : message;
  }
  if (typeof cause === "string") {
    return cause;
  }
  return undefined;
}

export function stackFromCause(cause: unknown): string | undefined {
  return serializeUnknownCause(cause);
}
