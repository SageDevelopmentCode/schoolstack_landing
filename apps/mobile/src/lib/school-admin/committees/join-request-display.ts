import type { CommitteeJoinRequest } from '@/lib/parent/parent-committees-types';

export function getCommitteeJoinRequestDisplayName(
  request: Pick<CommitteeJoinRequest, 'guardianName' | 'staffName' | 'requesterType'>,
): string {
  if (request.requesterType === 'staff') {
    return request.staffName ?? 'Staff member';
  }
  return request.guardianName ?? 'Parent';
}
