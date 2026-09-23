import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { MessageBubble } from '@/components/school-admin/messages/message-bubble';
import { MessageComposeBar } from '@/components/school-admin/messages/message-compose-bar';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { mapCommitteeMessagesToPortalMessages } from '@/lib/parent/committees/committee-message-mapper';
import { postCommitteeMessage } from '@/lib/parent/committees/mutations';
import type { ParentCommitteeSectionProps } from '@/lib/parent/committees/section-props';
import { buildMessageRenderItems, type RenderMessageItem } from '@/lib/messages/format-chat';
import {
  buildOptimisticPortalMessage,
  resolveOwnMessageSenderIdentity,
} from '@/lib/messages/optimistic-message';
import {
  createOptimisticSendTracker,
  reconcileThreadMessages,
} from '@/lib/messages/reconcile-thread-messages';
import type { PortalMessage, StagedMessageFile } from '@/lib/messages/types';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export function ParentCommitteeMessagesSection({
  committee,
  organizationId,
  supabase,
  currentMemberId,
  readOnly = false,
  isAdmin = false,
  onRefresh,
}: ParentCommitteeSectionProps) {
  const theme = useParentTheme();
  const { reportError } = useMobileErrorReporter(organizationId);
  const listRef = useRef<FlatList<RenderMessageItem>>(null);
  const optimisticSendRef = useRef(createOptimisticSendTracker());

  const [input, setInput] = useState('');
  const [stagedFiles, setStagedFiles] = useState<StagedMessageFile[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<PortalMessage[]>([]);

  const currentMember = committee.members.find((member) => member.id === currentMemberId);
  const ownSenderFallback = useMemo(
    () => ({
      senderUserId: currentMemberId ?? (isAdmin ? 'school-admin' : 'self'),
      senderName: isAdmin ? 'School Admin' : currentMember?.name ?? 'You',
      profilePhotoUrl: null,
    }),
    [currentMember?.name, currentMemberId, isAdmin],
  );

  const serverMessages = useMemo(
    () => mapCommitteeMessagesToPortalMessages(committee, currentMemberId),
    [committee, currentMemberId],
  );

  useEffect(() => {
    setLocalMessages((prev) =>
      reconcileThreadMessages(
        serverMessages,
        prev,
        optimisticSendRef.current.getReconcileOptions(),
      ),
    );
  }, [serverMessages]);

  const renderItems = useMemo(() => buildMessageRenderItems(localMessages), [localMessages]);

  useEffect(() => {
    if (renderItems.length === 0) return;
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: false });
    });
  }, [renderItems.length, localMessages.length]);

  const handleSend = useCallback(async () => {
    if (readOnly || sending) return;
    const trimmed = input.trim();
    if (!trimmed && stagedFiles.length === 0) return;

    const optimisticMessage = buildOptimisticPortalMessage({
      threadId: committee.id,
      body: trimmed,
      files: stagedFiles,
      senderKind: 'guardian',
      senderIdentity: resolveOwnMessageSenderIdentity(localMessages, ownSenderFallback),
    });
    const optimisticId = optimisticMessage.id;

    optimisticSendRef.current.addPending(optimisticId);
    setLocalMessages((prev) => [...prev, optimisticMessage]);

    const filesToSend = [...stagedFiles];
    setInput('');
    setStagedFiles([]);
    setError(null);
    setSending(true);

    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });

    try {
      const { messageId } = await postCommitteeMessage(
        supabase,
        committee.id,
        trimmed,
        currentMemberId,
        {
          organizationId,
          files: filesToSend,
        },
      );

      optimisticSendRef.current.confirm(optimisticId, messageId);
      await onRefresh({ silent: true });
    } catch (sendError) {
      reportError('committees.messages.send', sendError, {
        entityType: 'committee',
        entityId: committee.id,
      });
      optimisticSendRef.current.fail(optimisticId);
      setLocalMessages((prev) => prev.filter((message) => message.id !== optimisticId));
      setError(sendError instanceof Error ? sendError.message : 'Failed to send message.');
      setInput(trimmed);
      setStagedFiles(filesToSend);
    } finally {
      setSending(false);
    }
  }, [
    committee.id,
    currentMemberId,
    input,
    localMessages,
    onRefresh,
    organizationId,
    ownSenderFallback,
    readOnly,
    reportError,
    sending,
    stagedFiles,
    supabase,
  ]);

  const hasMessages = localMessages.length > 0;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.white }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
      {error ? (
        <View style={styles.errorWrap}>
          <StoryErrorBanner message={error} />
        </View>
      ) : null}

      <View style={styles.messagesArea}>
        {hasMessages ? (
          <FlatList
            ref={listRef}
            data={renderItems}
            keyExtractor={(item) =>
              item.type === 'day' ? item.dayKey : item.message.id
            }
            contentContainerStyle={styles.listContent}
            style={styles.messagesList}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item }) => {
              if (item.type === 'day') {
                return (
                  <View style={styles.daySeparator}>
                    <Text style={[styles.dayLabel, { color: theme.muted }]}>{item.dayLabel}</Text>
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
            }}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyCopy, { color: theme.muted }]}>
              No messages yet. Start the conversation below.
            </Text>
          </View>
        )}
      </View>

      {!readOnly ? (
        <MessageComposeBar
          value={input}
          onChange={setInput}
          files={stagedFiles}
          onFilesChange={setStagedFiles}
          onSend={() => void handleSend()}
          sending={sending}
          variant="parent-story"
        />
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorWrap: {
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.two,
  },
  messagesArea: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  listContent: {
    paddingVertical: Spacing.three,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    textAlign: 'center',
  },
  daySeparator: {
    alignItems: 'center',
    marginVertical: Spacing.two,
  },
  dayLabel: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 12,
  },
});
