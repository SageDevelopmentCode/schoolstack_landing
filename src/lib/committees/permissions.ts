import type { Committee, CommitteeDutyRole, CommitteeResource } from "./types";

export function hasFullDutyRoleAccess(
  allowedDutyRoleIds: string[] | undefined,
  dutyRoles: CommitteeDutyRole[],
): boolean {
  if (!allowedDutyRoleIds || allowedDutyRoleIds.length === 0) return true;
  const allIds = dutyRoles.map((r) => r.id);
  return allIds.every((id) => allowedDutyRoleIds.includes(id));
}

export function canAccessCommitteeResource(
  resource: CommitteeResource,
  memberId: string | undefined,
  committee: Committee,
  isAdminView: boolean,
): boolean {
  if (isAdminView) return true;
  if (hasFullDutyRoleAccess(resource.allowedDutyRoleIds, committee.dutyRoles)) {
    return true;
  }
  if (!memberId) return true;
  const allowedIds = resource.allowedDutyRoleIds ?? [];
  return committee.dutyRoles.some(
    (duty) =>
      allowedIds.includes(duty.id) && duty.assigneeId === memberId,
  );
}

export function simplifyDutyRoleTitle(title: string): string {
  if (title === "Committee Lead") return "Lead";
  if (title.endsWith(" Coordinator")) {
    return title.replace(/ Coordinator$/, "");
  }
  if (title.endsWith(" Lead")) {
    return title.replace(/ Lead$/, " lead");
  }
  return title;
}

export function formatResourceAccessLabel(
  allowedDutyRoleIds: string[] | undefined,
  dutyRoles: CommitteeDutyRole[],
): string | null {
  if (hasFullDutyRoleAccess(allowedDutyRoleIds, dutyRoles)) return null;
  const ids = allowedDutyRoleIds ?? [];
  const labels = ids
    .map((id) => dutyRoles.find((r) => r.id === id))
    .filter((r): r is CommitteeDutyRole => r != null)
    .map((r) => simplifyDutyRoleTitle(r.title));
  if (labels.length === 0) return null;
  if (labels.length === 1) return `${labels[0]} only`;
  if (labels.length === 2) return `${labels[0]} & ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")} & ${labels[labels.length - 1]}`;
}
