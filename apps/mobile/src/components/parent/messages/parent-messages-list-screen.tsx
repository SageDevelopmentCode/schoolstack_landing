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

import { ParentMessagesListSkeleton } from '@/components/parent/messages/parent-messages-list-skeleton';
import {
  PARENT_MESSAGE_ROW_SEPARATOR_INSET,
  ParentMessageThreadRow,
} from '@/components/parent/messages/parent-message-thread-row';
import { NewConversationSheet } from '@/components/school-admin/messages/new-conversation-sheet';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { useParentMessagesInbox } from '@/contexts/parent-messages-inbox-context';
import { Radius, Spacing } from '@/constants/theme';
import { createParentMessageThread } from '@/lib/messages/parent-api';
import { contactKeyForThread } from '@/lib/messages/participants-from-contact';
import { useMessagesRealtime } from '@/contexts/messages-realtime-context';
import type { MessageContact } from '@/lib/messages/types';

type ParentMessagesListScreenProps = {
  organizationId: string;
  organizationSlug: string;
};

function sortThreadsByRecency<T extends { lastMessageAt: string | null }>(threads: T[]): T[] {
  return [...threads].sort((a, b) => {
    const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return bTime - aTime;
  });
}

export function ParentMessagesListScreen({
  organizationId,
  organizationSlug,
}: ParentMessagesListScreenProps) {
  const theme = useAdminTheme();
  const router = useRouter();
  const {
    threads,
    contacts,
    guardianId,
    isLoading,
    isRefreshing,
    error,
    refresh,
  } = useParentMessagesInbox();

  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [startingConversation, setStartingConversation] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const sortedThreads = useMemo(() => sortThreadsByRecency(threads), [threads]);
  const displayError = actionError ?? error;

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

  const openThread = (threadId: string) => {
    router.push(`/parent/${organizationSlug}/messages/${threadId}`);
  };

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
      setActionError(
        selectError instanceof Error ? selectError.message : 'Failed to start conversation.',
      );
    } finally {
      setStartingConversation(false);
    }
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

      {displayError ? (
        <View style={styles.errorWrap}>
          <ThemedText type="small" style={{ color: theme.error }}>
            {displayError}
          </ThemedText>
        </View>
      ) : null}

      {isLoading && threads.length === 0 ? (
        <ParentMessagesListSkeleton />
      ) : (
        <FlatList
          data={sortedThreads}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ParentMessageThreadRow thread={item} onPress={() => openThread(item.id)} />
          )}
          ItemSeparatorComponent={() => (
            <View
              style={[
                styles.separator,
                {
                  backgroundColor: theme.border,
                  marginLeft: PARENT_MESSAGE_ROW_SEPARATOR_INSET,
                },
              ]}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.accent}
            />
          }
          ListEmptyComponent={
            displayError ? null : (
              <View style={styles.emptyState}>
                <ThemedText type="default" style={{ color: theme.textSecondary, textAlign: 'center' }}>
                  No conversations yet. Tap New to message your school office or your child's teachers.
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
    paddingHorizontal: Spacing.four,
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
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
  },
  listContent: {
    paddingBottom: Spacing.six,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  emptyState: {
    paddingTop: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
});
