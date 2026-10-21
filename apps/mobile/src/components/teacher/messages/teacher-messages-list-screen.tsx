import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ParentMessagesEmptyState } from '@/components/parent/messages/parent-messages-empty-state';
import { ParentMessagesListSkeleton } from '@/components/parent/messages/parent-messages-list-skeleton';
import { ParentMessagesStoryHeader } from '@/components/parent/messages/parent-messages-story-header';
import { NewConversationSheet } from '@/components/school-admin/messages/new-conversation-sheet';
import { TeacherMessageThreadRow } from '@/components/teacher/messages/teacher-message-thread-row';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { useTeacherHome } from '@/contexts/teacher-home-context';
import { useTeacherMessagesInbox } from '@/contexts/teacher-messages-inbox-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { useMessagesRealtime } from '@/contexts/messages-realtime-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import {
  prefetchRecentTeacherMessageThreads,
  prefetchTeacherMessageThread,
} from '@/lib/messages/message-thread-cache';
import {
  isMudKitchenSupportPlaceholder,
  prepareMobileInboxThreads,
} from '@/lib/messages/platform-support';
import { contactKeyForThread } from '@/lib/messages/participants-from-contact';
import { teacherMessageThreadRoute, teacherNewMessageThreadRoute } from '@/lib/teacher/teacher-nav';
import type { MessageContact } from '@/lib/messages/types';
import { isTeacherFeatureEnabled } from '@/lib/teacher/teacher-features';

type TeacherMessagesListScreenProps = {
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
};

export function TeacherMessagesListScreen({
  organizationId,
  organizationSlug,
  schoolName,
}: TeacherMessagesListScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const { data: homeData } = useTeacherHome();
  const messagesEnabled = isTeacherFeatureEnabled(homeData?.features, 'messages');
  const {
    threads,
    contacts,
    staffMemberId,
    isLoading,
    isRefreshing,
    error,
    refresh,
  } = useTeacherMessagesInbox();

  const [searchQuery, setSearchQuery] = useState('');
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const pinScope = useMemo(
    () => (staffMemberId ? { mode: 'teacher' as const, staffMemberId } : null),
    [staffMemberId],
  );
  const filteredThreads = useMemo(
    () => prepareMobileInboxThreads(threads, pinScope, searchQuery),
    [pinScope, searchQuery, threads],
  );
  const displayError = actionError ?? error;
  const hasSearchQuery = searchQuery.trim().length > 0;

  const { registerInboxConsumer } = useMessagesRealtime();

  useFocusEffect(
    useCallback(() => {
      if (!messagesEnabled) return undefined;
      return registerInboxConsumer({
        activeThreadId: null,
        onInboxChange: () => {
          void refresh({ silent: true });
        },
        onThreadMessage: () => {
          // Inbox changes are handled via onInboxChange.
        },
      });
    }, [messagesEnabled, refresh, registerInboxConsumer]),
  );

  const handleRefresh = () => {
    void refresh({ silent: true });
  };

  const prefetchedThreadIdsRef = useRef<string>('');

  const prefetchThread = useCallback(
    (threadId: string) => {
      if (isMudKitchenSupportPlaceholder(threadId)) return;
      void prefetchTeacherMessageThread(organizationId, schoolName, threadId);
    },
    [organizationId, schoolName],
  );

  const openThread = (threadId: string) => {
    router.push(teacherMessageThreadRoute(organizationSlug, threadId));
  };

  useFocusEffect(
    useCallback(() => {
      if (!messagesEnabled || filteredThreads.length === 0) return;
      const prefetchable = filteredThreads.filter(
        (thread) => !isMudKitchenSupportPlaceholder(thread.id),
      );
      const threadIds = prefetchable.map((thread) => thread.id).join(',');
      if (prefetchedThreadIdsRef.current === threadIds) return;
      prefetchedThreadIdsRef.current = threadIds;
      prefetchRecentTeacherMessageThreads(
        organizationId,
        schoolName,
        prefetchable.map((thread) => thread.id),
      );
    }, [filteredThreads, messagesEnabled, organizationId, schoolName]),
  );

  const handleNewConversationSelect = (contact: MessageContact) => {
    setNewConversationOpen(false);
    setActionError(null);

    const existing = threads.find((thread) => {
      const key = contactKeyForThread(thread.participants, 'teacher', { staffMemberId });
      return key === contact.key;
    });

    if (existing) {
      openThread(existing.id);
      return;
    }

    router.push(teacherNewMessageThreadRoute(organizationSlug, contact.key));
  };

  if (!messagesEnabled) {
    return (
      <View style={[styles.container, { backgroundColor: theme.paper }]}>
        <View style={[styles.disabledState, { backgroundColor: theme.white }]}>
          <Text style={[styles.disabledTitle, { color: theme.ink }]}>Messages unavailable</Text>
          <Text style={[styles.disabledDescription, { color: theme.muted }]}>
            Messaging is not enabled for your teacher account at this school.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.paper }]}>
      <View style={[styles.inboxSurface, { backgroundColor: theme.white }]}>
        <Animated.View entering={FadeInDown.duration(280)}>
          <ParentMessagesStoryHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onNewMessage={() => setNewConversationOpen(true)}
          />
        </Animated.View>

        {displayError ? (
          <View style={styles.errorWrap}>
            <StoryErrorBanner message={displayError} />
          </View>
        ) : null}

        {isLoading && filteredThreads.length === 0 && threads.length === 0 ? (
          <ParentMessagesListSkeleton />
        ) : (
          <FlatList
            data={filteredThreads}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TeacherMessageThreadRow
                thread={item}
                organizationSlug={organizationSlug}
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
        onSelect={handleNewConversationSelect}
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
  disabledState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    gap: Spacing.two,
  },
  disabledTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledDescription: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 280,
  },
});
