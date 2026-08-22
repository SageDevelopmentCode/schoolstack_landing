import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { AdminListCard } from '@/components/school-admin/admin-list-card';
import { ADMIN_LIST_HORIZONTAL_PADDING } from '@/components/school-admin/admin-list-layout';
import { MessageThreadRow } from '@/components/school-admin/messages/message-thread-row';
import { MessagesListSkeleton } from '@/components/school-admin/messages/messages-list-skeleton';
import { NewConversationSheet } from '@/components/school-admin/messages/new-conversation-sheet';
import { ThemedText } from '@/components/themed-text';
import { useMessagesUnread } from '@/contexts/messages-unread-context';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import { buildAdminSectionedListItems } from '@/lib/messages/admin-thread-sections';
import { loadMessagesInbox, createMessageThread } from '@/lib/messages/api';
import { contactKeyForThread } from '@/lib/messages/participants-from-contact';
import { useMessagesRealtime } from '@/contexts/messages-realtime-context';
import type { AdminConversationListItem } from '@/lib/messages/admin-thread-sections';
import type { MessageContact, MessageThreadSummary, MessagesInboxData } from '@/lib/messages/types';

type MessagesListScreenProps = {
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
};

export function MessagesListScreen({
  organizationId,
  organizationSlug,
  schoolName,
}: MessagesListScreenProps) {
  const theme = useAdminTheme();
  const router = useRouter();
  const { refreshUnreadCount } = useMessagesUnread();

  const [threads, setThreads] = useState<MessageThreadSummary[]>([]);
  const [contacts, setContacts] = useState<MessagesInboxData['contacts']>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [startingConversation, setStartingConversation] = useState(false);

  const listItems = useMemo(() => buildAdminSectionedListItems(threads), [threads]);

  const loadInbox = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setLoading(true);
      }
      setError(null);
      try {
        const inbox = await loadMessagesInbox(organizationId, schoolName);
        setThreads(inbox.threads);
        setContacts(inbox.contacts);
        await refreshUnreadCount();
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load messages.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [organizationId, refreshUnreadCount, schoolName],
  );

  useFocusEffect(
    useCallback(() => {
      void loadInbox({ silent: threads.length > 0 });
      void refreshUnreadCount();
    }, [loadInbox, refreshUnreadCount, threads.length]),
  );

  const { registerInboxConsumer } = useMessagesRealtime();

  useFocusEffect(
    useCallback(() => {
      return registerInboxConsumer({
        activeThreadId: null,
        onInboxChange: () => {
          void loadInbox({ silent: true });
          void refreshUnreadCount();
        },
        onThreadMessage: () => {
          // Inbox changes are handled via onInboxChange.
        },
      });
    }, [loadInbox, refreshUnreadCount, registerInboxConsumer]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    void loadInbox({ silent: true });
  };

  const openThread = (threadId: string) => {
    router.push(`/school-admin/${organizationSlug}/messages/${threadId}`);
  };

  const handleNewConversationSelect = async (contact: MessageContact) => {
    if (startingConversation) return;
    setStartingConversation(true);
    setNewConversationOpen(false);

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
      await loadInbox({ silent: true });
      openThread(threadId);
    } catch (selectError) {
      setError(selectError instanceof Error ? selectError.message : 'Failed to start conversation.');
    } finally {
      setStartingConversation(false);
    }
  };

  const renderItem = ({ item }: { item: AdminConversationListItem }) => {
    if (item.type === 'section') {
      return (
        <View>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionLine, { backgroundColor: theme.border }]} />
            <ThemedText type="small" style={{ color: theme.textTertiary }}>
              {item.label}
            </ThemedText>
            <View style={[styles.sectionLine, { backgroundColor: theme.border }]} />
          </View>
          {item.description ? (
            <ThemedText
              type="small"
              style={[styles.sectionDescription, { color: theme.textTertiary }]}>
              {item.description}
            </ThemedText>
          ) : null}
        </View>
      );
    }

    return (
      <AdminListCard>
        <MessageThreadRow thread={item.thread} onPress={() => openThread(item.thread.id)} />
      </AdminListCard>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <ThemedText type="title" style={{ color: theme.textPrimary }}>
          Messages
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="New message"
          disabled={startingConversation}
          onPress={() => setNewConversationOpen(true)}
          style={({ pressed }) => [
            styles.newButton,
            {
              backgroundColor: theme.accent,
              opacity: pressed || startingConversation ? 0.85 : 1,
            },
          ]}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <ThemedText type="smallBold" style={{ color: '#FFFFFF' }}>
            New
          </ThemedText>
        </Pressable>
      </View>

      {error ? (
        <View style={styles.errorWrap}>
          <ThemedText type="small" style={{ color: theme.error }}>
            {error}
          </ThemedText>
        </View>
      ) : null}

      {loading && threads.length === 0 ? (
        <MessagesListSkeleton />
      ) : (
        <FlatList
          data={listItems}
          keyExtractor={(item) => (item.type === 'section' ? item.key : item.thread.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.accent} />
          }
          ListEmptyComponent={
            error ? null : (
              <View style={styles.emptyState}>
                <ThemedText type="default" style={{ color: theme.textSecondary, textAlign: 'center' }}>
                  No conversations yet. Tap New to start messaging families and staff.
                </ThemedText>
              </View>
            )
          }
        />
      )}

      <NewConversationSheet
        visible={newConversationOpen}
        contacts={contacts}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ADMIN_LIST_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
  },
  errorWrap: {
    paddingHorizontal: ADMIN_LIST_HORIZONTAL_PADDING,
    paddingBottom: Spacing.two,
  },
  listContent: {
    paddingHorizontal: ADMIN_LIST_HORIZONTAL_PADDING,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
  },
  sectionLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  sectionDescription: {
    textAlign: 'center',
    lineHeight: 18,
    paddingBottom: Spacing.one,
  },
  emptyState: {
    paddingTop: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
});
