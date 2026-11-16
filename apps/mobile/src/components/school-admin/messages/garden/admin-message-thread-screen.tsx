import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SHEET_DISMISS_MS, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { GInlineBanner } from '@/components/parent/garden/fields';
import { useGardenToast } from '@/components/parent/garden/toast';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GErrorCard, GHand, GLink, GSkeleton } from '@/components/parent/garden/ui';
import { MessageThreadKeyboardLayout } from '@/components/messages/message-thread-keyboard-layout';
import { GardenMessageBubble } from '@/components/parent/messages/garden/garden-message-bubble';
import { GardenMessageComposer } from '@/components/parent/messages/garden/garden-message-composer';
import { GardenMessageMutationSheets } from '@/components/parent/messages/garden/garden-message-mutation-sheets';
import { GardenThreadHeader } from '@/components/parent/messages/garden/garden-thread-header';
import {
  useAdminMessageThreadController,
  type AdminThreadFeedbackEvent,
} from '@/components/school-admin/messages/garden/use-admin-message-thread-controller';
import { haptic } from '@/lib/haptics';
import type { RenderMessageItem } from '@/lib/messages/format-chat';
import { portalMessageSupportsTextMutation } from '@/lib/messages/message-mutation-eligibility';

type AdminMessageThreadScreenProps = {
  threadId: string;
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
};

function ThreadSkeleton() {
  return (
    <View accessibilityLabel="Loading messages" style={styles.root}>
      <View style={styles.skHeader}>
        <GSkeleton style={styles.skBack} />
        <GSkeleton style={styles.skAvatar} />
        <View style={styles.skTitleCol}>
          <GSkeleton style={styles.skTitle} />
          <GSkeleton style={styles.skSubtitle} />
        </View>
      </View>
      <View style={styles.skBody}>
        <GSkeleton style={[styles.skBubble, { width: '62%' }]} />
        <GSkeleton style={[styles.skBubble, styles.skOwn, { width: '48%' }]} />
        <GSkeleton style={[styles.skBubble, { width: '70%', height: 74 }]} />
        <GSkeleton style={[styles.skBubble, styles.skOwn, { width: '55%' }]} />
      </View>
      <View style={styles.skComposer}>
        <GSkeleton style={styles.skInput} />
      </View>
    </View>
  );
}

/**
 * One school admin conversation (Garden): header with details, day pills,
 * bubbles with "Sent ✓", compose gating banner, the composer, and edit / delete
 * sheets. Data and behaviour: `useAdminMessageThreadController`.
 */
