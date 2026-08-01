import type { SupabaseClient } from "@supabase/supabase-js";
import { logSettledNotificationFailures } from "@/lib/admissions/notification-logging";
import { ACTIVITY_ACTIONS, logActivityEvent } from "@/lib/activity-log";
import { notifyCommitteeJoinRequested } from "@/lib/discord";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";

export async function sendCommitteeJoinRequestedNotifications(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    requestId: string;
    committeeId: string;
    committeeName: string;
    schoolName: string;
    schoolSlug: string;
    guardianName: string;
    guardianEmail: string;
    grade: string | null;
    note: string | null;
    actorUserId: string;
  },
): Promise<void> {
  await logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType: "parent",
    actorUserId: input.actorUserId,
    actorEmail: input.guardianEmail,
    actorName: input.guardianName,
    surface: "parent_portal",
    action: ACTIVITY_ACTIONS.COMMITTEE_JOIN_REQUESTED,
    entityType: "committee_join_request",
    entityId: input.requestId,
    summary: `${input.guardianName} requested to join ${input.committeeName}`,
    metadata: {
      committeeId: input.committeeId,
      committeeName: input.committeeName,
      guardianName: input.guardianName,
      guardianEmail: input.guardianEmail,
      grade: input.grade,
      note: input.note,
    },
  });

  const results = await Promise.allSettled([
    notifyCommitteeJoinRequested({
      schoolName: input.schoolName,
      schoolSlug: input.schoolSlug,
      committeeName: input.committeeName,
      guardianName: input.guardianName,
      guardianEmail: input.guardianEmail,
      grade: input.grade,
      note: input.note,
      requestId: input.requestId,
    }),
  ]);

  await logSettledNotificationFailures(
    supabase,
    {
      organizationId: input.organizationId,
      operation: "committee.join_request.notify",
      entityType: "committee_join_request",
      entityId: input.requestId,
      metadata: { committeeId: input.committeeId },
    },
    results,
  );
}

export async function sendCommitteeJoinApprovedNotifications(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    requestId: string;
    committeeId: string;
    committeeName: string;
    guardianName: string;
    reviewerUserId: string;
    reviewerName: string;
    schoolSlug: string;
    memberId: string;
  },
): Promise<void> {
  await logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType: "school_admin",
    actorUserId: input.reviewerUserId,
    actorName: input.reviewerName,
    surface: "school_admin",
    action: ACTIVITY_ACTIONS.COMMITTEE_JOIN_APPROVED,
    entityType: "committee_join_request",
    entityId: input.requestId,
    summary: `${input.reviewerName} approved ${input.guardianName} for ${input.committeeName}`,
    metadata: {
      committeeId: input.committeeId,
      committeeName: input.committeeName,
      guardianName: input.guardianName,
      memberId: input.memberId,
      adminHref: `${schoolAdminPath(input.schoolSlug, "committees")}?committee=${input.committeeId}&section=members`,
    },
  });
}

export async function sendCommitteeJoinDeclinedNotifications(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    requestId: string;
    committeeId: string;
    committeeName: string;
    guardianName: string;
    reviewerUserId: string;
    reviewerName: string;
    schoolSlug: string;
  },
): Promise<void> {
  await logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType: "school_admin",
    actorUserId: input.reviewerUserId,
    actorName: input.reviewerName,
    surface: "school_admin",
    action: ACTIVITY_ACTIONS.COMMITTEE_JOIN_DECLINED,
    entityType: "committee_join_request",
    entityId: input.requestId,
    summary: `${input.reviewerName} declined ${input.guardianName}'s request for ${input.committeeName}`,
    metadata: {
      committeeId: input.committeeId,
      committeeName: input.committeeName,
      guardianName: input.guardianName,
    },
  });
}

export async function sendCommitteeJoinWithdrawnNotifications(
  _supabase: SupabaseClient,
  _input: {
    organizationId: string;
    requestId: string;
    committeeId: string;
    committeeName: string;
    guardianName: string;
    actorUserId: string;
  },
): Promise<void> {
  // Activity log is written in withdrawCommitteeJoinRequest; no Discord for withdraw in v1.
}
