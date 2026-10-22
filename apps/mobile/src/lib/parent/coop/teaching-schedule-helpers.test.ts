import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  formatTeachingAssignedParents,
  formatTeachingScheduleDateRange,
} from './teaching-schedule-helpers';

describe('teaching-schedule-helpers', () => {
  it('formatTeachingAssignedParents shows Open when unassigned', () => {
    assert.equal(formatTeachingAssignedParents([]), 'Open');
  });

  it('formatTeachingAssignedParents joins family labels', () => {
    assert.equal(
      formatTeachingAssignedParents(['fam-1', 'fam-2'], {
        'fam-1': 'Bramwell',
        'fam-2': 'Collins',
      }),
      'Bramwell, Collins',
    );
  });

  it('formatTeachingScheduleDateRange formats same-month ranges', () => {
    assert.equal(formatTeachingScheduleDateRange('2026-09-14', '2026-09-18'), 'Sep 14 – 18, 2026');
  });
});
