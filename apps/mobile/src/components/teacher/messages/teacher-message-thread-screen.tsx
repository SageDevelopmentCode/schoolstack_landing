import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ParentMessageThreadSkeleton } from '@/components/parent/messages/parent-message-thread-skeleton';
import { MessageBubble } from '@/components/school-admin/messages/message-bubble';
import { MessageComposeBar } from '@/components/school-admin/messages/message-compose-bar';
import { TeacherMessageThreadHeader } from '@/components/teacher/messages/teacher-message-thread-header';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { useAuth } from '@/contexts/auth-context';
import { useMessagesUnread } from '@/contexts/messages-unread-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { useTeacherHome } from '@/contexts/teacher-home-context';
import { useTeacherMessagesInbox } from '@/contexts/teacher-messages-inbox-context';
import { Radius, Spacing } from '@/constants/theme';
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
  createTeacherMessageThread,
  mergeMessages,
  sendTeacherMessage,
} from '@/lib/messages/teacher-api';
import { buildMessageRenderItems } from '@/lib/messages/format-chat';
import { useMessagesRealtime } from '@/contexts/messages-realtime-context';
import { teacherMessageThreadRoute } from '@/lib/teacher/teacher-nav';
import type { RenderMessageItem } from '@/lib/messages/format-chat';
import type {
  MessageContact,
  MessageThreadDetail,
  MessageThreadSummary,
  PortalMessage,
  StagedMessageFile,
} from '@/lib/messages/types';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type TeacherMessageThreadScreenProps = {
  threadId: string;
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
  pendingContactKey?: string | null;
};

function contactToThreadPreview(
  contact: MessageContact,
): Pick<
  MessageThreadSummary,
  'title' | 'subtitle' | 'subtitleStudents' | 'color' | 'photoUrl' | 'listAvatars'
> {
  return {
    title: contact.name,
    subtitle: contact.subtitle,
    subtitleStudents: contact.subtitleStudents,
    color: contact.color,
    photoUrl: contact.profilePhotoUrl ?? null,
  };
}

