import { StatusBar } from 'expo-status-bar';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { GInlineBanner } from '@/components/parent/garden/fields';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GHand, GKicker, GLink, GSkeleton } from '@/components/parent/garden/ui';
import { GardenThreadRow } from '@/components/parent/messages/garden/garden-thread-row';
import {
  AdminEmptyPanel,
  AdminSearchField,
  AdminToolbarButton,
} from '@/components/school-admin/garden/admin-ui';
import { AdminTabHeader, useAdminTopBleed } from '@/components/school-admin/garden/admin-tab-header';
import { AdminBroadcastSheet } from '@/components/school-admin/messages/garden/admin-broadcast-sheet';
import { AdminComposeMenuSheet } from '@/components/school-admin/messages/garden/admin-compose-menu-sheet';
import { AdminNewConversationSheet } from '@/components/school-admin/messages/garden/admin-new-conversation-sheet';
import { useAdminMessagesInboxController } from '@/components/school-admin/messages/garden/use-admin-messages-inbox-controller';
import { useAdminMessagesFeedback } from '@/components/school-admin/messages/garden/use-admin-messages-feedback';
import type { AdminConversationListItem } from '@/lib/messages/admin-thread-sections';

/** "2 unread · 14 conversations" — built only from data. */
export function messagesStatusLine(unreadThreads: number, total: number): string {
  if (total === 0) return 'No conversations yet';
  const parts = [unreadThreads > 0 ? `${unreadThreads} unread` : 'All caught up'];
  parts.push(`${total} conversation${total === 1 ? '' : 's'}`);
  return parts.join(' · ');
}

type AdminMessagesInboxScreenProps = {
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
};

/**
 * School admin › Messages (Garden inbox). Data, realtime and conversation start
 * live in `useAdminMessagesInboxController`; feedback adds toasts and in-sheet status.
 */
