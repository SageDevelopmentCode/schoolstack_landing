export function stackFromCause(cause: unknown): string | undefined {
  if (cause instanceof Error && cause.stack) {
    return cause.stack;
  }
  if (
    cause &&
    typeof cause === "object" &&
    "message" in cause &&
    typeof (cause as { message?: unknown }).message === "string"
  ) {
    try {
      return JSON.stringify(cause, null, 2);
    } catch {
      return String((cause as { message: string }).message);
    }
  }
  if (cause !== undefined) {
    return String(cause);
  }
  return undefined;
}
