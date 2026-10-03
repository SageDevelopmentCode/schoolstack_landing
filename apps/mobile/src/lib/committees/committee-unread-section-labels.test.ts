import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildUnreadMaps } from '@/lib/committees/committee-unread-section-labels';
import type { CommitteeUnreadSummary } from '@/lib/committees/committee-unread-types';

describe('buildUnreadMaps', () => {
  it('orders section labels Messages → Tasks → Resources → Calendar', () => {
    const summary: CommitteeUnreadSummary = {
      totalUnread: 4,
      byCommittee: [
        {
          committeeId: 'c1',
          memberId: 'm1',
          unread: 4,
          sections: {
            messages: 1,
            tasks: 1,
            resources: 1,
            calendar: 1,
          },
        },
      ],
    };

    const { unreadByCommitteeId, unreadSectionLabelsByCommitteeId } = buildUnreadMaps(summary);

    assert.equal(unreadByCommitteeId.c1, 4);
    assert.deepEqual(unreadSectionLabelsByCommitteeId.c1, [
      'Messages',
      'Tasks',
      'Resources',
      'Calendar',
    ]);
  });

  it('omits committees with no unread sections from section labels map', () => {
    const summary: CommitteeUnreadSummary = {
      totalUnread: 0,
      byCommittee: [
        {
          committeeId: 'c2',
          memberId: 'm2',
          unread: 0,
          sections: {
            messages: 0,
            tasks: 0,
            resources: 0,
            calendar: 0,
          },
        },
      ],
    };

    const { unreadSectionLabelsByCommitteeId } = buildUnreadMaps(summary);
    assert.equal(unreadSectionLabelsByCommitteeId.c2, undefined);
  });
});
