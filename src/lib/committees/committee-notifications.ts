import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  formatInstantDateTimeInTimezone,
  getOrganizationTimezone,
} from "@/lib/admissions/admissions-availability";
import { logSettledNotificationFailures } from "@/lib/admissions/notification-logging";
import { ACTIVITY_ACTIONS, logActivityEvent } from "@/lib/activity-log";
import type { ActivitySurface } from "@/lib/activity-log";
import { notifyCommitteeJoinRequested } from "@/lib/discord";
import {
  buildEmailNotificationContext,
  sendCommitteeJoinApprovedNotification,
  sendCommitteeJoinRequestAdminNotification,
  sendCommitteeMessagePostedNotification,
  sendCommitteeTaskAssignedNotification,
  sendCommitteeWorkspaceUpdateNotification,
} from "@/lib/emails";
import {
  committeeMemberWorkspaceUrl,
  type CommitteePortalMember,
} from "@/lib/committees/committee-portal-urls";
import type { CommitteeWorkspaceSection } from "@/lib/committees/types";
import { resolveCommitteeNotificationEmails } from "@/lib/notifications/org-notification-settings";
import { committeeTaskAssigneeTasksUrl } from "@/lib/committees/committee-portal-urls";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import { schoolParentPath } from "@/lib/organization-settings/parent-routes";
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
  const organizationTimeZone = await getOrganizationTimezone(
    supabase,
    input.organizationId,
  );
  const submittedAtLabel = formatInstantDateTimeInTimezone(
    new Date(),
    organizationTimeZone,
  );

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
        notificationContext: buildEmailNotificationContext({
          organizationId: input.organizationId,
          organizationSlug: input.schoolSlug,
          surface: "web",
          entityType: "committee_join_request",
          entityId: input.requestId,
        }),
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
      notificationContext: buildEmailNotificationContext({
        organizationId: input.organizationId,
        organizationSlug: input.schoolSlug,
        surface: "web",
        entityType: "committee_join_request",
        entityId: input.requestId,
      }),
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

export type AssigneeMemberRow = {
  id: string;
  display_name: string;
  email: string | null;
  user_id: string | null;
  guardian_id: string | null;
  staff_member_id?: string | null;
};

