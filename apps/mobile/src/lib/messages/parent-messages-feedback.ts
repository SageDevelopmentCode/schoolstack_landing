import { MAX_MESSAGE_ATTACHMENTS, MAX_MESSAGE_ATTACHMENT_BYTES } from '@/lib/messages/constants';

/** "10 MB" from the real attachment limit (never hard-coded copy). Non-breaking space so it never wraps. */
export const MAX_ATTACHMENT_MB_LABEL = `${Math.round(
  MAX_MESSAGE_ATTACHMENT_BYTES / (1024 * 1024),
)}\u00A0MB`;

export type ParentMessagesFeedbackEvent =
  | { type: 'conversation_started'; name: string }
  | { type: 'send_failed'; message: string; restored: boolean }
  | { type: 'edited' }
  | { type: 'edit_failed'; message: string }
  | { type: 'deleted' }
  | { type: 'delete_failed'; message: string }
  | {
      type: 'load_failed';
      scope: 'thread' | 'start_conversation' | 'support';
      message: string;
    }
  | { type: 'refreshed' }
  | { type: 'refresh_failed' }
  | { type: 'read_only' };

export type ParentMessagesToast = {
  kind: 'success' | 'error' | 'info';
  id: string;
  title: string;
  description?: string;
  durationMs?: number;
};

/**
 * Inbox / conversation events → parent Garden toasts. Mirrors web
 * `src/lib/messages/parent-messages-feedback.ts` with touch wording. Normal
 * sends stay quiet (the "Sent ✓" line in the conversation is the confirmation);
 * toasts are for things a parent must notice or that happen out of view.
 */
export function describeParentMessagesFeedback(
  event: ParentMessagesFeedbackEvent,
): ParentMessagesToast {
  switch (event.type) {
    case 'conversation_started':
      return {
        kind: 'success',
        id: 'messages-conversation-started',
        title: `Conversation with ${event.name} is ready`,
        description: 'Write your first message below and tap send.',
      };
    case 'send_failed':
      return {
        kind: 'error',
        id: 'messages-send-failed',
        title: 'Message not sent',
        description: event.restored
          ? `${event.message} Your message is back in the box — try again when you’re ready.`
          : event.message,
      };
    case 'edited':
      return { kind: 'success', id: 'messages-edited', title: 'Message updated' };
    case 'edit_failed':
      return {
        kind: 'error',
        id: 'messages-edit-failed',
        title: 'Couldn’t save your edit',
        description: `${event.message} Your text is still in the box.`,
      };
    case 'deleted':
      return {
        kind: 'success',
        id: 'messages-deleted',
        title: 'Message deleted',
        description: 'Everyone in the conversation now sees “Message deleted”.',
      };
    case 'delete_failed':
      return {
        kind: 'error',
        id: 'messages-delete-failed',
        title: 'Couldn’t delete that message',
        description: event.message,
      };
    case 'load_failed': {
      const title =
        event.scope === 'start_conversation'
          ? 'Couldn’t start that conversation'
          : event.scope === 'support'
            ? 'Couldn’t reach MudKitchen Support'
            : 'Couldn’t open that conversation';
      return {
        kind: 'error',
        id: `messages-load-failed-${event.scope}`,
        title,
        description: event.message,
      };
    }
    case 'refreshed':
      return {
        kind: 'info',
        id: 'messages-refresh',
        title: 'Messages are up to date',
        durationMs: 2600,
      };
    case 'refresh_failed':
      return {
        kind: 'error',
        id: 'messages-refresh',
        title: 'Couldn’t refresh messages',
        description: 'Check your connection, then try again.',
      };
    case 'read_only':
      return {
        kind: 'info',
        id: 'messages-read-only',
        title: 'Read-only preview',
        description: 'Actions are turned off while previewing.',
      };
  }
}

/** The three "How messaging works" steps (web `START_STEPS`, touch wording). */
export const PARENT_MESSAGES_STEPS = [
  {
    title: 'Choose who to message',
    detail: 'Open a conversation from your inbox, or tap New message to start one.',
  },
  {
    title: 'Write your message',
    detail: `Add up to ${MAX_MESSAGE_ATTACHMENTS} photos or files if you need to — up to ${MAX_ATTACHMENT_MB_LABEL} each.`,
  },
  {
    title: 'Tap send',
    detail: 'Your message appears in the conversation right away. Press and hold your own message to edit or delete it.',
  },
] as const;
