import type { SupabaseClient } from "@supabase/supabase-js";
import { mergeActivityClientMetadata } from "@/lib/activity-client";
import { logActivityEvent, type ActivitySurface } from "@/lib/activity-log";

type SchoolAdminActivityInput = {
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
  surface?: ActivitySurface;
};

export async function logSchoolAdminActivity(
  supabase: SupabaseClient,
  input: SchoolAdminActivityInput,
): Promise<void> {
  await logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType: "school_admin",
    actorUserId: input.actorUserId,
    actorEmail: input.actorEmail ?? null,
    actorName: input.actorName ?? null,
    surface: input.surface ?? "school_admin",
    action: input.action,
    entityType: input.entityType ?? null,
    entityId: input.entityId ?? null,
    summary: input.summary,
    metadata: mergeActivityClientMetadata(input.request, input.metadata),
  });
}
