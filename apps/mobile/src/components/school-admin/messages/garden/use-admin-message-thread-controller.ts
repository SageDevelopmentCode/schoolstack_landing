import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FlatList, TextInput } from 'react-native';

import { useAuth } from '@/contexts/auth-context';
import { useMessagesRealtime } from '@/contexts/messages-realtime-context';
import { useMessagesUnread } from '@/contexts/messages-unread-context';
import { useSchoolAdminMessagesInbox } from '@/contexts/school-admin-messages-inbox-context';
import { deleteMessage, editMessage, mergeMessages, sendMessage } from '@/lib/messages/api';
import { resolveAdminComposeState } from '@/lib/messages/compose-gating';
import { buildMessageRenderItems, type RenderMessageItem } from '@/lib/messages/format-chat';
import {
  fetchAndCacheSchoolAdminMessageThread,
  getCachedSchoolAdminMessageThread,
  hydrateSchoolAdminMessageThreadFromDisk,
  isSchoolAdminMessageThreadStale,
} from '@/lib/messages/message-thread-cache';
import {
  buildOptimisticPortalMessage,
  confirmOptimisticMessage,
  displayNameFromAuthMetadata,
  resolveOwnMessageSenderIdentity,
} from '@/lib/messages/optimistic-message';
import {
  createLoadGenerationGuard,
  createOptimisticSendTracker,
  reconcileThreadMessages,
} from '@/lib/messages/reconcile-thread-messages';
import type { MessageThreadDetail, PortalMessage, StagedMessageFile } from '@/lib/messages/types';
import { useMessageThreadMutations } from '@/lib/messages/use-message-thread-mutations';
import { usePortalReadOnly } from '@/lib/portal-preview-gating';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export type AdminThreadFeedbackEvent =
  | { type: 'send_failed'; message: string }
  | { type: 'edited'; message: PortalMessage }
  | { type: 'deleted'; message: PortalMessage }
  | { type: 'mutation_failed'; operation: 'edit' | 'delete'; message: string };

/**
 * One admin conversation (moved from `message-thread-screen.tsx`, same calls and
 * `reportError` operations): cache → disk → network with a generation guard,
 * realtime refresh, optimistic send + reconcile, compose gating, edit / delete.
 * Differences: a failed send puts the text and files back in the composer, edit
 * and delete failures are reported too, and outcomes go to `onFeedback`.
 */
