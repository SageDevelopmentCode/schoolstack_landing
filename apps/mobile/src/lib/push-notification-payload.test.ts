import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parsePushNotificationData } from '@/lib/push-notification-payload';

describe('parsePushNotificationData newsletter', () => {
  it('parses parent newsletter edition deep link data', () => {
    const parsed = parsePushNotificationData({
      kind: 'newsletter',
      portal: 'parent',
      organizationSlug: 'rooted-meadows',
      editionId: 'edition-123',
    });

    assert.deepEqual(parsed, {
      kind: 'newsletter',
      portal: 'parent',
      organizationSlug: 'rooted-meadows',
      editionId: 'edition-123',
    });
  });
});
