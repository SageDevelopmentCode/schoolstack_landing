import type { SupabaseClient } from "@supabase/supabase-js";
import { mergeActivityClientMetadata } from "@/lib/activity-client";
import { logActivityEvent } from "@/lib/activity-log";

type ParentPortalActivityInput = {
  organizationId: string;
  actorUserId: string;
  actorEmail?: string | null;
  actorName?: string | null;
  action: string;
  summary: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  request?: Request;
};

export async function logParentPortalActivity(
  supabase: SupabaseClient,
  input: ParentPortalActivityInput,
): Promise<void> {
  await logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType: "parent",
    actorUserId: input.actorUserId,
    actorEmail: input.actorEmail ?? null,
    actorName: input.actorName ?? null,
    surface: "parent_portal",
    action: input.action,
    entityType: input.entityType ?? null,
    entityId: input.entityId ?? null,
    summary: input.summary,
    metadata: mergeActivityClientMetadata(input.request, input.metadata),
  });
}
