import {
  describeParentMessagesFeedback,
  MAX_ATTACHMENT_MB_LABEL,
  PARENT_MESSAGES_STEPS,
} from '@/lib/messages/parent-messages-feedback';

describe('describeParentMessagesFeedback', () => {
  it('names the person when a conversation is ready', () => {
    const toast = describeParentMessagesFeedback({ type: 'conversation_started', name: 'Ms. Rivera' });
    expect(toast.kind).toBe('success');
    expect(toast.title).toBe('Conversation with Ms. Rivera is ready');
    expect(toast.description).toMatch(/tap send/);
  });

  it('tells the parent a failed message is back in the box', () => {
    const restored = describeParentMessagesFeedback({
      type: 'send_failed',
      message: 'Network error.',
      restored: true,
    });
    expect(restored.kind).toBe('error');
    expect(restored.title).toBe('Message not sent');
    expect(restored.description).toContain('Network error.');
    expect(restored.description).toContain('back in the box');

    const plain = describeParentMessagesFeedback({
      type: 'send_failed',
      message: 'Network error.',
      restored: false,
    });
    expect(plain.description).toBe('Network error.');
  });

  it('uses one id per refresh so a retry replaces the old toast', () => {
    expect(describeParentMessagesFeedback({ type: 'refreshed' }).id).toBe(
      describeParentMessagesFeedback({ type: 'refresh_failed' }).id,
    );
  });

  it('scopes load failures', () => {
    expect(
      describeParentMessagesFeedback({ type: 'load_failed', scope: 'start_conversation', message: 'x' })
        .title,
    ).toBe('Couldn’t start that conversation');
    expect(
      describeParentMessagesFeedback({ type: 'load_failed', scope: 'thread', message: 'x' }).id,
    ).toBe('messages-load-failed-thread');
  });

  it('builds the attachment limit from the real constant', () => {
    expect(MAX_ATTACHMENT_MB_LABEL).toBe('10\u00A0MB');
    expect(PARENT_MESSAGES_STEPS[1].detail).toContain(MAX_ATTACHMENT_MB_LABEL);
    expect(PARENT_MESSAGES_STEPS).toHaveLength(3);
  });
});
