import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { logSettledNotificationFailures } from "@/lib/admissions/notification-logging";
import { ACTIVITY_ACTIONS, logActivityEvent } from "@/lib/activity-log";
import type { ActivitySurface } from "@/lib/activity-log";
import { notifyCommitteeJoinRequested } from "@/lib/discord";
import {
  sendCommitteeJoinApprovedNotification,
  sendCommitteeJoinRequestAdminNotification,
  sendCommitteeTaskAssignedNotification,
} from "@/lib/emails";
import { resolveCommitteeNotificationEmails } from "@/lib/notifications/org-notification-settings";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import { schoolParentPath, schoolParentRootPath } from "@/lib/organization-settings/parent-routes";
import { schoolTeacherPath } from "@/lib/organization-settings/teacher-routes";
import { SITE_URL } from "@/lib/site";

export async function sendCommitteeJoinRequestedNotifications(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    requestId: string;
    committeeId: string;
    committeeName: string;
    schoolName: string;
    schoolSlug: string;
    requesterName: string;
    requesterEmail: string;
    requesterType: "parent" | "staff";
    preferredDutyRoleTitle?: string | null;
    grade: string | null;
    note: string | null;
    actorUserId: string;
  },
): Promise<void> {
  const actorType = input.requesterType === "staff" ? "teacher" : "parent";
  const surface = input.requesterType === "staff" ? "teacher_portal" : "parent_portal";

  await logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType,
    actorUserId: input.actorUserId,
    actorEmail: input.requesterEmail,
    actorName: input.requesterName,
    surface,
    action: ACTIVITY_ACTIONS.COMMITTEE_JOIN_REQUESTED,
    entityType: "committee_join_request",
    entityId: input.requestId,
    summary: `${input.requesterName} requested to join ${input.committeeName}`,
    metadata: {
      committeeId: input.committeeId,
      committeeName: input.committeeName,
      requesterName: input.requesterName,
      requesterEmail: input.requesterEmail,
      requesterType: input.requesterType,
      grade: input.grade,
      note: input.note,
    },
  });

  const adminEmails = await resolveCommitteeNotificationEmails(
    supabase,
    input.organizationId,
  );
  const committeesAdminUrl = `${SITE_URL}${schoolAdminPath(input.schoolSlug, "committees")}`;
  const submittedAtLabel = new Date().toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const results = await Promise.allSettled([
    notifyCommitteeJoinRequested({
      schoolName: input.schoolName,
      schoolSlug: input.schoolSlug,
      committeeName: input.committeeName,
      guardianName: input.requesterName,
      guardianEmail: input.requesterEmail,
      grade: input.grade,
      note: input.note,
      requestId: input.requestId,
    }),
    ...adminEmails.map((email) =>
      sendCommitteeJoinRequestAdminNotification({
        email,
        schoolName: input.schoolName,
        committeeName: input.committeeName,
        guardianName: input.requesterName,
        guardianEmail: input.requesterEmail,
        preferredDutyRoleTitle: input.preferredDutyRoleTitle,
        grade: input.grade,
        note: input.note,
        submittedAtLabel,
        committeesAdminUrl,
      }),
    ),
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
    memberName: string;
    memberEmail: string | null;
    requesterType: "parent" | "staff";
    requesterUserId: string;
    reviewerUserId: string;
    reviewerName: string;
    schoolSlug: string;
    memberId: string;
  },
): Promise<void> {
  const { data: org } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", input.organizationId)
    .maybeSingle();
  const schoolName =
    typeof org?.name === "string" && org.name.trim()
      ? org.name.trim()
      : "Your school";

  await logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType: "school_admin",
    actorUserId: input.reviewerUserId,
    actorName: input.reviewerName,
    surface: "school_admin",
    action: ACTIVITY_ACTIONS.COMMITTEE_JOIN_APPROVED,
    entityType: "committee_join_request",
    entityId: input.requestId,
    summary: `${input.reviewerName} approved ${input.memberName} for ${input.committeeName}`,
    metadata: {
      committeeId: input.committeeId,
      committeeName: input.committeeName,
      guardianName: input.memberName,
      memberId: input.memberId,
      adminHref: `${schoolAdminPath(input.schoolSlug, "committees")}?committee=${input.committeeId}&section=members`,
    },
  });

  const committeeParams = new URLSearchParams({
    committee: input.committeeId,
    tab: "mine",
  });
  const portalPath =
    input.requesterType === "staff"
      ? schoolTeacherPath(input.schoolSlug, "committees")
      : schoolParentPath(input.schoolSlug, "committees");
  const committeesUrl = `${SITE_URL}${portalPath}?${committeeParams.toString()}`;

  const trimmedEmail = input.memberEmail?.trim() ?? "";
  if (!trimmedEmail) return;

  const results = await Promise.allSettled([
    sendCommitteeJoinApprovedNotification({
      email: trimmedEmail,
      schoolName,
      committeeName: input.committeeName,
      memberName: input.memberName,
      committeesUrl,
    }),
  ]);

  await logSettledNotificationFailures(
    supabase,
    {
      organizationId: input.organizationId,
      operation: "committee.join_approved.notify",
      entityType: "committee_join_request",
      entityId: input.requestId,
      metadata: {
        committeeId: input.committeeId,
        requesterUserId: input.requesterUserId,
        requesterType: input.requesterType,
      },
    },
    results,
  );
}

