import type {
  Committee,
  CommitteeDutyRole,
  CommitteeMember,
  CommitteeTask,
  CommitteeTaskStatus,
} from "./types";

export const TASK_STATUS_LABELS: Record<CommitteeTaskStatus, string> = {
  open: "Open",
  claimed: "Claimed",
  in_progress: "In Progress",
  done: "Done",
};

export function memberInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function resolveTaskAssignee(
  task: CommitteeTask,
  members: CommitteeMember[],
) {
  if (task.assigneeId) {
    return members.find((m) => m.id === task.assigneeId);
  }
  if (task.assigneeName) {
    return members.find((m) => m.name === task.assigneeName);
  }
  return undefined;
}

export function getMemberDutyRoles(
  committee: Committee,
  memberId: string,
): CommitteeDutyRole[] {
  return committee.dutyRoles.filter((r) => r.assigneeId === memberId);
}

export function getMemberTasks(
  committee: Committee,
  memberId: string,
): CommitteeTask[] {
  return committee.tasks.filter((t) => t.assigneeId === memberId);
}
