import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS, logActivityEvent } from "@/lib/activity-log";

type LogOrganizationEventPostedInput = {
  organizationId: string;
  eventId: string;
  title: string;
  programId?: string | null;
  actorUserId?: string | null;
  actorName?: string | null;
  activityMetadata?: Record<string, unknown>;
};

export async function logOrganizationEventPosted(
  supabase: SupabaseClient,
  input: LogOrganizationEventPostedInput,
): Promise<void> {
  const title = input.title.trim();

  await logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType: input.actorUserId ? "school_admin" : "system",
    actorUserId: input.actorUserId ?? null,
    actorName: input.actorName ?? null,
    surface: "school_admin",
    action: ACTIVITY_ACTIONS.CALENDAR_EVENT_POSTED,
    entityType: "organization_event",
    entityId: input.eventId,
    summary: `Posted calendar event "${title}"`,
    metadata: {
      eventId: input.eventId,
      title,
      programId: input.programId ?? null,
      ...(input.activityMetadata ?? {}),
    },
  });
}
