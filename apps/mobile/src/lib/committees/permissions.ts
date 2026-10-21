import type {
  Committee,
  CommitteeDutyRole,
  CommitteeResource,
} from '@/lib/parent/parent-committees-types';

export function hasFullDutyRoleAccess(
  allowedDutyRoleIds: string[] | undefined,
  dutyRoles: CommitteeDutyRole[],
): boolean {
  if (!allowedDutyRoleIds || allowedDutyRoleIds.length === 0) return true;
  const allIds = dutyRoles.map((role) => role.id);
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
    (duty) => allowedIds.includes(duty.id) && duty.assigneeId === memberId,
  );
}