export function useAdminMessageThreadController({
  threadId,
  organizationId,
  organizationSlug,
  schoolName,
  onFeedback,
}: {
  threadId: string;
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
  onFeedback?: (event: AdminThreadFeedbackEvent) => void;
}) {
  const { user } = useAuth();
  const { refreshUnreadCount } = useMessagesUnread();
  const { reportError } = useMobileErrorReporter(organizationId);
  const { staffDisplayName } = useSchoolAdminMessagesInbox();
  const readOnly = usePortalReadOnly();
  const feedbackRef = useRef(onFeedback);
  useEffect(() => {
    feedbackRef.current = onFeedback;
  }, [onFeedback]);

  const ownSenderFallback = useMemo(
    () => ({
      senderUserId: user?.id ?? 'self',
      senderName:
        staffDisplayName?.trim() ||
        displayNameFromAuthMetadata(
          typeof user?.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : undefined,
          user?.email,
        ),
      profilePhotoUrl: null,
    }),
    [staffDisplayName, user],
  );

  const [thread, setThread] = useState<MessageThreadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [stagedFiles, setStagedFiles] = useState<StagedMessageFile[]>([]);
  const [sending, setSending] = useState(false);
  const [lastSentId, setLastSentId] = useState<string | null>(null);
  const listRef = useRef<FlatList<RenderMessageItem>>(null);
  const composeInputRef = useRef<TextInput>(null);
  const optimisticSendRef = useRef(createOptimisticSendTracker());
  const loadGenerationRef = useRef(createLoadGenerationGuard());

  const scrollMessagesToEnd = useCallback(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, []);

  const applyThreadDetail = useCallback((detail: MessageThreadDetail) => {
    setThread((prev) => {
      if (!prev) return detail;
      return {
        ...detail,
        messages: reconcileThreadMessages(detail.messages, prev.messages, optimisticSendRef.current.getReconcileOptions()),
      };
    });
  }, []);

  const loadThread = useCallback(
    async (options?: { silent?: boolean; refresh?: boolean }) => {
      const cached =
        getCachedSchoolAdminMessageThread(organizationId, schoolName, threadId) ??
        (await hydrateSchoolAdminMessageThreadFromDisk(organizationId, schoolName, threadId));

      const hasCached = Boolean(cached);
      const isStale = hasCached ? isSchoolAdminMessageThreadStale(organizationId, schoolName, threadId) : false;
      const needsNetwork = options?.refresh || !hasCached || isStale;

      if (hasCached && !options?.refresh) {
        applyThreadDetail(cached!);
        setLoading(false);
      } else if (!hasCached && !options?.silent) {
        setLoading(true);
      }

      if (!needsNetwork) {
        if (!options?.silent) await refreshUnreadCount();
        return;
      }

      setLoadError(null);
      const generation = loadGenerationRef.current.bump();
      try {
        const detail = await fetchAndCacheSchoolAdminMessageThread(
          organizationId,
          schoolName,
          threadId,
          options?.refresh || isStale ? { refresh: true } : undefined,
        );
        if (!loadGenerationRef.current.isLatest(generation)) return;
        applyThreadDetail(detail);
        await refreshUnreadCount();
      } catch (error) {
        if (!loadGenerationRef.current.isLatest(generation)) return;
        if (!hasCached) {
          reportError('school_admin_message_thread_load', error, {
            entityType: 'message_thread',
            entityId: threadId,
          });
          setLoadError(error instanceof Error ? error.message : 'Failed to load conversation.');
        }
      } finally {
        setLoading(false);
      }
    },
    [applyThreadDetail, organizationId, refreshUnreadCount, reportError, schoolName, threadId],
  );

  useEffect(() => {
    void loadThread();
  }, [loadThread]);

  const retryLoad = useCallback(() => {
    setLoading(true);
    void loadThread({ refresh: true });
  }, [loadThread]);

  const { registerInboxConsumer } = useMessagesRealtime();
  useEffect(() => {
    return registerInboxConsumer({
      activeThreadId: threadId,
      onInboxChange: () => {
        void refreshUnreadCount();
      },
      onThreadMessage: (incomingThreadId) => {
        if (incomingThreadId === threadId) void loadThread({ silent: true, refresh: true });
      },
    });
  }, [loadThread, refreshUnreadCount, registerInboxConsumer, threadId]);

  const renderItems = useMemo(() => (thread ? buildMessageRenderItems(thread.messages) : []), [thread]);

  const composeState = useMemo(() => {
    if (!thread) return { disabled: true, banner: null };
    return resolveAdminComposeState(thread, readOnly, staffDisplayName);
  }, [readOnly, staffDisplayName, thread]);

  const mutations = useMessageThreadMutations({
    threadId,
    organizationId,
    schoolName,
    readOnly,
    setThread,
    mergeMessages,
    editMessage,
    deleteMessage,
    // No `onError`: operation-specific feedback comes from onMutationError below.
    onEdited: (message) => feedbackRef.current?.({ type: 'edited', message }),
    onDeleted: (message) => feedbackRef.current?.({ type: 'deleted', message }),
    onMutationError: (operation, error) => {
      reportError(operation === 'edit' ? 'school_admin_message_edit' : 'school_admin_message_delete', error, {
        entityType: 'message_thread',
        entityId: threadId,
      });
      feedbackRef.current?.({
        type: 'mutation_failed',
        operation,
        message: error instanceof Error ? error.message : `Failed to ${operation} message.`,
      });
    },
  });
  const { editingMessage, saveEdit, cancelEdit: cancelMutationEdit, savingEdit } = mutations;

  const editingId = editingMessage?.id;
  const editingBody = editingMessage?.body;
  useEffect(() => {
    if (!editingId) return;
    queueMicrotask(() => {
      setInput(editingBody ?? '');
      setStagedFiles([]);
    });
    requestAnimationFrame(() => composeInputRef.current?.focus());
  }, [editingBody, editingId]);

  useEffect(() => {
    if (renderItems.length === 0) return;
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: false }));
  }, [renderItems.length, thread?.messages.length]);

  const cancelEdit = useCallback(() => {
    cancelMutationEdit();
    setInput('');
  }, [cancelMutationEdit]);

  const handleSend = useCallback(async () => {
    if (!thread) return;

    if (editingMessage) {
      if (savingEdit) return;
      const editBody = input.trim();
      if (!editBody) return;
      const saved = await saveEdit(editBody);
      if (saved) setInput('');
      return;
    }

    if (composeState.disabled) return;
    const body = input.trim();
    if (!body && stagedFiles.length === 0) return;

    const optimisticMessage = buildOptimisticPortalMessage({
      threadId,
      body,
      files: stagedFiles,
      senderKind: 'org_admin',
      senderIdentity: resolveOwnMessageSenderIdentity(thread.messages, ownSenderFallback),
    });
    const optimisticId = optimisticMessage.id;

    optimisticSendRef.current.addPending(optimisticId);
    setThread((prev) => (prev ? { ...prev, messages: [...prev.messages, optimisticMessage] } : prev));

    const draftText = input;
    const filesToSend = [...stagedFiles];
    setInput('');
    setStagedFiles([]);
    setSending(true);

    try {
      const serverMessage = await sendMessage(threadId, {
        organizationId,
        organizationSlug,
        schoolName,
        body,
        files: filesToSend,
      });
      optimisticSendRef.current.confirm(optimisticId, serverMessage.id);
      setThread((prev) => {
        if (!prev) return prev;
        const withoutPending = prev.messages.filter((message) => message.id !== optimisticId);
        return {
          ...prev,
          messages: mergeMessages(withoutPending, [confirmOptimisticMessage(optimisticMessage, serverMessage)]),
        };
      });
      setLastSentId(serverMessage.id);
    } catch (sendError) {
      reportError('school_admin_message_send', sendError, {
        entityType: 'message_thread',
        entityId: threadId,
      });
      optimisticSendRef.current.fail(optimisticId);
      setThread((prev) =>
        prev ? { ...prev, messages: prev.messages.filter((message) => message.id !== optimisticId) } : prev,
      );
      // Keep the draft: put the text and files back unless the admin already typed something new.
      setInput((current) => (current.trim() ? current : draftText));
      setStagedFiles((current) => (current.length > 0 ? current : filesToSend));
      feedbackRef.current?.({
        type: 'send_failed',
        message: sendError instanceof Error ? sendError.message : 'Failed to send message.',
      });
    } finally {
      setSending(false);
    }
  }, [
    composeState.disabled,
    editingMessage,
    input,
    organizationId,
    organizationSlug,
    ownSenderFallback,
    reportError,
    saveEdit,
    savingEdit,
    schoolName,
    stagedFiles,
    thread,
    threadId,
  ]);

  return {
    readOnly,
    thread,
    loading,
    loadError,
    retryLoad,
    renderItems,
    composeState,
    mutations,
    input,
    setInput,
    stagedFiles,
    setStagedFiles,
    sending,
    lastSentId,
    handleSend,
    cancelEdit,
    listRef,
    composeInputRef,
    scrollMessagesToEnd,
  };
}

export type AdminMessageThreadController = ReturnType<typeof useAdminMessageThreadController>;
