import { useCallback, useState } from 'react';

import { closeThen, SHEET_DISMISS_MS, useGardenPullRefresh } from '@/components/parent/garden/feedback';
import { useGardenToast } from '@/components/parent/garden/toast';
import type { BroadcastSentResult } from '@/components/school-admin/messages/garden/admin-broadcast-sheet';
import type { NewConversationNotice } from '@/components/school-admin/messages/garden/admin-new-conversation-sheet';
import type { AdminMessagesInboxController } from '@/components/school-admin/messages/garden/use-admin-messages-inbox-controller';
import { haptic } from '@/lib/haptics';
import type { MessageContact } from '@/lib/messages/types';

/**
 * Inbox feedback: pull-to-refresh toasts, in-sheet status while a conversation
 * starts (toasts sit behind sheets), close-then-open navigation, and the
 * "Messages sent" toast once the bulk sheet has closed. Failures are reported
 * by the controller / inbox context, never here.
 */
export function useAdminMessagesFeedback(controller: AdminMessagesInboxController) {
  const toast = useGardenToast();
  const [newConversationNotice, setNewConversationNotice] = useState<NewConversationNotice | null>(null);
  const { startConversation, setNewConversationOpen, openThread, existingContactKeys, readOnly, onBroadcastSent } =
    controller;

  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh: controller.refresh,
    error: controller.error,
    label: 'Messages',
    id: 'admin-messages-refresh',
  });

  const closeNewConversation = useCallback(() => {
    setNewConversationNotice(null);
    setNewConversationOpen(false);
  }, [setNewConversationOpen]);

  const selectContact = useCallback(
    async (contact: MessageContact) => {
      if (readOnly && !existingContactKeys.has(contact.key)) {
        haptic.warning();
        setNewConversationNotice({
          tone: 'info',
          title: 'Read-only preview',
          message: 'Starting conversations is turned off while previewing. Existing conversations still open.',
        });
        return;
      }
      setNewConversationNotice(null);
      const result = await startConversation(contact);
      if (!result) return;
      if (!result.ok) {
        haptic.error();
        setNewConversationNotice({
          tone: 'error',
          title: `Couldn't start a conversation with ${contact.name}`,
          message: `${result.error} Nothing was sent. Tap their name to try again.`,
        });
        return;
      }
      haptic.success();
      closeThen(closeNewConversation, () => {
        openThread(result.threadId);
        if (!result.existing) {
          toast.success(`Conversation started with ${contact.name}`, {
            id: 'admin-messages-started',
            description: 'Write your first message below.',
          });
        }
      });
    },
    [closeNewConversation, existingContactKeys, openThread, readOnly, startConversation, toast],
  );

  const onSent = useCallback(
    ({ sentCount, complete }: BroadcastSentResult) => {
      onBroadcastSent();
      if (!complete) return;
      setTimeout(() => {
        toast.success('Messages sent', {
          id: 'admin-messages-broadcast',
          description: `Sent to ${sentCount} parent${sentCount === 1 ? '' : 's'}, each in their own school office thread.`,
        });
      }, SHEET_DISMISS_MS);
    },
    [onBroadcastSent, toast],
  );

  return { pullRefreshing, onPullRefresh, newConversationNotice, closeNewConversation, selectContact, onSent };
}
