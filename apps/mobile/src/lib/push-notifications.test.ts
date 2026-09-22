import {
  parseMessagePushNotificationData,
} from '@/lib/push-notifications';

describe('parseMessagePushNotificationData', () => {
  it('returns parsed message notification data', () => {
    expect(
      parseMessagePushNotificationData({
        portal: 'parent',
        organizationSlug: 'river-oak-academy',
        threadId: 'thread-123',
      }),
    ).toEqual({
      portal: 'parent',
      organizationSlug: 'river-oak-academy',
      threadId: 'thread-123',
    });
  });

  it('returns null for invalid payloads', () => {
    expect(parseMessagePushNotificationData(undefined)).toBeNull();
    expect(parseMessagePushNotificationData({ portal: 'parent' })).toBeNull();
    expect(
      parseMessagePushNotificationData({
        portal: 'invalid',
        organizationSlug: 'river-oak-academy',
        threadId: 'thread-123',
      }),
    ).toBeNull();
  });
});
