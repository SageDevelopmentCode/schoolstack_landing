import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

import { ParentMessageThreadSkeleton } from '@/components/parent/messages/parent-message-thread-skeleton';

import { MessageBubble } from '@/components/school-admin/messages/message-bubble';
import { MessageComposeBar } from '@/components/school-admin/messages/message-compose-bar';
import { MessageThreadHeader } from '@/components/school-admin/messages/message-thread-header';
import { ThemedText } from '@/components/themed-text';
import { useMessagesUnread } from '@/contexts/messages-unread-context';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import {
  loadParentMessageThread,
  mergeMessages,
  sendParentMessage,
} from '@/lib/messages/parent-api';
import { buildMessageRenderItems } from '@/lib/messages/format-chat';
import { useMessagesRealtime } from '@/contexts/messages-realtime-context';
import type { RenderMessageItem } from '@/lib/messages/format-chat';
import type { MessageThreadDetail, PortalMessage, StagedMessageFile } from '@/lib/messages/types';

type ParentMessageThreadScreenProps = {
  threadId: string;
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
};

export function ParentMessageThreadScreen({
  threadId,
  organizationId,
  organizationSlug,
  schoolName,
}: ParentMessageThreadScreenProps) {
  const theme = useAdminTheme();
  const { refreshUnreadCount } = useMessagesUnread();

  const [thread, setThread] = useState<MessageThreadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [stagedFiles, setStagedFiles] = useState<StagedMessageFile[]>([]);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<RenderMessageItem>>(null);
  const pendingOptimisticIds = useRef(new Set<string>());

  const loadThread = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setLoading(true);
      }
      setError(null);
      try {
        const detail = await loadParentMessageThread(threadId, organizationId, schoolName);
        setThread((prev) => {
          if (!prev) return detail;
          const optimistic = prev.messages.filter((message) => message.pending);
          return {
            ...detail,
            messages: mergeMessages(detail.messages, optimistic),
          };
        });
        await refreshUnreadCount({ force: true });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load conversation.');
      } finally {
        setLoading(false);
      }
    },
    [organizationId, refreshUnreadCount, schoolName, threadId],
  );

  useEffect(() => {
    void loadThread();
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
          void loadThread({ silent: true });
        }
      },
    });
  }, [loadThread, refreshUnreadCount, registerInboxConsumer, threadId]);

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

    const optimisticId = `pending-${Date.now()}`;
    const optimisticMessage: PortalMessage = {
      id: optimisticId,
      threadId,
      body,
      senderUserId: 'self',
      senderKind: 'guardian',
      senderName: 'You',
      isOwn: true,
      createdAt: new Date().toISOString(),
      timeLabel: 'Now',
      attachments: stagedFiles.map((file, index) => ({
        id: `pending-file-${index}`,
        fileName: file.name,
        mimeType: file.mimeType,
        sizeBytes: file.size,
      })),
      pending: true,
    };

    pendingOptimisticIds.current.add(optimisticId);
    setThread((prev) =>
      prev ? { ...prev, messages: [...prev.messages, optimisticMessage] } : prev,
    );

    const filesToSend = [...stagedFiles];
    setInput('');
    setStagedFiles([]);
    setSending(true);

    try {
      const serverMessage = await sendParentMessage(threadId, {
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
          messages: mergeMessages(withoutPending, [serverMessage]),
        };
      });
      await loadThread({ silent: true });
    } catch (sendError) {
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
              styles.dayPillShadow,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}>
            <ThemedText type="small" color={theme.textTertiary} style={styles.dayPillText}>
              {item.dayLabel}
            </ThemedText>
          </View>
        </View>
      );
    }

    return (
      <MessageBubble
        message={item.message}
        showSenderName={item.showSenderName}
        isGroupedWithPrevious={item.isGroupedWithPrevious}
      />
    );
  };

  if (loading && !thread) {
    return <ParentMessageThreadSkeleton />;
  }

  if (!thread) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.bg }]}>
        <ThemedText type="default" style={{ color: theme.textSecondary }}>
          {error ?? 'Conversation not found.'}
        </ThemedText>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}>
      <MessageThreadHeader thread={thread} />

      {error ? (
        <View style={styles.errorWrap}>
          <ThemedText type="small" style={{ color: theme.error }}>
            {error}
          </ThemedText>
        </View>
      ) : null}

      <View style={[styles.messagesArea, { backgroundColor: theme.bg }]}>
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
    padding: Spacing.four,
  },
  errorWrap: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
  },
  messagesArea: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
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
  dayPillShadow: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 2,
    },
    default: {
      elevation: 1,
    },
  }),
  dayPillText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
  },
});