export async function resolveCommitteeMemberEmail(
  supabase: SupabaseClient,
  member: AssigneeMemberRow,
): Promise<string | null> {
  if (member.email?.trim()) return member.email.trim();

  if (member.guardian_id) {
    const { data, error } = await supabase
      .from("guardians")
      .select("email")
      .eq("id", member.guardian_id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (data?.email?.trim()) return data.email.trim();
  }

  if (member.staff_member_id) {
    const { data, error } = await supabase
      .from("staff_members")
      .select("email")
      .eq("id", member.staff_member_id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (data?.email?.trim()) return data.email.trim();
  }

  return null;
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
  const tasksUrl = committeeTaskAssigneeTasksUrl(
    input.schoolSlug,
    input.committeeId,
    input.assigneeMember,
  );

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
      notificationContext: buildEmailNotificationContext({
        organizationId: input.organizationId,
        organizationSlug: input.schoolSlug,
        surface: "web",
        entityType: "committee_task",
        entityId: input.taskId,
      }),
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
    .select("id, display_name, email, user_id, guardian_id, staff_member_id")
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

async function loadActiveCommitteeMembersForNotify(
  supabase: SupabaseClient,
  organizationId: string,
  committeeId: string,
): Promise<AssigneeMemberRow[]> {
  const { data, error } = await supabase
    .from("committee_members")
    .select("id, display_name, email, user_id, guardian_id, staff_member_id")
    .eq("organization_id", organizationId)
    .eq("committee_id", committeeId)
    .eq("status", "active");

  if (error) throw new Error(error.message);
  return (data ?? []) as AssigneeMemberRow[];
}

async function loadOrganizationBranding(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<{ schoolName: string; schoolSlug: string }> {
  const { data, error } = await supabase
    .from("organizations")
    .select("name, slug")
    .eq("id", organizationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return {
    schoolName: String(data?.name ?? "School"),
    schoolSlug: String(data?.slug ?? ""),
  };
}

export async function sendCommitteeMessagePostedNotifications(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    committeeId: string;
    committeeName: string;
    messageId: string;
    messagePreview: string;
    senderName: string;
    senderMemberId?: string | null;
    actorUserId: string;
    actorEmail?: string | null;
    actorName: string;
    actorType: "parent" | "teacher" | "school_admin";
    surface: ActivitySurface;
  },
): Promise<void> {
  const { schoolName, schoolSlug } = await loadOrganizationBranding(
    supabase,
    input.organizationId,
  );
  const members = await loadActiveCommitteeMembersForNotify(
    supabase,
    input.organizationId,
    input.committeeId,
  );

  const recipients = members.filter((member) => {
    if (input.senderMemberId && member.id === input.senderMemberId) return false;
    return true;
  });

  const emailResults = await Promise.allSettled(
    recipients.map(async (member) => {
      const email = await resolveCommitteeMemberEmail(supabase, member);
      if (!email) return;

      const messagesUrl = committeeMemberWorkspaceUrl(
        schoolSlug,
        input.committeeId,
        "messages",
        member as CommitteePortalMember,
      );

      await sendCommitteeMessagePostedNotification({
        email,
        schoolName,
        committeeName: input.committeeName,
        senderName: input.senderName,
        messagePreview: input.messagePreview,
        messagesUrl,
        notificationContext: buildEmailNotificationContext({
          organizationId: input.organizationId,
          organizationSlug: schoolSlug,
          surface: "web",
          entityType: "committee_message",
          entityId: input.messageId,
        }),
      });
    }),
  );

  await logSettledNotificationFailures(
    supabase,
    {
      organizationId: input.organizationId,
      operation: "committee.message.posted.notify",
      entityType: "committee_message",
      entityId: input.messageId,
      metadata: { committeeId: input.committeeId },
    },
    emailResults,
  );
}

const WORKSPACE_UPDATE_ACTIONS: Record<
  string,
  { section: CommitteeWorkspaceSection; title: string }
> = {
  [ACTIVITY_ACTIONS.COMMITTEE_RESOURCE_CREATED]: {
    section: "resources",
    title: "New resource added",
  },
  [ACTIVITY_ACTIONS.COMMITTEE_EVENT_CREATED]: {
    section: "calendar",
    title: "New calendar event",
  },
  [ACTIVITY_ACTIONS.COMMITTEE_TASK_CREATED]: {
    section: "tasks",
    title: "New task added",
  },
};

export async function sendCommitteeWorkspaceUpdateNotifications(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    committeeId: string;
    committeeName: string;
    action: string;
    entityId: string;
    summary: string;
    senderMemberId?: string | null;
  },
): Promise<void> {
  const config = WORKSPACE_UPDATE_ACTIONS[input.action];
  if (!config) return;

  const { schoolName, schoolSlug } = await loadOrganizationBranding(
    supabase,
    input.organizationId,
  );
  const members = await loadActiveCommitteeMembersForNotify(
    supabase,
    input.organizationId,
    input.committeeId,
  );

  const recipients = members.filter((member) => {
    if (input.senderMemberId && member.id === input.senderMemberId) return false;
    return true;
  });

  const emailResults = await Promise.allSettled(
    recipients.map(async (member) => {
      const email = await resolveCommitteeMemberEmail(supabase, member);
      if (!email) return;

      const workspaceUrl = committeeMemberWorkspaceUrl(
        schoolSlug,
        input.committeeId,
        config.section,
        member as CommitteePortalMember,
      );

      await sendCommitteeWorkspaceUpdateNotification({
        email,
        schoolName,
        committeeName: input.committeeName,
        updateTitle: config.title,
        updateSummary: input.summary,
        workspaceUrl,
        notificationContext: buildEmailNotificationContext({
          organizationId: input.organizationId,
          organizationSlug: schoolSlug,
          surface: "web",
          entityType: "committee_activity",
          entityId: input.entityId,
        }),
      });
    }),
  );

  await logSettledNotificationFailures(
    supabase,
    {
      organizationId: input.organizationId,
      operation: "committee.workspace_update.notify",
      entityType: "committee_activity",
      entityId: input.entityId,
      metadata: { committeeId: input.committeeId, action: input.action },
    },
    emailResults,
  );
}