export async function sendCommitteeJoinDeclinedNotifications(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    requestId: string;
    committeeId: string;
    committeeName: string;
    memberName: string;
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
    summary: `${input.reviewerName} declined ${input.memberName}'s request for ${input.committeeName}`,
    metadata: {
      committeeId: input.committeeId,
      committeeName: input.committeeName,
      guardianName: input.memberName,
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

type AssigneeMemberRow = {
  id: string;
  display_name: string;
  email: string | null;
  user_id: string | null;
  guardian_id: string | null;
};

async function resolveCommitteeMemberEmail(
  supabase: SupabaseClient,
  member: AssigneeMemberRow,
): Promise<string | null> {
  if (member.email?.trim()) return member.email.trim();

  if (!member.guardian_id) return null;

  const { data, error } = await supabase
    .from("guardians")
    .select("email")
    .eq("id", member.guardian_id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.email?.trim() ?? null;
}

function formatTaskDueDateLabel(dueDate: string | null | undefined): string | null {
  if (!dueDate?.trim()) return null;
  return new Date(`${dueDate.trim()}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export async function sendCommitteeTaskAssignedNotifications(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    taskId: string;
    committeeId: string;
    committeeName: string;
    taskTitle: string;
    dueDate?: string | null;
    assigneeMemberId: string;
    assigneeMember: AssigneeMemberRow;
    assigneeEmail: string;
    assignerName: string;
    assignerMemberId?: string | null;
    actorUserId: string;
    actorEmail?: string | null;
    actorType: "parent" | "teacher" | "school_admin";
    surface: ActivitySurface;
    schoolName: string;
    schoolSlug: string;
  },
): Promise<void> {
  const dueDateLabel = formatTaskDueDateLabel(input.dueDate);
  const parentTasksUrl = `${SITE_URL}${schoolParentRootPath(input.schoolSlug)}/committees?committee=${encodeURIComponent(input.committeeId)}&section=tasks&tab=mine`;
  const adminTasksUrl = `${SITE_URL}${schoolAdminPath(input.schoolSlug, "committees")}?committee=${encodeURIComponent(input.committeeId)}&section=tasks`;
  const tasksUrl =
    input.assigneeMember.user_id != null ? parentTasksUrl : adminTasksUrl;

  await logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType: input.actorType,
    actorUserId: input.actorUserId,
    actorEmail: input.actorEmail ?? undefined,
    actorName: input.assignerName,
    surface: input.surface,
    action: ACTIVITY_ACTIONS.COMMITTEE_TASK_ASSIGNED,
    entityType: "committee_task",
    entityId: input.taskId,
    summary: `${input.assignerName} assigned "${input.taskTitle}" to ${input.assigneeMember.display_name}`,
    metadata: {
      committeeId: input.committeeId,
      committeeName: input.committeeName,
      taskId: input.taskId,
      taskTitle: input.taskTitle,
      dueDate: input.dueDate ?? null,
      assigneeMemberId: input.assigneeMemberId,
      assigneeUserId: input.assigneeMember.user_id,
      assigneeEmail: input.assigneeEmail,
      assignerName: input.assignerName,
      assignerMemberId: input.assignerMemberId ?? null,
    },
  });

  const emailResult = await Promise.allSettled([
    sendCommitteeTaskAssignedNotification({
      email: input.assigneeEmail,
      schoolName: input.schoolName,
      committeeName: input.committeeName,
      taskTitle: input.taskTitle,
      dueDateLabel,
      assignerName: input.assignerName,
      tasksUrl,
    }),
  ]);

  await logSettledNotificationFailures(
    supabase,
    {
      organizationId: input.organizationId,
      operation: "committee.task.assigned.notify",
      entityType: "committee_task",
      entityId: input.taskId,
      metadata: {
        committeeId: input.committeeId,
        assigneeMemberId: input.assigneeMemberId,
      },
    },
    emailResult,
  );
}

export async function loadCommitteeTaskAssigneeMember(
  supabase: SupabaseClient,
  assigneeMemberId: string,
): Promise<(AssigneeMemberRow & { email: string }) | null> {
  const { data, error } = await supabase
    .from("committee_members")
    .select("id, display_name, email, user_id, guardian_id")
    .eq("id", assigneeMemberId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const email = await resolveCommitteeMemberEmail(supabase, data as AssigneeMemberRow);
  if (!email) return null;

  return {
    ...(data as AssigneeMemberRow),
    email,
  };
}
