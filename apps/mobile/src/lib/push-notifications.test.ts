import {
  parseCommitteePushNotificationData,
  parseMessagePushNotificationData,
} from '@/lib/push-notification-payload';

describe('parseMessagePushNotificationData', () => {
  it('returns parsed message notification data', () => {
    expect(
      parseMessagePushNotificationData({
        kind: 'message',
        portal: 'parent',
        organizationSlug: 'river-oak-academy',
        threadId: 'thread-123',
      }),
    ).toEqual({
      kind: 'message',
      portal: 'parent',
      organizationSlug: 'river-oak-academy',
      threadId: 'thread-123',
    });
  });

  it('supports legacy message payloads without kind', () => {
    expect(
      parseMessagePushNotificationData({
        portal: 'teacher',
        organizationSlug: 'rooted-meadows',
        threadId: 'thread-456',
      }),
    ).toEqual({
      kind: 'message',
      portal: 'teacher',
      organizationSlug: 'rooted-meadows',
      threadId: 'thread-456',
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

describe('parseCommitteePushNotificationData', () => {
  it('returns parsed committee notification data', () => {
    expect(
      parseCommitteePushNotificationData({
        kind: 'committee',
        portal: 'admin',
        organizationSlug: 'rooted-meadows',
        committeeId: 'committee-1',
        section: 'messages',
      }),
    ).toEqual({
      kind: 'committee',
      portal: 'admin',
      organizationSlug: 'rooted-meadows',
      committeeId: 'committee-1',
      section: 'messages',
    });
  });

  it('parses join request intent for admins', () => {
    expect(
      parseCommitteePushNotificationData({
        kind: 'committee',
        portal: 'admin',
        organizationSlug: 'rooted-meadows',
        committeeId: 'committee-1',
        intent: 'join_request',
      }),
    ).toEqual({
      kind: 'committee',
      portal: 'admin',
      organizationSlug: 'rooted-meadows',
      committeeId: 'committee-1',
      intent: 'join_request',
    });
  });
});
