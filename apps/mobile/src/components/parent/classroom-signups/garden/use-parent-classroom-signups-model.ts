import { useCallback, useMemo, useState } from 'react';

import {
  buildUpcomingHelp,
  SIGNUP_GROUP_LABELS,
} from '@/components/parent/classroom-signups/garden/signups-garden-ui';
import type {
  ParentClassroomSignupListItem,
  ParentClassroomSignupListStatus,
  ParentClassroomSignupsFilter,
} from '@/lib/parent/parent-classroom-signups-types';

export type SignupGroup = {
  status: ParentClassroomSignupListStatus;
  label: string;
  items: ParentClassroomSignupListItem[];
};

const GROUP_ORDER: ParentClassroomSignupListStatus[] = ['needs_response', 'signed_up', 'closed'];

/** Filter state + derived lists for the signups list (same grouping as before). */
export function useParentClassroomSignupsModel(items: ParentClassroomSignupListItem[]) {
  const [filter, setFilterState] = useState<ParentClassroomSignupsFilter>('all');

  const counts = useMemo(
    () => ({
      all: items.length,
      needs_response: items.filter((item) => item.listStatus === 'needs_response').length,
      signed_up: items.filter((item) => item.listStatus === 'signed_up').length,
      closed: items.filter((item) => item.listStatus === 'closed').length,
    }),
    [items],
  );

  const groups = useMemo((): SignupGroup[] => {
    const statuses = filter === 'all' ? GROUP_ORDER : [filter];
    return statuses
      .map((status) => ({
        status,
        label: SIGNUP_GROUP_LABELS[status],
        items: items.filter((item) => item.listStatus === status),
      }))
      .filter((group) => group.items.length > 0);
  }, [filter, items]);

  const needsResponse = useMemo(
    () => items.filter((item) => item.listStatus === 'needs_response'),
    [items],
  );
  const upcoming = useMemo(() => buildUpcomingHelp(items), [items]);

  const setFilter = useCallback((next: ParentClassroomSignupsFilter) => setFilterState(next), []);

  return { filter, setFilter, counts, groups, needsResponse, upcoming };
}

export type ParentClassroomSignupsModel = ReturnType<typeof useParentClassroomSignupsModel>;
