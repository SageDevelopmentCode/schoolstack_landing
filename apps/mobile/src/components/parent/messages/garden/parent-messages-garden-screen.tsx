import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { GCelebrate } from '@/components/parent/garden/celebrate';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import {
  GErrorCard,
  GHand,
  GBadge,
  GChip,
  GPressable,
  GLink,
  GNoteTile,
  GOutlineButton,
  GSkeleton,
  GToyButton,
} from '@/components/parent/garden/ui';
import { GardenInboxFilterSheet } from '@/components/parent/messages/garden/garden-inbox-filter-sheet';
import { GardenMessagesHelpSheet } from '@/components/parent/messages/garden/garden-messages-help';
import {
  GardenNewConversationSheet,
  type NewConversationNotice,
} from '@/components/parent/messages/garden/garden-new-conversation-sheet';
import { GardenThreadRow } from '@/components/parent/messages/garden/garden-thread-row';
import {
  closeThen,
  useInboxRefreshFeedback,
  useParentMessagesNotify,
} from '@/components/parent/messages/garden/use-parent-messages-feedback';
import type { ParentMessagesInboxController } from '@/components/parent/messages/garden/use-parent-messages-inbox-controller';
import { haptic } from '@/lib/haptics';
import type { ParentInboxTab } from '@/lib/messages/parent-inbox-filters';
import type { MessageContact, MessageThreadSummary } from '@/lib/messages/types';

function InboxSkeleton() {
  return (
    <View accessibilityLabel="Loading conversations" style={styles.skeleton}>
      {[0, 1, 2, 3, 4].map((i) => (
        <GSkeleton key={i} style={styles.skeletonRow} />
      ))}
    </View>
  );
}

/**
 * Parent Messages inbox in Garden: header with the one toy button (New message),
 * search, All / Unread, a latest-unread note, conversation cards, help, and the
 * Start-a-conversation sheet. All data + navigation come from the controller.
 */
