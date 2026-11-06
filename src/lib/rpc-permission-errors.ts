import { parseOperationalError } from "@/lib/operational-errors-client";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

/**
 * Discord/activity-log alert when a locked page-summary function rejects the caller
 * (Postgres 42501: `permission denied for function` or the guard's `forbidden`).
 *
 * Added with the Phase 1a database lockdown (docs/parent-portal-audit.md): several callers
 * swallow RPC errors and fall back silently, so without this a permission regression
 * would degrade the page with no alert.
 *
 * Isomorphic on purpose (some callers run in the browser). The server implementation is
 * loaded lazily so it never reaches client bundles.
 */

export const RPC_PERMISSION_DENIED_CODE = "42501";

/** Same function + organization is reported at most once per window per server instance. */
export const RPC_PERMISSION_DENIED_THROTTLE_MS = 10 * 60 * 1000;

const lastReportedAt = new Map<string, number>();

export type RpcPermissionSurface = "school_admin" | "parent_portal";

export type RpcPermissionDeniedInput = {
  functionName: string;
  organizationId: string | null | undefined;
  error: unknown;
  surface: RpcPermissionSurface;
  actorUserId?: string | null;
};

export function isRpcPermissionDenied(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  return (error as { code?: unknown }).code === RPC_PERMISSION_DENIED_CODE;
}

/** Returns true (and records the report) when this key has not been reported inside the window. */
export function claimRpcPermissionDeniedReport(
  key: string,
  now: number = Date.now(),
): boolean {
  const previous = lastReportedAt.get(key);
  if (previous !== undefined && now - previous < RPC_PERMISSION_DENIED_THROTTLE_MS) {
    return false;
  }
  lastReportedAt.set(key, now);
  return true;
}

export function resetRpcPermissionDeniedThrottleForTests(): void {
  lastReportedAt.clear();
}

/**
 * Fire-and-forget safe: never throws and never changes the caller's fallback behavior.
 * Callers should still return `null` / throw exactly as before.
 */
export async function reportRpcPermissionDenied(
  input: RpcPermissionDeniedInput,
): Promise<void> {
  try {
    if (!isRpcPermissionDenied(input.error)) return;

    const key = `${input.functionName}:${input.organizationId ?? "none"}`;
    if (!claimRpcPermissionDeniedReport(key)) return;

    if (typeof window !== "undefined") {
      if (!input.organizationId) return;
      const parsed = parseOperationalError(input.error);
      await reportPortalOperationalError(
        input.surface,
        {
          organizationId: input.organizationId,
          operation: `rpc_permission_denied:${input.functionName}`,
          error: parsed.message,
          code: parsed.code,
          details: parsed.details,
          entityType: "rpc",
          entityId: input.functionName,
          notify: true,
        },
        input.error,
      );
      return;
    }

    const { reportRpcPermissionDeniedServer } = await import(
      "@/lib/rpc-permission-errors-server"
    );
    await reportRpcPermissionDeniedServer(input);
  } catch (reportError) {
    console.error("[rpc-permission-errors] report failed:", reportError);
  }
}
