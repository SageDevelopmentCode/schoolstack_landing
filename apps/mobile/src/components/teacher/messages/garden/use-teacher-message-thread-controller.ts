import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FlatList, TextInput } from 'react-native';

import { useAuth } from '@/contexts/auth-context';
import { useMessagesRealtime } from '@/contexts/messages-realtime-context';
import { useMessagesUnread } from '@/contexts/messages-unread-context';
import { useTeacherHome } from '@/contexts/teacher-home-context';
import { useTeacherMessagesInbox } from '@/contexts/teacher-messages-inbox-context';
import type { RenderMessageItem } from '@/lib/messages/format-chat';
import { buildMessageRenderItems } from '@/lib/messages/format-chat';
import {
  fetchAndCacheTeacherMessageThread,
  getCachedTeacherMessageThread,
  hydrateTeacherMessageThreadFromDisk,
  isTeacherMessageThreadStale,
} from '@/lib/messages/message-thread-cache';
import {
  buildOptimisticPortalMessage,
  confirmOptimisticMessage,
  displayNameFromAuthMetadata,
  resolveOwnMessageSenderIdentity,
} from '@/lib/messages/optimistic-message';
import {
  createMudKitchenSupportThread,
  deleteTeacherMessage,
  editTeacherMessage,
  mergeMessages,
  sendTeacherMessage,
} from '@/lib/messages/teacher-api';
import type { ParentMessagesFeedbackEvent } from '@/lib/messages/parent-messages-feedback';
import {
  isMudKitchenSupportPlaceholder,
  mudKitchenSupportPlaceholderThread,
} from '@/lib/messages/platform-support';
import {
  createLoadGenerationGuard,
  createOptimisticSendTracker,
  reconcileThreadMessages,
} from '@/lib/messages/reconcile-thread-messages';
import type { MessageThreadDetail, StagedMessageFile } from '@/lib/messages/types';
import { useMessageThreadMutations } from '@/lib/messages/use-message-thread-mutations';
import { teacherMessageThreadRoute } from '@/lib/teacher/teacher-nav';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

import type {
  ParentMessageThreadController,
  ParentMessageThreadControllerParams,
} from '@/components/parent/messages/garden/use-parent-message-thread-controller';

