/**
 * Input hardening for the client-facing operational-errors API endpoints (parent portal,
 * teacher portal, school admin, apply flow and mobile).
 *
 * Any signed-in user can POST to these routes, so the server (not the client) decides:
 *  - whether Discord is notified (client `notify` is ignored; notifications are throttled per
 *    user + organization so one browser in an error loop cannot flood the channel; the event is
 *    still recorded in `activity_events` either way),
 *  - how much text and metadata is stored.
 */

export const CLIENT_ERROR_LIMITS = {
  operation: 200,
  error: 1000,
  code: 100,
  details: 2000,
  entityType: 100,
  entityId: 200,
  metadataBytes: 4000,
} as const;

/** Max Discord notifications per user + organization per window, per server instance. */
export const CLIENT_ERROR_NOTIFY_MAX_PER_WINDOW = 5;
export const CLIENT_ERROR_NOTIFY_WINDOW_MS = 10 * 60 * 1000;

const notifyHistory = new Map<string, number[]>();

/** Trim and cap a client-provided string. Non-strings become `null`. */
export function clampClientErrorString(
  value: unknown,
  maxLength: number,
): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed;
}

/**
 * Accept only plain JSON objects, and replace oversized metadata with a small marker so the
 * event is still recorded without storing attacker-sized payloads.
 */
export function sanitizeClientErrorMetadata(
  value: unknown,
): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  let serialized: string;
  try {
    serialized = JSON.stringify(value);
  } catch {
    return { metadataDropped: "unserializable" };
  }

  if (serialized.length > CLIENT_ERROR_LIMITS.metadataBytes) {
    return {
      metadataTruncated: true,
      metadataOriginalLength: serialized.length,
    };
  }

  return value as Record<string, unknown>;
}

export type SanitizedClientErrorFields = {
  operation: string;
  error: string;
  code: string | null;
  details: string | null;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown> | undefined;
};

/** Returns `null` when `operation` or `error` is missing. */
export function sanitizeClientErrorFields(body: {
  operation?: unknown;
  error?: unknown;
  code?: unknown;
  details?: unknown;
  entityType?: unknown;
  entityId?: unknown;
  metadata?: unknown;
}): SanitizedClientErrorFields | null {
  const operation = clampClientErrorString(body.operation, CLIENT_ERROR_LIMITS.operation);
  const error = clampClientErrorString(body.error, CLIENT_ERROR_LIMITS.error);
  if (!operation || !error) return null;

  return {
    operation,
    error,
    code: clampClientErrorString(body.code, CLIENT_ERROR_LIMITS.code),
    details: clampClientErrorString(body.details, CLIENT_ERROR_LIMITS.details),
    entityType: clampClientErrorString(body.entityType, CLIENT_ERROR_LIMITS.entityType),
    entityId: clampClientErrorString(body.entityId, CLIENT_ERROR_LIMITS.entityId),
    metadata: sanitizeClientErrorMetadata(body.metadata),
  };
}

/**
 * True when this user + organization is still under the Discord notification budget.
 * Records the attempt when it returns true.
 */
export function shouldNotifyClientError(
  userId: string,
  organizationId: string,
  now: number = Date.now(),
): boolean {
  const key = `${userId}:${organizationId}`;
  const recent = (notifyHistory.get(key) ?? []).filter(
    (timestamp) => now - timestamp < CLIENT_ERROR_NOTIFY_WINDOW_MS,
  );

  if (recent.length >= CLIENT_ERROR_NOTIFY_MAX_PER_WINDOW) {
    notifyHistory.set(key, recent);
    return false;
  }

  recent.push(now);
  notifyHistory.set(key, recent);

  if (notifyHistory.size > 5000) {
    for (const [entryKey, timestamps] of notifyHistory) {
      if (timestamps.every((timestamp) => now - timestamp >= CLIENT_ERROR_NOTIFY_WINDOW_MS)) {
        notifyHistory.delete(entryKey);
      }
    }
  }

  return true;
}

/** Test helper. */
export function resetClientErrorNotifyThrottleForTests(): void {
  notifyHistory.clear();
}
