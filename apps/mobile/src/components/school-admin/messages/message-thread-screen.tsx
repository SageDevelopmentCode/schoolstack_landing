import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AdminMessageThreadSkeleton } from '@/components/school-admin/messages/admin-message-thread-skeleton';
import { MessageBubble } from '@/components/school-admin/messages/message-bubble';
import { MessageComposeBar } from '@/components/school-admin/messages/message-compose-bar';
import { MessageThreadHeader } from '@/components/school-admin/messages/message-thread-header';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { StoryFonts } from '@/constants/story-theme';
import { useAuth } from '@/contexts/auth-context';
import { useMessagesUnread } from '@/contexts/messages-unread-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Radius, Spacing } from '@/constants/theme';
import { useSchoolAdminMessagesInbox } from '@/contexts/school-admin-messages-inbox-context';
import { resolveAdminComposeState } from '@/lib/messages/compose-gating';
import { usePortalReadOnly } from '@/lib/portal-preview-gating';
import {
  fetchAndCacheSchoolAdminMessageThread,
  getCachedSchoolAdminMessageThread,
  hydrateSchoolAdminMessageThreadFromDisk,
  isSchoolAdminMessageThreadStale,
} from '@/lib/messages/message-thread-cache';
import { mergeMessages, sendMessage } from '@/lib/messages/api';
import {
  createLoadGenerationGuard,
  createOptimisticSendTracker,
  reconcileThreadMessages,
} from '@/lib/messages/reconcile-thread-messages';
import {
  buildOptimisticPortalMessage,
  confirmOptimisticMessage,
  displayNameFromAuthMetadata,
  resolveOwnMessageSenderIdentity,
} from '@/lib/messages/optimistic-message';
import { buildMessageRenderItems } from '@/lib/messages/format-chat';
import { useMessagesRealtime } from '@/contexts/messages-realtime-context';
import type { RenderMessageItem } from '@/lib/messages/format-chat';
import type { MessageThreadDetail, PortalMessage, StagedMessageFile } from '@/lib/messages/types';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type MessageThreadScreenProps = {
  threadId: string;
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
};

