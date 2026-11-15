import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GErrorCard, GHand, GLink, GSkeleton } from '@/components/parent/garden/ui';
import { MessageThreadKeyboardLayout } from '@/components/messages/message-thread-keyboard-layout';
import { MessagesStepsList } from '@/components/parent/messages/garden/garden-messages-help';
import { GardenMessageBubble } from '@/components/parent/messages/garden/garden-message-bubble';
import { GardenMessageComposer } from '@/components/parent/messages/garden/garden-message-composer';
import { GardenMessageMutationSheets } from '@/components/parent/messages/garden/garden-message-mutation-sheets';
import { GardenThreadHeader } from '@/components/parent/messages/garden/garden-thread-header';
import {
  SHEET_DISMISS_MS,
  useParentMessagesNotify,
} from '@/components/parent/messages/garden/use-parent-messages-feedback';
import {
  useParentMessageThreadController,
  type ParentMessageThreadControllerParams,
} from '@/components/parent/messages/garden/use-parent-message-thread-controller';
import type { RenderMessageItem } from '@/lib/messages/format-chat';
import { portalMessageSupportsTextMutation } from '@/lib/messages/message-mutation-eligibility';
import type { ParentMessagesFeedbackEvent } from '@/lib/messages/parent-messages-feedback';
import { MUDKITCHEN_SUPPORT_EMPTY_COPY } from '@/lib/messages/platform-support';

function ThreadSkeleton() {
  return (
    <View accessibilityLabel="Loading messages" style={styles.root}>
      <View style={styles.skeletonHeader}>
        <GSkeleton style={styles.skeletonBack} />
        <GSkeleton style={styles.skeletonAvatar} />
        <View style={styles.skeletonTitleCol}>
          <GSkeleton style={styles.skeletonTitle} />
          <GSkeleton style={styles.skeletonSubtitle} />
        </View>
      </View>
      <View style={styles.skeletonBody}>
        <GSkeleton style={[styles.skeletonBubble, { width: '62%' }]} />
        <GSkeleton style={[styles.skeletonBubble, styles.skeletonOwn, { width: '48%' }]} />
        <GSkeleton style={[styles.skeletonBubble, { width: '70%', height: 74 }]} />
        <GSkeleton style={[styles.skeletonBubble, styles.skeletonOwn, { width: '55%' }]} />
      </View>
      <View style={styles.skeletonComposer}>
        <GSkeleton style={styles.skeletonInput} />
      </View>
    </View>
  );
}

/**
 * One parent conversation in Garden: header (+ details), day pills, bubbles with
 * "Sent ✓", a guided empty state, the composer, and edit / delete sheets.
 * Data + behaviour live in `useParentMessageThreadController`.
 */
export function ParentMessageThreadGardenScreen(
  props: Omit<ParentMessageThreadControllerParams, 'onFeedback'>,
) {
  const router = useRouter();
  const { notify, notifyReadOnly } = useParentMessagesNotify();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const onFeedback = useCallback(
    (event: ParentMessagesFeedbackEvent) => {
      if (event.type === 'delete_failed') {
        // The confirm sheet is still open (toasts render behind it): show it there.
        setDeleteError(event.message);
        return;
      }
      if (event.type === 'deleted') {
        setTimeout(() => notify(event), SHEET_DISMISS_MS);
        return;
      }
      notify(event);
    },
    [notify],
  );

  const controller = useParentMessageThreadController({ ...props, onFeedback });
  const { thread, mutations, renderItems, lastSentId, listRef } = controller;

  useEffect(() => {
    setDeleteError(null);
  }, [mutations.deleteTarget?.id]);

  if (controller.loading && !thread) {
    return <ThreadSkeleton />;
  }

  if (!thread) {
    return (
      <View style={[styles.root, styles.errorRoot]}>
        <StatusBar style="dark" />
        <GLink
          label="Back to Messages"
          icon="chevron-back"
          onPress={() => router.back()}
          style={styles.errorBack}
        />
        <GErrorCard
          kicker="Messages"
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
    const canMutate = portalMessageSupportsTextMutation(message);
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
    <MessageThreadKeyboardLayout
      backgroundColor={Garden.cream}
      onKeyboardShow={controller.scrollMessagesToEnd}>
      <StatusBar style="dark" />
      <GardenThreadHeader thread={thread} />

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
          <ScrollView
            contentContainerStyle={styles.emptyContent}
            keyboardShouldPersistTaps="handled">
            <View style={styles.emptyCard}>
              <GHand>Say hello!</GHand>
              <Text style={styles.emptyTitle}>Say hello to {thread.title}</Text>
              <Text style={styles.emptyBody}>
                {controller.isSupportPlaceholder
                  ? MUDKITCHEN_SUPPORT_EMPTY_COPY
                  : 'Send a message to start the conversation.'}
              </Text>
            </View>
            <MessagesStepsList activeStep={2} />
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
  root: {
    flex: 1,
    backgroundColor: Garden.cream,
  },
  errorRoot: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  errorBack: {
    minHeight: 44,
  },
  messages: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingTop: 6,
    paddingBottom: 16,
  },
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
  emptyContent: {
    padding: 16,
    gap: 14,
  },
  emptyCard: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 24,
    paddingHorizontal: 18,
    borderRadius: 24,
    backgroundColor: Garden.mint,
  },
  emptyTitle: {
    fontFamily: GardenFonts.display,
    fontSize: 21,
    lineHeight: 25,
    letterSpacing: -0.4,
    color: Garden.ink,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 21,
    color: Garden.soft,
    textAlign: 'center',
    maxWidth: 300,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  skeletonBack: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  skeletonTitleCol: {
    flex: 1,
    gap: 6,
  },
  skeletonTitle: {
    width: '55%',
    height: 16,
    borderRadius: 8,
  },
  skeletonSubtitle: {
    width: '35%',
    height: 12,
    borderRadius: 6,
  },
  skeletonBody: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 16,
    gap: 12,
  },
  skeletonBubble: {
    height: 52,
    borderRadius: 20,
  },
  skeletonOwn: {
    alignSelf: 'flex-end',
  },
  skeletonComposer: {
    padding: 12,
  },
  skeletonInput: {
    height: 52,
    borderRadius: 26,
  },
});
