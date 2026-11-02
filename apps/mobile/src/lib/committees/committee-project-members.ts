import type { CommitteeMember } from '@/lib/parent/parent-committees-types';

export type CommitteeProjectMemberOption = {
  memberId: string;
  name: string;
};

export function committeeMembersToProjectOptions(
  members: CommitteeMember[],
): CommitteeProjectMemberOption[] {
  return members
    .filter((member) => member.status === 'active')
    .map((member) => ({
      memberId: member.id,
      name: member.name,
    }));
}