function errorText(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

/**
 * Data + every callback for one teacher conversation (no UI), in the shape the
 * Garden thread screen takes. Same behaviour as the old teacher thread screen
 * (cache → disk → network with a generation guard, realtime refresh,
 * optimistic send as `staff_member` + reconcile, MudKitchen Support placeholder
 * → real thread, edit / delete, `teacher_message_*` operations). New: a failed
 * send puts the text and files back, and edit / delete failures are reported
 * (`teacher_message_edit` / `teacher_message_delete`) and shown.
 */
export function useTeacherMessageThreadController({
  threadId,
  organizationId,
  organizationSlug,
  schoolName,
  onFeedback,
}: ParentMessageThreadControllerParams): ParentMessageThreadController {
  const router = useRouter();
  const { user } = useAuth();
  const { data: homeData } = useTeacherHome();
  const { refresh: refreshInbox } = useTeacherMessagesInbox();
  const { reportError } = useMobileErrorReporter(organizationId);
  const { refreshUnreadCount } = useMessagesUnread();
  const isSupportPlaceholder = isMudKitchenSupportPlaceholder(threadId);
  const feedbackRef = useRef(onFeedback);
  feedbackRef.current = onFeedback;
  const emit = useCallback((event: ParentMessagesFeedbackEvent) => {
    feedbackRef.current?.(event);
  }, []);

  const ownSenderFallback = useMemo(
    () => ({
      senderUserId: user?.id ?? 'self',
      senderName:
        homeData?.userProfile.displayName?.trim() ||
        displayNameFromAuthMetadata(
          typeof user?.user_metadata?.full_name === 'string'
            ? user.user_metadata.full_name
            : undefined,
          user?.email,
        ),
      profilePhotoUrl: homeData?.userProfile.profilePhotoUrl ?? null,
    }),
    [homeData?.userProfile.displayName, homeData?.userProfile.profilePhotoUrl, user],
  );

  const [thread, setThread] = useState<MessageThreadDetail | null>(() =>
    isSupportPlaceholder ? { ...mudKitchenSupportPlaceholderThread(), messages: [] } : null,
  );
  const [loading, setLoading] = useState(!isSupportPlaceholder);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [stagedFiles, setStagedFiles] = useState<StagedMessageFile[]>([]);
  const [sending, setSending] = useState(false);
  /** Server id of the last message this session sent (drives "Sent ✓"). */
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
        messages: reconcileThreadMessages(
          detail.messages,
          prev.messages,
          optimisticSendRef.current.getReconcileOptions(),
        ),
      };
    });
  }, []);

  const loadThread = useCallback(
    async (options?: { silent?: boolean; refresh?: boolean }) => {
      if (isSupportPlaceholder) {
        setLoading(false);
        return;
      }

      const cached =
        getCachedTeacherMessageThread(organizationId, schoolName, threadId) ??
        (await hydrateTeacherMessageThreadFromDisk(organizationId, schoolName, threadId));

      const hasCached = Boolean(cached);
      const isStale = hasCached
        ? isTeacherMessageThreadStale(organizationId, schoolName, threadId)
        : false;
      const needsNetwork = options?.refresh || !hasCached || isStale;

      if (hasCached && !options?.refresh) {
        applyThreadDetail(cached!);
        setLoading(false);
      } else if (!hasCached && !options?.silent) {
        setLoading(true);
      }

      if (!needsNetwork) {
        if (!options?.silent) {
          await refreshUnreadCount();
        }
        return;
      }

      setLoadError(null);
      const generation = loadGenerationRef.current.bump();
      try {
        const detail = await fetchAndCacheTeacherMessageThread(
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
          reportError('teacher_message_thread_load', error, {
            entityType: 'message_thread',
            entityId: threadId,
          });
          setLoadError(errorText(error, 'Failed to load conversation.'));
        }
      } finally {
        setLoading(false);
      }
    },
    [
      applyThreadDetail,
      isSupportPlaceholder,
      organizationId,
      refreshUnreadCount,
      reportError,
      schoolName,
      threadId,
    ],
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
        void refreshUnreadCount({ force: true });
      },
      onThreadMessage: (incomingThreadId) => {
        if (incomingThreadId === threadId) {
          void loadThread({ silent: true, refresh: true });
        }
      },
    });
  }, [loadThread, refreshUnreadCount, registerInboxConsumer, threadId]);

  const renderItems = useMemo(
    () => (thread ? buildMessageRenderItems(thread.messages) : []),
    [thread],
  );

  const mutations = useMessageThreadMutations({
    threadId,
    organizationId,
    schoolName,
    readOnly: false,
    setThread,
    mergeMessages,
    editMessage: editTeacherMessage,
    deleteMessage: deleteTeacherMessage,
    onEdited: () => emit({ type: 'edited' }),
    onDeleted: () => emit({ type: 'deleted' }),
    onMutationError: (operation, error) => {
      reportError(
        operation === 'edit' ? 'teacher_message_edit' : 'teacher_message_delete',
        error,
        { entityType: 'message_thread', entityId: threadId },
      );
      const message = errorText(
        error,
        operation === 'edit' ? 'Failed to edit message.' : 'Failed to delete message.',
      );
      emit(
        operation === 'edit' ? { type: 'edit_failed', message } : { type: 'delete_failed', message },
      );
    },
  });
  const { editingMessage, saveEdit, cancelEdit: cancelMutationEdit, savingEdit } = mutations;

  useEffect(() => {
    if (!editingMessage) return;
    setInput(editingMessage.body);
    setStagedFiles([]);
    requestAnimationFrame(() => {
      composeInputRef.current?.focus();
    });
    // Only when a different message enters edit mode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingMessage?.id]);

  useEffect(() => {
    if (renderItems.length === 0) return;
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: false });
    });
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

    const body = input.trim();
    if (!body && stagedFiles.length === 0) return;

    let threadIdForSend = threadId;
    if (isSupportPlaceholder) {
      try {
        threadIdForSend = await createMudKitchenSupportThread(organizationId);
      } catch (createError) {
        reportError('teacher_message_thread_create', createError);
        emit({
          type: 'load_failed',
          scope: 'support',
          message: `${errorText(createError, 'Failed to start support conversation.')} Your message is still in the box.`,
        });
        return;
      }
    }

    const optimisticMessage = buildOptimisticPortalMessage({
      threadId: threadIdForSend,
      body,
      files: stagedFiles,
      senderKind: 'staff_member',
      senderIdentity: resolveOwnMessageSenderIdentity(thread.messages, ownSenderFallback),
    });
    const optimisticId = optimisticMessage.id;

    optimisticSendRef.current.addPending(optimisticId);
    setThread((prev) =>
      prev ? { ...prev, messages: [...prev.messages, optimisticMessage] } : prev,
    );

    const filesToSend = [...stagedFiles];
    const draftBody = input;
    setInput('');
    setStagedFiles([]);
    setSending(true);

    try {
      const serverMessage = await sendTeacherMessage(threadIdForSend, {
        organizationId,
        organizationSlug,
        schoolName,
        body,
        files: filesToSend,
      });

      if (isSupportPlaceholder) {
        void refreshInbox({ silent: true });
        router.replace(teacherMessageThreadRoute(organizationSlug, threadIdForSend));
        return;
      }

      optimisticSendRef.current.confirm(optimisticId, serverMessage.id);
      setLastSentId(serverMessage.id);
      setThread((prev) => {
        if (!prev) return prev;
        const withoutPending = prev.messages.filter((message) => message.id !== optimisticId);
        return {
          ...prev,
          messages: mergeMessages(withoutPending, [
            confirmOptimisticMessage(optimisticMessage, serverMessage),
          ]),
        };
      });
    } catch (sendError) {
      reportError('teacher_message_send', sendError, {
        entityType: 'message_thread',
        entityId: threadId,
      });
      optimisticSendRef.current.fail(optimisticId);
      setThread((prev) =>
        prev
          ? { ...prev, messages: prev.messages.filter((message) => message.id !== optimisticId) }
          : prev,
      );
      // Put the draft back (the composer is locked while sending, so nothing new was typed).
      const restored = draftBody.trim().length > 0 || filesToSend.length > 0;
      setInput(draftBody);
      setStagedFiles(filesToSend);
      emit({
        type: 'send_failed',
        message: errorText(sendError, 'Failed to send message.'),
        restored,
      });
    } finally {
      setSending(false);
    }
  }, [
    editingMessage,
    emit,
    input,
    isSupportPlaceholder,
    organizationId,
    organizationSlug,
    ownSenderFallback,
    refreshInbox,
    reportError,
    router,
    saveEdit,
    savingEdit,
    schoolName,
    stagedFiles,
    thread,
    threadId,
  ]);

  return {
    threadId,
    isSupportPlaceholder,
    thread,
    loading,
    loadError,
    retryLoad,
    renderItems,
    lastSentId,
    input,
    setInput,
    stagedFiles,
    setStagedFiles,
    sending,
    handleSend,
    cancelEdit,
    mutations,
    listRef,
    composeInputRef,
    scrollMessagesToEnd,
  };
}
