import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildParentMessagesInboxQuery } from './parent-messages-inbox-query';

describe('buildParentMessagesInboxQuery', () => {
  it('includes programId when provided', () => {
    const query = buildParentMessagesInboxQuery('org-1', 'Rooted Meadows', 'prog-1');
    const params = new URLSearchParams(query);
    assert.equal(params.get('organizationId'), 'org-1');
    assert.equal(params.get('schoolName'), 'Rooted Meadows');
    assert.equal(params.get('programId'), 'prog-1');
  });

  it('omits programId when not provided', () => {
    const params = new URLSearchParams(buildParentMessagesInboxQuery('org-1', 'Rooted Meadows'));
    assert.equal(params.get('programId'), null);
  });
});
