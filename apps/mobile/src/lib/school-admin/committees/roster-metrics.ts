import type { CommitteeListItem } from '@/lib/parent/parent-committees-types';

export type CommitteeRosterFilter = 'all' | 'active' | 'archived';

export type CommitteeRosterMetrics = {
  totalCount: number;
  activeCount: number;
  archivedCount: number;
  totalVolunteers: number;
  pendingJoinRequests: number;
};

export function deriveCommitteeRosterMetrics(
  committees: CommitteeListItem[],
  pendingJoinRequests = 0,
): CommitteeRosterMetrics {
  let activeCount = 0;
  let archivedCount = 0;
  let totalVolunteers = 0;

  for (const committee of committees) {
    totalVolunteers += committee.memberCount;
    if (committee.status === 'active') {
      activeCount += 1;
    } else if (committee.status === 'archived') {
      archivedCount += 1;
    }
  }

  return {
    totalCount: committees.length,
    activeCount,
    archivedCount,
    totalVolunteers,
    pendingJoinRequests,
  };
}

export function filterCommitteesByRosterFilter(
  committees: CommitteeListItem[],
  filter: CommitteeRosterFilter,
): CommitteeListItem[] {
  if (filter === 'all') return committees;
  if (filter === 'active') {
    return committees.filter((committee) => committee.status === 'active');
  }
  return committees.filter((committee) => committee.status === 'archived');
}
