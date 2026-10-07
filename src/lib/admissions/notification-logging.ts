import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import { reportOperationalError } from "@/lib/operational-errors";

export type OutboundEmailSendResult = {
  ok: boolean;
  error?: string;
  skipped?: string;
};

async function resolveOrganizationContextForNotification(
  supabase: SupabaseClient,
  organizationId?: string | null,
): Promise<{ organizationName?: string; organizationSlug?: string }> {
  if (!organizationId) {
    return {};
  }

  const { data, error } = await supabase
    .from("organizations")
    .select("name, slug")
    .eq("id", organizationId)
    .maybeSingle();

  if (error) {
    console.error(
      "logNotificationFailure: could not load organization",
      organizationId,
      error,
    );
    return {};
  }

  if (!data?.name || !data?.slug) {
    return {};
  }

  return {
    organizationName: String(data.name),
    organizationSlug: String(data.slug),
  };
}

export function summarizeOutboundEmailSettledFailures(
  results: PromiseSettledResult<OutboundEmailSendResult>[],
): { failureCount: number; detail: string | null } {
  const messages: string[] = [];

  for (const result of results) {
    if (result.status === "rejected") {
      messages.push(
        result.reason instanceof Error
          ? result.reason.message
          : String(result.reason),
      );
      continue;
    }
    if (!result.value.ok) {
      messages.push(result.value.error ?? "Send failed");
    }
  }

  return {
    failureCount: messages.length,
    detail: messages.length > 0 ? messages.join("; ") : null,
  };
}

export async function logNotificationFailure(
  supabase: SupabaseClient,
  input: {
    organizationId?: string | null;
    operation: string;
    error: unknown;
    entityType?: string | null;
    entityId?: string | null;
    metadata?: Record<string, unknown>;
    details?: string | null;
  },
): Promise<void> {
  const errorMessage =
    input.error instanceof Error ? input.error.message : String(input.error);

  const orgContext = await resolveOrganizationContextForNotification(
    supabase,
    input.organizationId,
  );

  await reportOperationalError({
    supabase,
    surface: "system",
    action: ACTIVITY_ACTIONS.NOTIFICATION_FAILED,
    organizationId: input.organizationId,
    organizationName: orgContext.organizationName,
    organizationSlug: orgContext.organizationSlug,
    operation: input.operation,
    error: errorMessage,
    details: input.details ?? undefined,
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

export async function logOutboundEmailSettledFailures(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    operation: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, unknown>;
  },
  results: PromiseSettledResult<OutboundEmailSendResult>[],
): Promise<void> {
  const { failureCount, detail } = summarizeOutboundEmailSettledFailures(results);
  if (failureCount === 0) return;

  await logNotificationFailure(supabase, {
    organizationId: input.organizationId,
    operation: input.operation,
    error: `${failureCount} email(s) failed`,
    details: detail,
    entityType: input.entityType,
    entityId: input.entityId,
    metadata: {
      ...input.metadata,
      ...(detail ? { zohoError: detail } : {}),
    },
  });
}