export function MessageThreadScreen({
  threadId,
  organizationId,
  organizationSlug,
  schoolName,
}: MessageThreadScreenProps) {
  const theme = useParentTheme();
  const { user } = useAuth();
  const { refreshUnreadCount } = useMessagesUnread();
  const { reportError } = useMobileErrorReporter(organizationId);
  const { staffDisplayName } = useSchoolAdminMessagesInbox();

  const ownSenderFallback = useMemo(
    () => ({
      senderUserId: user?.id ?? 'self',
      senderName:
        staffDisplayName?.trim() ||
        displayNameFromAuthMetadata(
          typeof user?.user_metadata?.full_name === 'string'
            ? user.user_metadata.full_name
            : undefined,
          user?.email,
        ),
      profilePhotoUrl: null,
    }),
    [staffDisplayName, user],
  );

  const [thread, setThread] = useState<MessageThreadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [stagedFiles, setStagedFiles] = useState<StagedMessageFile[]>([]);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<RenderMessageItem>>(null);
  const optimisticSendRef = useRef(createOptimisticSendTracker());
  const loadGenerationRef = useRef(createLoadGenerationGuard());

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
      const cached =
        getCachedSchoolAdminMessageThread(organizationId, schoolName, threadId) ??
        (await hydrateSchoolAdminMessageThreadFromDisk(organizationId, schoolName, threadId));

      const hasCached = Boolean(cached);
      const isStale = hasCached
        ? isSchoolAdminMessageThreadStale(organizationId, schoolName, threadId)
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

      setError(null);
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
      } catch (loadError) {
        if (!loadGenerationRef.current.isLatest(generation)) return;
        if (!hasCached) {
          reportError('school_admin_message_thread_load', loadError, {
            entityType: 'message_thread',
            entityId: threadId,
          });
          setError(loadError instanceof Error ? loadError.message : 'Failed to load conversation.');
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

  const { registerInboxConsumer } = useMessagesRealtime();

  useEffect(() => {
    return registerInboxConsumer({
      activeThreadId: threadId,
      onInboxChange: () => {
        void refreshUnreadCount();
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

  const readOnly = usePortalReadOnly();

  const composeState = useMemo(() => {
    if (!thread) return { disabled: true, banner: null };
    return resolveAdminComposeState(thread, readOnly, staffDisplayName);
  }, [readOnly, staffDisplayName, thread]);

  useEffect(() => {
    if (renderItems.length === 0) return;
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: false });
    });
  }, [renderItems.length, thread?.messages.length]);

  const handleSend = async () => {
    if (!thread || composeState.disabled) return;
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
    setThread((prev) =>
      prev ? { ...prev, messages: [...prev.messages, optimisticMessage] } : prev,
    );

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
          messages: mergeMessages(withoutPending, [
            confirmOptimisticMessage(optimisticMessage, serverMessage),
          ]),
        };
      });
    } catch (sendError) {
      reportError('school_admin_message_send', sendError, {
        entityType: 'message_thread',
        entityId: threadId,
      });
      optimisticSendRef.current.fail(optimisticId);
      setThread((prev) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.filter((message) => message.id !== optimisticId),
            }
          : prev,
      );
      setError(sendError instanceof Error ? sendError.message : 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const renderChatItem = ({ item }: { item: RenderMessageItem }) => {
    if (item.type === 'day') {
      return (
        <View style={styles.daySeparator}>
          <View
            style={[
              styles.dayPill,
              {
                backgroundColor: theme.white,
                borderColor: theme.line,
              },
            ]}>
            <Text style={[styles.dayPillText, { color: theme.muted }]}>{item.dayLabel}</Text>
          </View>
        </View>
      );
    }

    return (
      <MessageBubble
        message={item.message}
        showSenderName={item.showSenderName}
        isGroupedWithPrevious={item.isGroupedWithPrevious}
        variant="admin-story"
      />
    );
  };

  if (loading && !thread) {
    return <AdminMessageThreadSkeleton />;
  }

  if (!thread) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.paper }]}>
        <Text style={[styles.centeredText, { color: theme.muted }]}>
          {error ?? 'Conversation not found.'}
        </Text>
      </View>
    );
  }

  const hasMessages = thread.messages.length > 0;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.paper }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}>
      <MessageThreadHeader thread={thread} variant="admin-story" />

      {composeState.banner ? (
        <View
          style={[
            styles.banner,
            {
              backgroundColor:
                composeState.banner.variant === 'warning' ? theme.warningBg : theme.primarySoft,
            },
          ]}>
          <Text
            style={[
              styles.bannerText,
              {
                color:
                  composeState.banner.variant === 'warning' ? theme.warning : theme.muted,
              },
            ]}>
            {composeState.banner.message}
          </Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorWrap}>
          <StoryErrorBanner message={error} />
        </View>
      ) : null}

      <View style={[styles.messagesArea, { backgroundColor: theme.paper }]}>
        {hasMessages ? (
          <FlatList
            ref={listRef}
            data={renderItems}
            keyExtractor={(item) => (item.type === 'day' ? item.dayKey : item.message.id)}
            renderItem={renderChatItem}
            contentContainerStyle={styles.messagesContent}
            style={styles.messagesList}
            onContentSizeChange={() => {
              listRef.current?.scrollToEnd({ animated: false });
            }}
          />
        ) : (
          <View style={styles.emptyThread}>
            <View style={[styles.emptyIconCircle, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name="chatbubble-outline" size={24} color={theme.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.ink }]}>
              Say hello to {thread.title}
            </Text>
            <Text style={[styles.emptyDescription, { color: theme.muted }]}>
              Send a message to start the conversation.
            </Text>
          </View>
        )}
      </View>

      <MessageComposeBar
        value={input}
        onChange={setInput}
        files={stagedFiles}
        onFilesChange={setStagedFiles}
        onSend={() => {
          void handleSend();
        }}
        sending={sending}
        disabled={composeState.disabled}
        variant="admin-story"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.four,
  },
  centeredText: {
    fontFamily: StoryFonts.body,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  banner: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.two,
  },
  bannerText: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  errorWrap: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.two,
  },
  messagesArea: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: Spacing.three,
  },
  daySeparator: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  dayPill: {
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    paddingVertical: 4,
  },
  dayPillText: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
  },
  emptyThread: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.six,
    gap: Spacing.two,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  emptyTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyDescription: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