export function AdminMessagesInboxScreen(props: AdminMessagesInboxScreenProps) {
  const controller = useAdminMessagesInboxController(props);
  const feedback = useAdminMessagesFeedback(controller);
  const bleed = useAdminTopBleed();
  const hasSearch = controller.searchQuery.trim().length > 0;

  const renderItem = ({ item }: { item: AdminConversationListItem }) => {
    if (item.type === 'section') {
      return (
        <View style={styles.section}>
          <GKicker>{item.label}</GKicker>
          {item.description ? <Text style={styles.sectionDescription}>{item.description}</Text> : null}
        </View>
      );
    }
    return (
      <View style={styles.rowWrap}>
        <GardenThreadRow
          thread={item.thread}
          onPress={() => controller.openThread(item.thread.id)}
          onPressIn={() => controller.prefetchThread(item.thread.id)}
        />
      </View>
    );
  };

  return (
    <View style={[styles.root, bleed]} testID="school-admin-messages-ready">
      <StatusBar style="dark" />
      <View style={styles.top} testID="admin-messages-inbox-header">
        <AdminTabHeader
          title="Messages"
          accentWord="Messages"
          statusLine={messagesStatusLine(controller.unreadThreads, controller.threads.length)}
          lastUpdatedAt={controller.lastUpdatedAt}
          statusTestID="messages-status-line"
          toolbar={
            <AdminToolbarButton
              testID="admin-messages-new-button"
              icon="create-outline"
              label="New"
              accessibilityLabel="New message"
              disabled={controller.startingContactKey !== null}
              onPress={controller.openComposeMenu}
            />
          }
        />
        <AdminSearchField
          value={controller.searchQuery}
          onChangeText={controller.setSearchQuery}
          placeholder="Search messages"
          accessibilityLabel="Search messages"
        />
        {controller.error && controller.threads.length > 0 ? (
          <GInlineBanner
            tone="error"
            title="Couldn't refresh messages"
            description={controller.error}
            action={<GLink label="Try again" icon="refresh" onPress={() => void feedback.onPullRefresh()} />}
          />
        ) : null}
      </View>

      {controller.status === 'loading' ? (
        <InboxSkeleton />
      ) : (
        <FlatList
          data={controller.listItems}
          keyExtractor={(item) => (item.type === 'section' ? item.key : item.thread.id)}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={[styles.listContent, controller.listItems.length === 0 && styles.listEmpty]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={
            <RefreshControl
              refreshing={feedback.pullRefreshing}
              onRefresh={() => void feedback.onPullRefresh()}
              tintColor={Garden.soft}
            />
          }
          ListEmptyComponent={
            controller.error && controller.threads.length === 0 ? (
              <AdminEmptyPanel
                icon="cloud-offline-outline"
                title="We couldn't load your messages"
                body={controller.error}
                actionLabel="Try again"
                onAction={() => void feedback.onPullRefresh()}
              />
            ) : hasSearch ? (
              <AdminEmptyPanel
                icon="search-outline"
                title="No conversations match this filter"
                body="Try a different search term."
                actionLabel="Clear search"
                onAction={() => controller.setSearchQuery('')}
              />
            ) : (
              <View>
                <AdminEmptyPanel
                  tone="mint"
                  icon="chatbubble-ellipses-outline"
                  title="No conversations yet"
                  body="Tap + New to start messaging families and staff."
                  actionLabel="Start a conversation"
                  onAction={controller.openComposeMenu}
                />
                <View style={styles.hand}>
                  <GHand>quiet inbox ✿</GHand>
                </View>
              </View>
            )
          }
        />
      )}

      <AdminComposeMenuSheet
        visible={controller.composeMenuOpen}
        onClose={controller.closeComposeMenu}
        onDismissed={controller.onComposeMenuDismissed}
        onNewConversation={controller.requestNewConversation}
        onBulkMessage={controller.readOnly ? undefined : controller.requestBulkMessage}
      />

      <AdminNewConversationSheet
        visible={controller.newConversationOpen}
        contacts={controller.contacts}
        loadingContacts={controller.loadingContacts}
        existingContactKeys={controller.existingContactKeys}
        startingContactKey={controller.startingContactKey}
        notice={feedback.newConversationNotice}
        onClose={feedback.closeNewConversation}
        onSelect={(contact) => void feedback.selectContact(contact)}
      />

      <AdminBroadcastSheet
        visible={controller.broadcastOpen}
        organizationId={controller.organizationId}
        organizationSlug={controller.organizationSlug}
        schoolName={controller.schoolName}
        contacts={controller.contacts}
        loadingContacts={controller.loadingContacts}
        onClose={() => controller.setBroadcastOpen(false)}
        onSent={feedback.onSent}
      />
    </View>
  );
}

function InboxSkeleton() {
  return (
    <ScrollView scrollEnabled={false} accessibilityLabel="Loading messages" contentContainerStyle={styles.skeleton}>
      <GSkeleton style={styles.skKicker} />
      {[0, 1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.skRow}>
          <GSkeleton style={styles.skAvatar} />
          <View style={styles.skCopy}>
            <GSkeleton style={styles.skTitle} />
            <GSkeleton style={styles.skPreview} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  top: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, gap: 12 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 32 },
  listEmpty: { flexGrow: 1 },
  section: { paddingTop: 14, paddingBottom: 8, gap: 4 },
  sectionDescription: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: Garden.soft },
  rowWrap: { marginBottom: 8 },
  hand: { alignItems: 'center', marginTop: 12 },
  skeleton: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  skKicker: { width: 120, height: 12, borderRadius: 6 },
  skRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: Garden.white,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
  },
  skAvatar: { width: 48, height: 48, borderRadius: 24 },
  skCopy: { flex: 1, gap: 8 },
  skTitle: { width: '55%', height: 14, borderRadius: 7 },
  skPreview: { width: '85%', height: 12, borderRadius: 6 },
});
