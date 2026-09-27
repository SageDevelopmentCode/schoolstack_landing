import { portalMessageSupportsTextMutation } from '@/lib/messages/message-mutation-eligibility';
import type { PortalMessage } from '@/lib/messages/types';

function baseMessage(overrides: Partial<PortalMessage> = {}): PortalMessage {
  return {
    id: 'msg-1',
    threadId: 'thread-1',
    body: 'Hello',
    senderUserId: 'user-1',
    senderKind: 'guardian',
    senderName: 'Parent',
    isOwn: true,
    createdAt: '2026-01-01T12:00:00.000Z',
    timeLabel: '12:00 PM',
    editedAt: null,
    deletedAt: null,
    attachments: [],
    ...overrides,
  };
}

describe('portalMessageSupportsTextMutation', () => {
  it('allows own text-only messages', () => {
    expect(portalMessageSupportsTextMutation(baseMessage())).toBe(true);
  });

  it('rejects messages that are not own', () => {
    expect(portalMessageSupportsTextMutation(baseMessage({ isOwn: false }))).toBe(false);
  });

  it('rejects pending, deleted, empty, or attachment messages', () => {
    expect(portalMessageSupportsTextMutation(baseMessage({ pending: true }))).toBe(false);
    expect(
      portalMessageSupportsTextMutation(baseMessage({ deletedAt: '2026-01-02T00:00:00.000Z' })),
    ).toBe(false);
    expect(portalMessageSupportsTextMutation(baseMessage({ body: '   ' }))).toBe(false);
    expect(
      portalMessageSupportsTextMutation(
        baseMessage({
          attachments: [
            {
              id: 'att-1',
              fileName: 'photo.jpg',
              mimeType: 'image/jpeg',
              sizeBytes: 100,
            },
          ],
        }),
      ),
    ).toBe(false);
  });
});
