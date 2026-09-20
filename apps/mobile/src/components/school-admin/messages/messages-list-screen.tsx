import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AdminMessageThreadRow } from '@/components/school-admin/messages/admin-message-thread-row';
import { AdminMessagesEmptyState } from '@/components/school-admin/messages/admin-messages-empty-state';
import { AdminMessagesSectionHeader } from '@/components/school-admin/messages/admin-messages-section-header';
import { AdminMessagesStoryHeader } from '@/components/school-admin/messages/admin-messages-story-header';
import { MessagesListSkeleton } from '@/components/school-admin/messages/messages-list-skeleton';
import { NewConversationSheet } from '@/components/school-admin/messages/new-conversation-sheet';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { useSchoolAdminMessagesInbox, prefetchSchoolAdminMessagesContacts } from '@/contexts/school-admin-messages-inbox-context';
import { useMessagesUnread } from '@/contexts/messages-unread-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { buildAdminSectionedListItems } from '@/lib/messages/admin-thread-sections';
import {
  prefetchRecentSchoolAdminMessageThreads,
  prefetchSchoolAdminMessageThread,
} from '@/lib/messages/message-thread-cache';
import { createMessageThread } from '@/lib/messages/api';
import { contactKeyForThread } from '@/lib/messages/participants-from-contact';
import { useMessagesRealtime } from '@/contexts/messages-realtime-context';
import type { AdminConversationListItem } from '@/lib/messages/admin-thread-sections';
import type { MessageContact, MessageThreadSummary } from '@/lib/messages/types';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type MessagesListScreenProps = {
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
};

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

export function MessagesListScreen({
  organizationId,
  organizationSlug,
  schoolName,
}: MessagesListScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const { refreshUnreadCount } = useMessagesUnread();
  const { reportError } = useMobileErrorReporter(organizationId);
  const {
    threads,
    contacts,
    isLoading,
    isRefreshing,
    loadingContacts,
    error,
    refresh,
    ensureContactsLoaded,
  } = useSchoolAdminMessagesInbox();

  const [searchQuery, setSearchQuery] = useState('');
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [startingConversation, setStartingConversation] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredThreads = useMemo(
    () => filterThreadsBySearch(threads, searchQuery),
    [searchQuery, threads],
  );
  const listItems = useMemo(
    () => buildAdminSectionedListItems(filteredThreads),
    [filteredThreads],
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
          void refreshUnreadCount();
        },
        onThreadMessage: () => {
          // Inbox changes are handled via onInboxChange.
        },
      });
    }, [refresh, refreshUnreadCount, registerInboxConsumer]),
  );

  const handleRefresh = () => {
    void refresh({ silent: true });
    void refreshUnreadCount();
  };

  const prefetchedThreadIdsRef = useRef<string>('');

  const prefetchThread = useCallback(
    (threadId: string) => {
      void prefetchSchoolAdminMessageThread(organizationId, schoolName, threadId);
    },
    [organizationId, schoolName],
  );

  const openThread = (threadId: string) => {
    router.push(`/school-admin/${organizationSlug}/messages/${threadId}`);
  };

  useFocusEffect(
    useCallback(() => {
      void prefetchSchoolAdminMessagesContacts(organizationId, schoolName);
    }, [organizationId, schoolName]),
  );

  useFocusEffect(
    useCallback(() => {
      if (threads.length === 0) return;
      const sortedThreadIds = [...threads]
        .sort((a, b) => {
          const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return bTime - aTime;
        })
        .map((thread) => thread.id);
      const threadIds = sortedThreadIds.join(',');
      if (prefetchedThreadIdsRef.current === threadIds) return;
      prefetchedThreadIdsRef.current = threadIds;
      prefetchRecentSchoolAdminMessageThreads(organizationId, schoolName, sortedThreadIds);
    }, [organizationId, schoolName, threads]),
  );

  const handleNewMessage = () => {
    setNewConversationOpen(true);
    void ensureContactsLoaded();
  };

  const handleNewConversationSelect = async (contact: MessageContact) => {
    if (startingConversation) return;
    setStartingConversation(true);
    setNewConversationOpen(false);
    setActionError(null);

    try {
      const existing = threads.find((thread) => {
        const key = contactKeyForThread(thread.participants, 'admin', {});
        return key === contact.key;
      });

      if (existing) {
        openThread(existing.id);
        return;
      }

      const threadId = await createMessageThread(organizationId, contact);
      await refresh({ silent: true });
      await refreshUnreadCount();
      openThread(threadId);
    } catch (selectError) {
      reportError('school_admin_message_thread_create', selectError, {
        entityType: 'message_contact',
        entityId: contact.key,
      });
      setActionError(
        selectError instanceof Error ? selectError.message : 'Failed to start conversation.',
      );
    } finally {
      setStartingConversation(false);
    }
  };

  const renderItem = ({ item }: { item: AdminConversationListItem }) => {
    if (item.type === 'section') {
      return <AdminMessagesSectionHeader label={item.label} description={item.description} />;
    }

    return (
      <AdminMessageThreadRow
        thread={item.thread}
        onPress={() => openThread(item.thread.id)}
        onPressIn={() => prefetchThread(item.thread.id)}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.paper }]}>
      <View style={[styles.inboxSurface, { backgroundColor: theme.white }]}>
        <Animated.View entering={FadeInDown.duration(280)}>
          <AdminMessagesStoryHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onNewMessage={handleNewMessage}
            newMessageDisabled={startingConversation}
          />
        </Animated.View>

        {displayError ? (
          <View style={styles.errorWrap}>
            <StoryErrorBanner message={displayError} />
          </View>
        ) : null}

        {isLoading && threads.length === 0 ? (
          <MessagesListSkeleton />
        ) : (
          <FlatList
            data={listItems}
            keyExtractor={(item) => (item.type === 'section' ? item.key : item.thread.id)}
            renderItem={renderItem}
            style={styles.list}
            contentContainerStyle={[
              styles.listContent,
              listItems.length === 0 ? styles.listContentEmpty : null,
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
                <AdminMessagesEmptyState hasSearchQuery={hasSearchQuery} />
              )
            }
          />
        )}
      </View>

      <NewConversationSheet
        visible={newConversationOpen}
        contacts={contacts}
        loadingContacts={loadingContacts}
        variant="admin-story"
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
