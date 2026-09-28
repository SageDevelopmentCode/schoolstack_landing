import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';

import { PORTAL_MESSAGE_DELETED_PREVIEW } from '@/lib/messages/constants';
import { portalMessageSupportsTextMutation } from '@/lib/messages/message-mutation-eligibility';
import type { MessageThreadDetail, PortalMessage } from '@/lib/messages/types';

type MergeMessages = (existing: PortalMessage[], incoming: PortalMessage[]) => PortalMessage[];

type UseMessageThreadMutationsParams = {
  threadId: string;
  organizationId: string;
  schoolName: string;
  readOnly: boolean;
  setThread: Dispatch<SetStateAction<MessageThreadDetail | null>>;
  mergeMessages: MergeMessages;
  editMessage: (
    threadId: string,
    messageId: string,
    params: { organizationId: string; schoolName: string; body: string },
  ) => Promise<PortalMessage>;
  deleteMessage: (
    threadId: string,
    messageId: string,
    params: { organizationId: string; schoolName: string },
  ) => Promise<PortalMessage>;
  onError?: (message: string) => void;
};

function previewForMessage(message: PortalMessage): string {
  return message.deletedAt ? PORTAL_MESSAGE_DELETED_PREVIEW : message.body;
}

export function useMessageThreadMutations({
  threadId,
  organizationId,
  schoolName,
  readOnly,
  setThread,
  mergeMessages,
  editMessage,
  deleteMessage,
  onError,
}: UseMessageThreadMutationsParams) {
  const [actionTarget, setActionTarget] = useState<PortalMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PortalMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<PortalMessage | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const applyServerMessage = useCallback(
    (messageId: string, serverMessage: PortalMessage) => {
      setThread((prev) => {
        if (!prev) return prev;
        const messages = mergeMessages(
          prev.messages.filter((message) => message.id !== messageId),
          [serverMessage],
        );
        const lastId = messages.at(-1)?.id;
        const lastMessagePreview =
          lastId === messageId ? previewForMessage(serverMessage) : prev.lastMessagePreview;
        return { ...prev, messages, lastMessagePreview };
      });
    },
    [mergeMessages, setThread],
  );

  const closeActionSheet = useCallback(() => {
    setActionTarget(null);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    if (!deleting) {
      setDeleteTarget(null);
    }
  }, [deleting]);

  const cancelEdit = useCallback(() => {
    if (!savingEdit) {
      setEditingMessage(null);
    }
  }, [savingEdit]);

  const handleActionEdit = useCallback(() => {
    setActionTarget((target) => {
      if (target) {
        setEditingMessage(target);
      }
      return null;
    });
  }, []);

  const handleActionDelete = useCallback(() => {
    if (actionTarget) {
      setDeleteTarget(actionTarget);
    }
  }, [actionTarget]);

  const saveEdit = useCallback(
    async (body: string): Promise<boolean> => {
      if (!editingMessage || !body) return false;

      setSavingEdit(true);
      try {
        const serverMessage = await editMessage(threadId, editingMessage.id, {
          organizationId,
          schoolName,
          body,
        });
        applyServerMessage(editingMessage.id, serverMessage);
        setEditingMessage(null);
        return true;
      } catch (err) {
        onError?.(err instanceof Error ? err.message : 'Failed to edit message.');
        return false;
      } finally {
        setSavingEdit(false);
      }
    },
    [
      applyServerMessage,
      editMessage,
      editingMessage,
      onError,
      organizationId,
      schoolName,
      threadId,
    ],
  );

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget || deleting) return;

    setDeleting(true);
    try {
      const serverMessage = await deleteMessage(threadId, deleteTarget.id, {
        organizationId,
        schoolName,
      });
      applyServerMessage(deleteTarget.id, serverMessage);
      setDeleteTarget(null);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to delete message.');
    } finally {
      setDeleting(false);
    }
  }, [
    applyServerMessage,
    deleteMessage,
    deleteTarget,
    deleting,
    onError,
    organizationId,
    schoolName,
    threadId,
  ]);

  const handleMessageLongPress = useCallback(
    (message: PortalMessage) => {
      if (readOnly || !portalMessageSupportsTextMutation(message)) {
        return;
      }

      setActionTarget(message);
    },
    [readOnly],
  );

  return {
    handleMessageLongPress,
    actionTarget,
    closeActionSheet,
    handleActionEdit,
    handleActionDelete,
    deleteTarget,
    closeDeleteConfirm,
    confirmDelete,
    editingMessage,
    savingEdit,
    deleting,
    cancelEdit,
    saveEdit,
  };
}

export type MessageThreadMutations = ReturnType<typeof useMessageThreadMutations>;
