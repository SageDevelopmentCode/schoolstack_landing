import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS, logActivityEvent } from "@/lib/activity-log";

export type RecordApplicationFormSaveActivityInput = {
  organizationId: string;
  formVersionId: string;
  summary: string;
  metadata: Record<string, unknown>;
  actorUserId: string;
  actorEmail?: string | null;
  actorName?: string | null;
};

export async function recordApplicationFormSaveActivityServer(
  supabase: SupabaseClient,
  input: RecordApplicationFormSaveActivityInput,
): Promise<string | null> {
  return logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType: "school_admin",
    actorUserId: input.actorUserId,
    actorEmail: input.actorEmail ?? undefined,
    actorName: input.actorName ?? undefined,
    surface: "school_admin",
    action: ACTIVITY_ACTIONS.FORM_SAVED,
    entityType: "application_form_version",
    entityId: input.formVersionId,
    summary: input.summary,
    metadata: input.metadata,
  });
}