export function TeacherMessageThreadScreen({
  threadId,
  organizationId,
  organizationSlug,
  schoolName,
  pendingContactKey = null,
}: TeacherMessageThreadScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { data: homeData } = useTeacherHome();
  const { reportError } = useMobileErrorReporter(organizationId);
  const { refreshUnreadCount } = useMessagesUnread();
  const { contacts, refresh: refreshInbox } = useTeacherMessagesInbox();

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
  const isPendingNewThread = threadId === 'new';

  const [thread, setThread] = useState<MessageThreadDetail | null>(null);
  const [loading, setLoading] = useState(!isPendingNewThread);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [stagedFiles, setStagedFiles] = useState<StagedMessageFile[]>([]);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<RenderMessageItem>>(null);
  const pendingOptimisticIds = useRef(new Set<string>());
  const bootstrapStartedRef = useRef(false);

  const pendingContact = useMemo(() => {
    if (!isPendingNewThread || !pendingContactKey) return null;
    return contacts.find((contact) => contact.key === pendingContactKey) ?? null;
  }, [contacts, isPendingNewThread, pendingContactKey]);

  const applyThreadDetail = useCallback((detail: MessageThreadDetail) => {
    setThread((prev) => {
      if (!prev) return detail;
      const optimistic = prev.messages.filter((message) => message.pending);
      return {
        ...detail,
        messages: mergeMessages(detail.messages, optimistic),
      };
    });
  }, []);

  const loadThread = useCallback(
    async (options?: { silent?: boolean; refresh?: boolean }) => {
      if (isPendingNewThread) return;

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

      setError(null);
      try {
        const detail = await fetchAndCacheTeacherMessageThread(
          organizationId,
          schoolName,
          threadId,
          options?.refresh || isStale ? { refresh: true } : undefined,
        );
        applyThreadDetail(detail);
        await refreshUnreadCount();
      } catch (loadError) {
        if (!hasCached) {
          reportError('teacher_message_thread_load', loadError, {
            entityType: 'message_thread',
            entityId: threadId,
          });
          setError(loadError instanceof Error ? loadError.message : 'Failed to load conversation.');
        }
      } finally {
        setLoading(false);
      }
    },
    [
      applyThreadDetail,
      isPendingNewThread,
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

  useEffect(() => {
    if (!isPendingNewThread) {
      bootstrapStartedRef.current = false;
      return;
    }

    if (!pendingContactKey) {
      setError('Contact not found.');
      setLoading(false);
      return;
    }

    if (!pendingContact) {
      return;
    }

    if (bootstrapStartedRef.current) {
      return;
    }
    bootstrapStartedRef.current = true;

    let cancelled = false;

    async function bootstrapNewThread() {
      setError(null);
      try {
        const newThreadId = await createTeacherMessageThread(organizationId, pendingContact!);
        if (cancelled) return;

        void refreshInbox({ silent: true });
        router.replace(teacherMessageThreadRoute(organizationSlug, newThreadId));
      } catch (bootstrapError) {
        if (cancelled) return;
        reportError('teacher_message_thread_create', bootstrapError, {
          entityType: 'message_contact',
          entityId: pendingContact!.key,
        });
        setError(
          bootstrapError instanceof Error
            ? bootstrapError.message
            : 'Failed to start conversation.',
        );
        setLoading(false);
        bootstrapStartedRef.current = false;
      }
    }

    void bootstrapNewThread();

    return () => {
      cancelled = true;
    };
  }, [
    isPendingNewThread,
    organizationId,
    organizationSlug,
    pendingContact,
    pendingContactKey,
    refreshInbox,
    reportError,
    router,
  ]);

  const { registerInboxConsumer } = useMessagesRealtime();

  useEffect(() => {
    if (isPendingNewThread) return;

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
  }, [isPendingNewThread, loadThread, refreshUnreadCount, registerInboxConsumer, threadId]);

  const renderItems = useMemo(
    () => (thread ? buildMessageRenderItems(thread.messages) : []),
    [thread],
  );

  useEffect(() => {
    if (renderItems.length === 0) return;
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: false });
    });
  }, [renderItems.length, thread?.messages.length]);

  const handleSend = async () => {
    if (!thread) return;
    const body = input.trim();
    if (!body && stagedFiles.length === 0) return;

    const optimisticMessage = buildOptimisticPortalMessage({
      threadId,
      body,
      files: stagedFiles,
      senderKind: 'staff_member',
      senderIdentity: resolveOwnMessageSenderIdentity(thread.messages, ownSenderFallback),
    });
    const optimisticId = optimisticMessage.id;

    pendingOptimisticIds.current.add(optimisticId);
    setThread((prev) =>
      prev ? { ...prev, messages: [...prev.messages, optimisticMessage] } : prev,
    );

    const filesToSend = [...stagedFiles];
    setInput('');
    setStagedFiles([]);
    setSending(true);

    try {
      const serverMessage = await sendTeacherMessage(threadId, {
        organizationId,
        organizationSlug,
        schoolName,
        body,
        files: filesToSend,
      });

      pendingOptimisticIds.current.delete(optimisticId);
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
      pendingOptimisticIds.current.delete(optimisticId);
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
        variant="parent-story"
      />
    );
  };

  if (isPendingNewThread) {
    if (!pendingContactKey) {
      return (
        <View style={[styles.centered, { backgroundColor: theme.paper }]}>
          <Text style={[styles.centeredText, { color: theme.muted }]}>
            {error ?? 'Contact not found.'}
          </Text>
        </View>
      );
    }

    if (!pendingContact && !error) {
      return <ParentMessageThreadSkeleton />;
    }

    if (!pendingContact) {
      return (
        <View style={[styles.container, { backgroundColor: theme.paper }]}>
          {error ? (
            <View style={styles.errorWrap}>
              <StoryErrorBanner message={error} />
            </View>
          ) : null}
          <View style={[styles.centered, { backgroundColor: theme.paper }]}>
            <Text style={[styles.centeredText, { color: theme.muted }]}>
              {error ?? 'Contact not found.'}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.container, { backgroundColor: theme.paper }]}>
        <TeacherMessageThreadHeader
          thread={contactToThreadPreview(pendingContact)}
          organizationSlug={organizationSlug}
        />
        {error ? (
          <View style={styles.errorWrap}>
            <StoryErrorBanner message={error} />
          </View>
        ) : (
          <ParentMessageThreadSkeleton showHeader={false} />
        )}
      </View>
    );
  }

  if (loading && !thread) {
    return <ParentMessageThreadSkeleton />;
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
      <TeacherMessageThreadHeader thread={thread} organizationSlug={organizationSlug} />

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
        disabled={false}
        variant="parent-story"
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
