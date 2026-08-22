import { StyleSheet, View } from 'react-native';

import { MessagesAvatar } from '@/components/school-admin/messages/messages-avatar';
import { MessagesDualAvatar } from '@/components/school-admin/messages/messages-dual-avatar';
import { AdminListCardPressable } from '@/components/school-admin/admin-list-card';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import type { MessageThreadSummary } from '@/lib/messages/types';

type MessageThreadRowProps = {
  thread: MessageThreadSummary;
  onPress: () => void;
};

export function MessageThreadRow({ thread, onPress }: MessageThreadRowProps) {
  const theme = useAdminTheme();
  const hasUnread = thread.unreadCount > 0;

  return (
    <AdminListCardPressable onPress={onPress}>
      <View style={styles.row}>
        {thread.listAvatars?.length === 2 ? (
          <MessagesDualAvatar avatars={thread.listAvatars} size="sm" />
        ) : (
          <MessagesAvatar
            name={thread.title}
            color={thread.color}
            photoUrl={thread.photoUrl}
            size="sm"
          />
        )}
        <View style={styles.content}>
          <View style={styles.topLine}>
            <ThemedText
              type="smallBold"
              numberOfLines={1}
              style={[styles.title, { color: theme.textPrimary, flex: 1 }]}>
              {thread.title}
            </ThemedText>
            {thread.lastMessageTimeLabel ? (
              <ThemedText type="small" style={{ color: theme.textTertiary }}>
                {thread.lastMessageTimeLabel}
              </ThemedText>
            ) : null}
          </View>
          {thread.subtitle ? (
            <ThemedText type="small" numberOfLines={1} style={{ color: theme.textSecondary }}>
              {thread.subtitle}
            </ThemedText>
          ) : null}
          {thread.lastMessagePreview ? (
            <ThemedText
              type="small"
              numberOfLines={2}
              style={{
                color: hasUnread ? theme.textPrimary : theme.textSecondary,
                fontWeight: hasUnread ? '600' : '400',
              }}>
              {thread.lastMessagePreview}
            </ThemedText>
          ) : null}
        </View>
        {hasUnread ? (
          <View style={[styles.unreadBadge, { backgroundColor: theme.accent }]}>
            <ThemedText type="badge" style={{ color: '#FFFFFF', fontSize: 10 }}>
              {thread.unreadCount > 9 ? '9+' : String(thread.unreadCount)}
            </ThemedText>
          </View>
        ) : null}
      </View>
    </AdminListCardPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    flexShrink: 1,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginTop: 2,
  },
});