export function AdminMessageThreadScreen(props: AdminMessageThreadScreenProps) {
  const router = useRouter();
  const toast = useGardenToast();
  const { notifyReadOnly } = useGardenReadOnlyGate();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteTargetSeen, setDeleteTargetSeen] = useState<string | null>(null);

  // The toast's Retry calls the latest `handleSend` (set after each render).
  const sendRetry = useRef<(() => void) | null>(null);

  const onFeedback = useCallback(
    (event: AdminThreadFeedbackEvent) => {
      switch (event.type) {
        case 'send_failed':
          haptic.error();
          toast.error('Message not sent', {
            id: 'admin-message-send-error',
            description: `${event.message} Your message is back in the box below.`,
            action: { label: 'Retry', onPress: () => sendRetry.current?.() },
          });
          return;
        case 'edited':
          haptic.success();
          toast.dismiss('admin-message-edit-error');
          toast.success('Message updated', { id: 'admin-message-edited' });
          return;
        case 'deleted':
          haptic.success();
          setTimeout(() => toast.success('Message deleted', { id: 'admin-message-deleted' }), SHEET_DISMISS_MS);
          return;
        case 'mutation_failed':
          haptic.error();
          if (event.operation === 'delete') {
            // The confirm sheet is still open (toasts render behind it): show it there.
            setDeleteError(event.message);
            return;
          }
          toast.error("Couldn't save your edit", {
            id: 'admin-message-edit-error',
            description: `${event.message} The original message is unchanged.`,
          });
      }
    },
    [sendRetry, toast],
  );

  const controller = useAdminMessageThreadController({ ...props, onFeedback });
  const { thread, mutations, renderItems, lastSentId, listRef, composeState } = controller;
  const { handleSend } = controller;
  useEffect(() => {
    sendRetry.current = () => void handleSend();
  }, [handleSend]);

  // Clear a stale delete error when a different message is picked (previous-value pattern).
  const currentDeleteId = mutations.deleteTarget?.id ?? null;
  if (currentDeleteId !== deleteTargetSeen) {
    setDeleteTargetSeen(currentDeleteId);
    setDeleteError(null);
  }

  if (controller.loading && !thread) return <ThreadSkeleton />;

  if (!thread) {
    return (
      <View style={[styles.root, styles.errorRoot]}>
        <StatusBar style="dark" />
        <GLink
          label="Messages"
          accessibilityLabel="Back to Messages"
          icon="chevron-back"
          reverse
          onPress={() => router.back()}
          style={styles.errorBack}
        />
        <GErrorCard
          title="We couldn’t open this conversation"
          message={
            controller.loadError
              ? `${controller.loadError} Check your connection, then try again.`
              : 'Conversation not found.'
          }
          onRetry={controller.retryLoad}
        />
      </View>
    );
  }

  const lastOwnConfirmedId = [...thread.messages]
    .reverse()
    .find((message) => message.isOwn && !message.pending && !message.deletedAt)?.id;

  const renderItem = ({ item }: { item: RenderMessageItem }) => {
    if (item.type === 'day') {
      return (
        <View style={styles.day} accessibilityRole="header">
          <Text style={styles.dayText}>{item.dayLabel}</Text>
        </View>
      );
    }
    const message = item.message;
    const canMutate = !controller.readOnly && portalMessageSupportsTextMutation(message);
    return (
      <GardenMessageBubble
        message={message}
        isGroupedWithPrevious={item.isGroupedWithPrevious}
        showSent={lastSentId !== null && message.id === lastOwnConfirmedId}
        onLongPress={canMutate ? () => mutations.handleMessageLongPress(message) : undefined}
      />
    );
  };

  return (
    <MessageThreadKeyboardLayout backgroundColor={Garden.cream} onKeyboardShow={controller.scrollMessagesToEnd}>
      <StatusBar style="dark" />
      <GardenThreadHeader thread={thread} />

      {composeState.banner ? (
        <View style={styles.banner}>
          <GInlineBanner
            tone={composeState.banner.variant === 'warning' ? 'warning' : 'info'}
            title={composeState.banner.variant === 'warning' ? 'Replies are off here' : 'For your review'}
            description={composeState.banner.message}
          />
        </View>
      ) : null}

      <View style={styles.messages}>
        {thread.messages.length > 0 ? (
          <FlatList
            ref={listRef}
            data={renderItems}
            keyExtractor={(item) => (item.type === 'day' ? item.dayKey : item.message.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.messagesContent}
            style={styles.messagesList}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            onContentSizeChange={() => {
              listRef.current?.scrollToEnd({ animated: false });
            }}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.emptyContent} keyboardShouldPersistTaps="handled">
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Ionicons name="chatbubble-ellipses-outline" size={24} color={Garden.forest} />
              </View>
              <GHand>Say hello!</GHand>
              <Text style={styles.emptyTitle}>Say hello to {thread.title}</Text>
              <Text style={styles.emptyBody}>Send a message to start the conversation.</Text>
            </View>
          </ScrollView>
        )}
      </View>

      <GardenMessageComposer
        value={controller.input}
        onChange={controller.setInput}
        files={controller.stagedFiles}
        onFilesChange={controller.setStagedFiles}
        onSend={() => {
          void controller.handleSend();
        }}
        sending={controller.sending || mutations.savingEdit}
        disabled={composeState.disabled}
        editMode={mutations.editingMessage !== null}
        onCancelEdit={controller.cancelEdit}
        inputRef={controller.composeInputRef}
        onReadOnlyPress={notifyReadOnly}
      />

      <GardenMessageMutationSheets
        actionTarget={mutations.actionTarget}
        closeActionSheet={mutations.closeActionSheet}
        handleActionEdit={mutations.handleActionEdit}
        handleActionDelete={mutations.handleActionDelete}
        deleteTarget={mutations.deleteTarget}
        closeDeleteConfirm={mutations.closeDeleteConfirm}
        confirmDelete={mutations.confirmDelete}
        deleting={mutations.deleting}
        deleteError={deleteError}
      />
    </MessageThreadKeyboardLayout>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  errorRoot: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  errorBack: { minHeight: 44, alignSelf: 'flex-start' },
  banner: { paddingHorizontal: 16, paddingTop: 8 },
  messages: { flex: 1 },
  messagesList: { flex: 1 },
  messagesContent: { paddingTop: 6, paddingBottom: 16 },
  day: {
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 2,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Garden.white,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
  },
  dayText: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: Garden.soft,
  },
  emptyContent: { padding: 16, gap: 14 },
  emptyCard: {
    alignItems: 'center',
    gap: 6,
    borderRadius: 22,
    backgroundColor: Garden.mint,
    padding: 22,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Garden.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontFamily: GardenFonts.bodyExtra, fontSize: 17, color: Garden.ink, textAlign: 'center' },
  emptyBody: { fontFamily: GardenFonts.bodySemi, fontSize: 14, lineHeight: 20, color: Garden.soft, textAlign: 'center' },
  skHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  skBack: { width: 32, height: 32, borderRadius: 16 },
  skAvatar: { width: 40, height: 40, borderRadius: 20 },
  skTitleCol: { flex: 1, gap: 6 },
  skTitle: { width: '55%', height: 14, borderRadius: 7 },
  skSubtitle: { width: '35%', height: 11, borderRadius: 6 },
  skBody: { flex: 1, padding: 16, gap: 12 },
  skBubble: { height: 46, borderRadius: 18 },
  skOwn: { alignSelf: 'flex-end' },
  skComposer: { padding: 12 },
  skInput: { height: 48, borderRadius: 24 },
});
