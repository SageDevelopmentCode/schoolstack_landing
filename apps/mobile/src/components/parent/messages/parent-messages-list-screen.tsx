import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ParentMessagesEmptyState } from '@/components/parent/messages/parent-messages-empty-state';
import { ParentMessagesListSkeleton } from '@/components/parent/messages/parent-messages-list-skeleton';
import { ParentMessagesStoryHeader } from '@/components/parent/messages/parent-messages-story-header';
import { ParentMessageThreadRow } from '@/components/parent/messages/parent-message-thread-row';
import { NewConversationSheet } from '@/components/school-admin/messages/new-conversation-sheet';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { useParentMessagesInbox } from '@/contexts/parent-messages-inbox-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { useMessagesRealtime } from '@/contexts/messages-realtime-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import {
  prefetchParentMessageThread,
  prefetchRecentParentMessageThreads,
} from '@/lib/messages/message-thread-cache';
import { createParentMessageThread } from '@/lib/messages/parent-api';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';
import { contactKeyForThread } from '@/lib/messages/participants-from-contact';
import type { MessageContact, MessageThreadSummary } from '@/lib/messages/types';

type ParentMessagesListScreenProps = {
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
};

function sortThreadsByRecency<T extends { lastMessageAt: string | null }>(threads: T[]): T[] {
  return [...threads].sort((a, b) => {
    const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return bTime - aTime;
  });
}

function filterThreadsBySearch(threads: MessageThreadSummary[], query: string): MessageThreadSummary[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return threads;
  return threads.filter(
    (thread) =>
      thread.title.toLowerCase().includes(normalized) ||
      thread.subtitle?.toLowerCase().includes(normalized) ||
      thread.lastMessagePreview?.toLowerCase().includes(normalized),
  );
}

export function ParentMessagesListScreen({
  organizationId,
  organizationSlug,
  schoolName,
}: ParentMessagesListScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const { reportError } = useMobileErrorReporter(organizationId);
  const {
    threads,
    contacts,
    guardianId,
    isLoading,
    isRefreshing,
    error,
    refresh,
  } = useParentMessagesInbox();

  const [searchQuery, setSearchQuery] = useState('');
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [startingConversation, setStartingConversation] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const sortedThreads = useMemo(() => sortThreadsByRecency(threads), [threads]);
  const filteredThreads = useMemo(
    () => filterThreadsBySearch(sortedThreads, searchQuery),
    [searchQuery, sortedThreads],
  );
  const displayError = actionError ?? error;
  const hasSearchQuery = searchQuery.trim().length > 0;

  const { registerInboxConsumer } = useMessagesRealtime();

  useFocusEffect(
    useCallback(() => {
      return registerInboxConsumer({
        activeThreadId: null,
        onInboxChange: () => {
          void refresh({ silent: true });
        },
        onThreadMessage: () => {
          // Inbox changes are handled via onInboxChange.
        },
      });
    }, [refresh, registerInboxConsumer]),
  );

  const handleRefresh = () => {
    void refresh({ silent: true });
  };

  const prefetchedThreadIdsRef = useRef<string>('');

  const prefetchThread = useCallback(
    (threadId: string) => {
      void prefetchParentMessageThread(organizationId, schoolName, threadId);
    },
    [organizationId, schoolName],
  );

  const openThread = (threadId: string) => {
    router.push(`/parent/${organizationSlug}/messages/${threadId}`);
  };

  useFocusEffect(
    useCallback(() => {
      if (sortedThreads.length === 0) return;
      const threadIds = sortedThreads.map((thread) => thread.id).join(',');
      if (prefetchedThreadIdsRef.current === threadIds) return;
      prefetchedThreadIdsRef.current = threadIds;
      prefetchRecentParentMessageThreads(
        organizationId,
        schoolName,
        sortedThreads.map((thread) => thread.id),
      );
    }, [organizationId, schoolName, sortedThreads]),
  );

  const handleNewConversationSelect = async (contact: MessageContact) => {
    if (startingConversation) return;
    setStartingConversation(true);
    setNewConversationOpen(false);
    setActionError(null);

    try {
      const existing = threads.find((thread) => {
        const key = contactKeyForThread(thread.participants, 'parent', { guardianId });
        return key === contact.key;
      });

      if (existing) {
        openThread(existing.id);
        return;
      }

      const threadId = await createParentMessageThread(organizationId, contact);
      await refresh({ silent: true });
      openThread(threadId);
    } catch (selectError) {
      reportError('parent_message_thread_create', selectError);
      setActionError(
        selectError instanceof Error ? selectError.message : 'Failed to start conversation.',
      );
    } finally {
      setStartingConversation(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.paper }]}>
      <View style={[styles.inboxSurface, { backgroundColor: theme.white }]}>
        <Animated.View entering={FadeInDown.duration(280)}>
          <ParentMessagesStoryHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onNewMessage={() => setNewConversationOpen(true)}
            newMessageDisabled={startingConversation}
          />
        </Animated.View>

        {displayError ? (
          <View style={styles.errorWrap}>
            <StoryErrorBanner message={displayError} />
          </View>
        ) : null}

        {isLoading && threads.length === 0 ? (
          <ParentMessagesListSkeleton />
        ) : (
          <FlatList
            data={filteredThreads}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ParentMessageThreadRow
                thread={item}
                onPress={() => openThread(item.id)}
                onPressIn={() => prefetchThread(item.id)}
              />
            )}
            style={styles.list}
            contentContainerStyle={[
              styles.listContent,
              filteredThreads.length === 0 ? styles.listContentEmpty : null,
            ]}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={theme.primary}
              />
            }
            ListEmptyComponent={
              displayError ? null : (
                <ParentMessagesEmptyState hasSearchQuery={hasSearchQuery} />
              )
            }
          />
        )}
      </View>

      <NewConversationSheet
        visible={newConversationOpen}
        contacts={contacts}
        variant="parent-story"
        onClose={() => setNewConversationOpen(false)}
        onSelect={(contact) => {
          void handleNewConversationSelect(contact);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inboxSurface: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  errorWrap: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.two,
  },
  listContent: {
    paddingBottom: Spacing.six,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
});