export function ParentMessagesGardenScreen({ controller }: { controller: ParentMessagesInboxController }) {
  const accent = useGardenAccent();
  const { notify, readOnly } = useParentMessagesNotify();
  const { pullRefreshing, onPullRefresh } = useInboxRefreshFeedback(
    controller.refresh,
    controller.error,
  );

  const [newOpen, setNewOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [notice, setNotice] = useState<NewConversationNotice | null>(null);

  const {
    threads,
    searchedThreads,
    visibleThreads,
    unreadThreads,
    unreadCount,
    searchQuery,
    setSearchQuery,
    tab,
    setTab,
    error,
    isLoading,
  } = controller;
  const hasSearch = searchQuery.trim().length > 0;
  const latestUnread = !hasSearch && tab === 'all' ? (unreadThreads[0] ?? null) : null;
  const caughtUp = tab === 'unread' && unreadCount === 0 && !hasSearch && threads.length > 0;
  const showSkeleton = isLoading && threads.length === 0;
  const showLoadError = Boolean(error) && searchedThreads.length === 0 && !hasSearch && !isLoading;

  const openNew = useCallback(() => {
    setNotice(
      readOnly
        ? {
            tone: 'info',
            title: 'Read-only preview',
            message: 'You can open existing conversations. Starting new ones is off while previewing.',
          }
        : null,
    );
    setNewOpen(true);
  }, [readOnly]);

  const closeNew = useCallback(() => {
    setNewOpen(false);
    setNotice(null);
  }, []);

  const handleSelectContact = useCallback(
    async (contact: MessageContact) => {
      const existing = controller.findExistingThread(contact);
      if (readOnly && !existing) {
        haptic.warning();
        setNotice({
          tone: 'info',
          title: 'Read-only preview',
          message: `Starting a conversation with ${contact.name} is off while previewing.`,
        });
        return;
      }
      setNotice(null);
      const result = await controller.startConversation(contact);
      if (!result.ok) {
        haptic.error();
        setNotice({
          tone: 'error',
          title: 'Couldn’t start that conversation',
          message: `${result.error} Tap a name to try again.`,
        });
        return;
      }
      closeThen(closeNew, () => {
        controller.openThread(result.threadId);
        if (!result.existing) notify({ type: 'conversation_started', name: contact.name });
      });
    },
    [closeNew, controller, notify, readOnly],
  );

  const chooseTab = (next: ParentInboxTab) => {
    if (next === tab) {
      setFilterOpen(false);
      return;
    }
    closeThen(() => setFilterOpen(false), () => setTab(next));
  };
  const filterLabel = tab === 'unread' ? 'Unread only' : 'All';

  const subtitle =
    threads.length === 0 && isLoading
      ? 'Checking for new messages…'
      : unreadCount > 0
        ? `${unreadCount} unread ${unreadCount === 1 ? 'conversation' : 'conversations'}`
        : 'You’re all caught up';

  const unreadFilterCue =
    tab === 'unread' ? (
      <View style={styles.filterCue}>
        <GChip label="Unread only" tone="info" icon="funnel" />
        <GLink
          label="Show all"
          icon="close"
          onPress={() => setTab('all')}
          style={styles.centered}
        />
      </View>
    ) : null;

  const latestNote = latestUnread ? (
    <GNoteTile
      tint={Garden.butter}
      icon="mail-unread-outline"
      title={`Latest: ${latestUnread.title}`}
      subtitle={latestUnread.lastMessagePreview ?? 'New message'}
      accessibilityLabel={`Open latest unread conversation with ${latestUnread.title}`}
      accessibilityHint="Opens the conversation"
      onPress={() => controller.openThread(latestUnread.id)}
      style={styles.latest}
    />
  ) : null;

  const listHeader =
    unreadFilterCue || latestNote ? (
      <>
        {unreadFilterCue}
        {latestNote}
      </>
    ) : null;

  const renderEmpty = () => {
    if (error) return null;
    if (hasSearch) {
      return (
        <View style={[styles.emptyCard, styles.searchEmpty]}>
          <Ionicons name="search" size={26} color={Garden.ink25} />
          <Text style={styles.emptyTitle}>No conversations match this filter</Text>
          <Text style={styles.emptyBody}>Try a different search term.</Text>
          <GLink
            label="Clear search"
            icon="close"
            onPress={() => setSearchQuery('')}
            style={styles.centered}
          />
        </View>
      );
    }
    if (tab === 'unread') {
      return (
        <View style={[styles.emptyCard, styles.caughtUp]}>
          <GHand>All caught up!</GHand>
          <Text style={styles.emptyTitle}>No unread conversations</Text>
          <Text style={styles.emptyBody}>You’ve read everything in your inbox.</Text>
          <GLink
            label="Show all conversations"
            onPress={() => setTab('all')}
            style={styles.centered}
          />
        </View>
      );
    }
    return (
      <View style={[styles.emptyCard, styles.caughtUp]}>
        <GHand>Say hello!</GHand>
        <Text style={styles.emptyTitle}>No conversations yet</Text>
        <Text style={styles.emptyBody}>
          Message MudKitchen Support or tap New message to reach your school office and teachers.
        </Text>
        <GOutlineButton
          label="Start a conversation"
          icon="create-outline"
          onPress={openNew}
          style={styles.centered}
        />
      </View>
    );
  };

  const listFooter =
    visibleThreads.length > 0 ? (
      <View style={styles.footer}>
        {error ? (
          <View accessibilityRole="alert" style={styles.staleNote}>
            <Ionicons name="cloud-offline-outline" size={16} color="#7E4533" />
            <Text style={styles.staleText}>Couldn’t refresh. Showing your saved messages.</Text>
            <GLink label="Try again" icon="refresh" onPress={() => void onPullRefresh()} />
          </View>
        ) : null}
        <GLink
          label="How messaging works"
          icon="help-circle-outline"
          onPress={() => setHelpOpen(true)}
          style={styles.helpLink}
        />
      </View>
    ) : null;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <View style={styles.header} testID="parent-messages-inbox-header">
        <View style={styles.titleRow}>
          <View style={styles.titleCopy}>
            <Text accessibilityRole="header" style={styles.title}>
              Messages
            </Text>
            <Text style={[styles.subtitle, unreadCount > 0 ? { color: accent.clayDeep } : null]}>
              {subtitle}
            </Text>
          </View>
          <GToyButton
            testID="parent-messages-new-button"
            label="New message"
            icon="create-outline"
            accessibilityLabel="New message"
            accessibilityHint="Choose who to message"
            disabled={controller.startingContactKey !== null}
            onPress={openNew}
          />
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={17} color={Garden.soft} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search messages"
              placeholderTextColor={Garden.ink60}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              accessibilityLabel="Search messages"
              style={styles.searchInput}
            />
            {hasSearch ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                hitSlop={12}
                onPress={() => {
                  haptic.select();
                  setSearchQuery('');
                }}>
                <Ionicons name="close-circle" size={18} color={Garden.ink60} />
              </Pressable>
            ) : null}
          </View>
          <GPressable
            testID="parent-messages-filter-button"
            accessibilityLabel={`Filter conversations, showing ${filterLabel}${
              unreadCount > 0 ? `, ${unreadCount} unread` : ''
            }`}
            accessibilityHint="Choose which conversations to show"
            haptic="select"
            onPress={() => setFilterOpen(true)}
            style={[
              styles.filterButton,
              tab === 'unread'
                ? { backgroundColor: accent.clay, borderColor: Garden.ink }
                : null,
            ]}>
            <Ionicons
              name="options-outline"
              size={20}
              color={tab === 'unread' ? Garden.white : Garden.ink}
            />
            <GBadge count={unreadCount} />
          </GPressable>
        </View>
      </View>

      {showSkeleton ? (
        <InboxSkeleton />
      ) : showLoadError ? (
        <View style={styles.errorWrap}>
          <GErrorCard
            title="We couldn’t load your messages"
            message={`${error} Check your connection, then try again.`}
            onRetry={() => void onPullRefresh()}
          />
        </View>
      ) : (
        <FlatList<MessageThreadSummary>
          data={visibleThreads}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GardenThreadRow
              thread={item}
              onPress={() => controller.openThread(item.id)}
              onPressIn={() => controller.prefetchThread(item.id)}
            />
          )}
          ListHeaderComponent={listHeader}
          ListFooterComponent={listFooter}
          ListEmptyComponent={renderEmpty()}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          style={styles.list}
          contentContainerStyle={[
            styles.listContent,
            visibleThreads.length === 0 ? styles.listContentEmpty : null,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={pullRefreshing}
              onRefresh={() => void onPullRefresh()}
              tintColor={accent.clay}
              colors={[accent.clay]}
            />
          }
        />
      )}

      <GCelebrate active={caughtUp} celebrationKey="messages-caught-up" />

      <GardenNewConversationSheet
        visible={newOpen}
        contacts={controller.contacts}
        loadingContacts={isLoading && controller.contacts.length === 0}
        existingContactKeys={controller.existingContactKeys}
        startingContactKey={controller.startingContactKey}
        notice={notice}
        onClose={closeNew}
        onSelect={(contact) => {
          void handleSelectContact(contact);
        }}
      />
      <GardenMessagesHelpSheet visible={helpOpen} onClose={() => setHelpOpen(false)} />
      <GardenInboxFilterSheet
        visible={filterOpen}
        activeTab={tab}
        totalCount={searchedThreads.length}
        unreadCount={unreadCount}
        onClose={() => setFilterOpen(false)}
        onSelect={chooseTab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Garden.cream,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontFamily: GardenFonts.display,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.8,
    color: Garden.ink,
  },
  subtitle: {
    fontFamily: GardenFonts.bodyBold,
    fontSize: 14,
    lineHeight: 19,
    color: Garden.soft,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: Garden.ink15,
    backgroundColor: Garden.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 4,
    paddingBottom: 6,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 46,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Garden.ink15,
    backgroundColor: Garden.white,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontFamily: GardenFonts.bodySemi,
    fontSize: 16,
    color: Garden.ink,
  },
  skeleton: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 10,
  },
  skeletonRow: {
    height: 84,
    borderRadius: 20,
  },
  errorWrap: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 40,
    gap: 10,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  latest: {
    marginTop: 8,
    marginBottom: 6,
  },
  emptyCard: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  searchEmpty: {
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    backgroundColor: Garden.white,
  },
  caughtUp: {
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
    marginBottom: 6,
  },
  centered: {
    alignSelf: 'center',
  },
  footer: {
    gap: 10,
    paddingTop: 6,
  },
  staleNote: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
    borderRadius: 16,
    backgroundColor: Garden.peach,
  },
  staleText: {
    flex: 1,
    minWidth: 160,
    fontFamily: GardenFonts.bodyBold,
    fontSize: 13,
    lineHeight: 18,
    color: '#7E4533',
  },
  helpLink: {
    alignSelf: 'center',
    minHeight: 44,
  },
});
