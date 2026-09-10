import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import { reportOperationalError } from "@/lib/operational-errors";

export async function logNotificationFailure(
  supabase: SupabaseClient,
  input: {
    organizationId?: string | null;
    operation: string;
    error: unknown;
    entityType?: string | null;
    entityId?: string | null;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  const errorMessage =
    input.error instanceof Error ? input.error.message : String(input.error);

  await reportOperationalError({
    supabase,
    surface: "system",
    action: ACTIVITY_ACTIONS.NOTIFICATION_FAILED,
    organizationId: input.organizationId,
    operation: input.operation,
    error: errorMessage,
    entityType: input.entityType,
    entityId: input.entityId,
    metadata: input.metadata,
    notify: true,
    severity: "warning",
    actor: { type: "system" },
    cause: input.error,
  });
}

export async function logSettledNotificationFailures(
  supabase: SupabaseClient,
  input: {
    organizationId?: string | null;
    operation: string;
    entityType?: string | null;
    entityId?: string | null;
    metadata?: Record<string, unknown>;
  },
  results: PromiseSettledResult<unknown>[],
): Promise<void> {
  for (const result of results) {
    if (result.status === "rejected") {
      await logNotificationFailure(supabase, {
        organizationId: input.organizationId,
        operation: input.operation,
        error: result.reason,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: input.metadata,
      });
    }
  }
}
