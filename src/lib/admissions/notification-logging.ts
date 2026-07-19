import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS, logActivityEvent } from "@/lib/activity-log";

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

  void logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType: "system",
    surface: "system",
    action: ACTIVITY_ACTIONS.NOTIFICATION_FAILED,
    entityType: input.entityType,
    entityId: input.entityId,
    summary: `${input.operation} failed: ${errorMessage}`,
    severity: "warning",
    metadata: {
      operation: input.operation,
      error: errorMessage,
      ...(input.metadata ?? {}),
    },
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
