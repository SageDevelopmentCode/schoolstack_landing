import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View, type TextInput } from 'react-native';

import { MessageThreadKeyboardLayout } from '@/components/messages/message-thread-keyboard-layout';
import { GardenMessageBubble } from '@/components/parent/messages/garden/garden-message-bubble';
import { GardenMessageComposer } from '@/components/parent/messages/garden/garden-message-composer';
import { useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { useGardenToast } from '@/components/parent/garden/toast';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GHand, gText } from '@/components/parent/garden/ui';
import { postCommitteeMessageViaPortalApi } from '@/lib/committees/post-committee-message-via-portal';
import { buildMessageRenderItems, type RenderMessageItem } from '@/lib/messages/format-chat';
import { buildOptimisticPortalMessage, resolveOwnMessageSenderIdentity } from '@/lib/messages/optimistic-message';
import { createOptimisticSendTracker, reconcileThreadMessages } from '@/lib/messages/reconcile-thread-messages';
import type { PortalMessage, StagedMessageFile } from '@/lib/messages/types';
import { mapCommitteeMessagesToPortalMessages } from '@/lib/parent/committees/committee-message-mapper';
import type { ParentCommitteeSectionProps } from '@/lib/parent/committees/section-props';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

/** Committee chat in Garden. Same optimistic send / reconcile / rollback as before. */
export function WorkspaceMessagesSection({
  committee,
  organizationId,
  currentMemberId,
  readOnly = false,
  isAdmin = false,
  portalApiNamespace = 'parent-portal',
  onRefresh,
}: ParentCommitteeSectionProps) {
  const toast = useGardenToast();
  const gate = useGardenReadOnlyGate();
  const { reportError } = useMobileErrorReporter(organizationId);
  const listRef = useRef<FlatList<RenderMessageItem>>(null);
  const inputRef = useRef<TextInput | null>(null);
  const tracker = useRef(createOptimisticSendTracker());
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<StagedMessageFile[]>([]);
  const [sending, setSending] = useState(false);
  const [lastSentId, setLastSentId] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<PortalMessage[]>([]);

  const currentMember = committee.members.find((member) => member.id === currentMemberId);
  const ownFallback = useMemo(
    () => ({
      senderUserId: currentMemberId ?? (isAdmin ? 'school-admin' : 'self'),
      senderName: isAdmin ? 'School Admin' : (currentMember?.name ?? 'You'),
      profilePhotoUrl: null,
    }),
    [currentMember?.name, currentMemberId, isAdmin],
  );

  const serverMessages = useMemo(
    () => mapCommitteeMessagesToPortalMessages(committee, currentMemberId),
    [committee, currentMemberId],
  );

  useEffect(() => {
    setLocalMessages((prev) => reconcileThreadMessages(serverMessages, prev, tracker.current.getReconcileOptions()));
  }, [serverMessages]);

  const renderItems = useMemo(() => buildMessageRenderItems(localMessages), [localMessages]);

  useEffect(() => {
    if (renderItems.length === 0) return;
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: false }));
  }, [renderItems.length]);

  const handleSend = useCallback(async () => {
    if (readOnly) {
      if (gate.readOnly) gate.notifyReadOnly();
      return;
    }
    if (sending) return;
    const trimmed = input.trim();
    if (!trimmed && files.length === 0) return;

    const optimistic = buildOptimisticPortalMessage({
      threadId: committee.id,
      body: trimmed,
      files,
      senderKind: 'guardian',
      senderIdentity: resolveOwnMessageSenderIdentity(localMessages, ownFallback),
    });
    tracker.current.addPending(optimistic.id);
    setLocalMessages((prev) => [...prev, optimistic]);
    const filesToSend = [...files];
    setInput('');
    setFiles([]);
    setSending(true);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));

    try {
      const { messageId } = await postCommitteeMessageViaPortalApi(committee.id, {
        organizationId,
        body: trimmed,
        files: filesToSend,
        portalApiNamespace,
        isAdmin,
      });
      tracker.current.confirm(optimistic.id, messageId);
      setLastSentId(messageId);
      await onRefresh({ silent: true });
    } catch (sendError) {
      reportError('committees.messages.send', sendError, { entityType: 'committee', entityId: committee.id });
      tracker.current.fail(optimistic.id);
      setLocalMessages((prev) => prev.filter((message) => message.id !== optimistic.id));
      setInput(trimmed);
      setFiles(filesToSend);
      toast.error("Message didn't send", {
        id: 'committee-message-send',
        description: 'Your message is back in the box. Check your connection, then try again.',
        action: { label: 'Try again', onPress: () => inputRef.current?.focus() },
      });
    } finally {
      setSending(false);
    }
  }, [committee.id, files, gate, input, isAdmin, localMessages, onRefresh, organizationId, ownFallback, portalApiNamespace, readOnly, reportError, sending, toast]);

  return (
    <MessageThreadKeyboardLayout
      backgroundColor={Garden.cream}
      onKeyboardShow={() => listRef.current?.scrollToEnd({ animated: true })}>
      <View style={styles.area}>
        {localMessages.length > 0 ? (
          <FlatList
            ref={listRef}
            testID="committee-messages-panel"
            data={renderItems}
            keyExtractor={(item) => (item.type === 'day' ? item.dayKey : item.message.id)}
            contentContainerStyle={styles.list}
            style={styles.flex}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item }) =>
              item.type === 'day' ? (
                <View style={styles.day}>
                  <Text style={styles.dayText}>{item.dayLabel}</Text>
                </View>
              ) : (
                <GardenMessageBubble
                  message={item.message}
                  isGroupedWithPrevious={item.isGroupedWithPrevious}
                  showSent={item.message.id === lastSentId}
                />
              )
            }
          />
        ) : (
          <View style={styles.empty}>
            <Text style={[gText.body, styles.center]}>No messages yet. Start the conversation below.</Text>
            <GHand>Say hello to the committee.</GHand>
          </View>
        )}
      </View>
      {currentMemberId ? (
        <GardenMessageComposer
          value={input}
          onChange={setInput}
          files={files}
          onFilesChange={setFiles}
          onSend={() => void handleSend()}
          sending={sending}
          editMode={false}
          onCancelEdit={() => undefined}
          inputRef={inputRef}
          onReadOnlyPress={gate.notifyReadOnly}
        />
      ) : null}
    </MessageThreadKeyboardLayout>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1 },
  flex: { flex: 1 },
  list: { paddingHorizontal: 14, paddingVertical: 12, gap: 4 },
  day: { alignItems: 'center', paddingVertical: 10 },
  dayText: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: Garden.soft,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 },
  center: { textAlign: 'center' },
});
