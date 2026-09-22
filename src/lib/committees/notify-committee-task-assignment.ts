import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActivitySurface } from "@/lib/activity-log";
import {
  loadCommitteeTaskAssigneeMember,
  sendCommitteeTaskAssignedNotifications,
} from "@/lib/committees/committee-notifications";

export type NotifyCommitteeTaskAssignmentInput = {
  organizationId: string;
  taskId: string;
  previousAssigneeMemberId?: string | null;
  actorUserId: string;
  actorEmail?: string | null;
  actorName: string;
  actorMemberId?: string | null;
  actorType: "parent" | "teacher" | "school_admin";
  surface: ActivitySurface;
};

export type NotifyCommitteeTaskAssignmentResult = {
  notified: boolean;
  reason?:
    | "no_assignee"
    | "unchanged_assignee"
    | "self_assigned"
    | "missing_assignee_email"
    | "task_not_found";
};

export async function notifyCommitteeTaskAssignment(
  supabase: SupabaseClient,
  input: NotifyCommitteeTaskAssignmentInput,
): Promise<NotifyCommitteeTaskAssignmentResult> {
  const { data: task, error: taskError } = await supabase
    .from("committee_tasks")
    .select("id, title, due_date, assignee_member_id, committee_id")
    .eq("id", input.taskId)
    .maybeSingle();

  if (taskError) throw new Error(taskError.message);
  if (!task?.committee_id) return { notified: false, reason: "task_not_found" };

  const assigneeMemberId = task.assignee_member_id
    ? String(task.assignee_member_id)
    : null;

  if (!assigneeMemberId) {
    return { notified: false, reason: "no_assignee" };
  }

  const previousAssigneeMemberId = input.previousAssigneeMemberId
    ? String(input.previousAssigneeMemberId)
    : null;

  if (previousAssigneeMemberId && previousAssigneeMemberId === assigneeMemberId) {
    return { notified: false, reason: "unchanged_assignee" };
  }

  if (
    input.actorMemberId &&
    String(input.actorMemberId) === assigneeMemberId
  ) {
    return { notified: false, reason: "self_assigned" };
  }

  const { data: committeeRow, error: committeeError } = await supabase
    .from("committees")
    .select("id, name, organization_id, organizations(name, slug)")
    .eq("id", task.committee_id)
    .maybeSingle();

  if (committeeError) throw new Error(committeeError.message);

  const organizationRaw = committeeRow?.organizations as
    | { name: string; slug: string }
    | { name: string; slug: string }[]
    | null
    | undefined;
  const organization = Array.isArray(organizationRaw)
    ? organizationRaw[0] ?? null
    : organizationRaw ?? null;

  if (
    !committeeRow ||
    String(committeeRow.organization_id) !== input.organizationId ||
    !organization?.slug ||
    !organization.name
  ) {
    return { notified: false, reason: "task_not_found" };
  }

  const assigneeMember = await loadCommitteeTaskAssigneeMember(
    supabase,
    assigneeMemberId,
  );

  if (!assigneeMember) {
    return { notified: false, reason: "missing_assignee_email" };
  }

  await sendCommitteeTaskAssignedNotifications(supabase, {
    organizationId: input.organizationId,
    taskId: String(task.id),
    committeeId: String(committeeRow.id),
    committeeName: committeeRow.name,
    taskTitle: String(task.title),
    dueDate: task.due_date ? String(task.due_date) : null,
    assigneeMemberId,
    assigneeMember,
    assigneeEmail: assigneeMember.email,
    assignerName: input.actorName,
    assignerMemberId: input.actorMemberId ?? null,
    actorUserId: input.actorUserId,
    actorEmail: input.actorEmail,
    actorType: input.actorType,
    surface: input.surface,
    schoolName: organization.name,
    schoolSlug: organization.slug,
  });

  return { notified: true };
}
