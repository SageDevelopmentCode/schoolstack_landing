import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS, logActivityEvent, type ActivitySurface } from "@/lib/activity-log";
import {
  sendCommitteeWorkspaceUpdateNotifications,
} from "@/lib/committees/committee-notifications";

export type RecordCommitteeActivityInput = {
  organizationId: string;
  committeeId: string;
  committeeName: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  metadata?: Record<string, unknown>;
  actorUserId: string;
  actorEmail?: string | null;
  actorName: string;
  actorMemberId?: string | null;
  actorType: "parent" | "teacher" | "school_admin";
  surface: ActivitySurface;
};

export async function recordCommitteeActivityServer(
  supabase: SupabaseClient,
  input: RecordCommitteeActivityInput,
): Promise<void> {
  await logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType: input.actorType,
    actorUserId: input.actorUserId,
    actorEmail: input.actorEmail ?? undefined,
    actorName: input.actorName,
    surface: input.surface,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    summary: input.summary,
    metadata: {
      ...(input.metadata ?? {}),
      committeeId: input.committeeId,
      committeeName: input.committeeName,
      actorMemberId: input.actorMemberId ?? null,
    },
  });

  if (
    input.action === ACTIVITY_ACTIONS.COMMITTEE_RESOURCE_CREATED ||
    input.action === ACTIVITY_ACTIONS.COMMITTEE_EVENT_CREATED ||
    input.action === ACTIVITY_ACTIONS.COMMITTEE_TASK_CREATED
  ) {
    await sendCommitteeWorkspaceUpdateNotifications(supabase, {
      organizationId: input.organizationId,
      committeeId: input.committeeId,
      committeeName: input.committeeName,
      action: input.action,
      entityId: input.entityId,
      summary: input.summary,
      senderMemberId: input.actorMemberId ?? null,
    });
  }
}
