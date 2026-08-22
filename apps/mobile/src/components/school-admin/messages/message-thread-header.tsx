import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { MessagesAvatar } from '@/components/school-admin/messages/messages-avatar';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Spacing } from '@/constants/theme';
import type { MessageThreadSummary } from '@/lib/messages/types';

type MessageThreadHeaderProps = {
  thread: Pick<MessageThreadSummary, 'title' | 'subtitle' | 'color'>;
  backLabel?: string;
};

export function MessageThreadHeader({ thread, backLabel = 'Messages' }: MessageThreadHeaderProps) {
  const theme = useAdminTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { borderBottomColor: theme.border, backgroundColor: theme.surface }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Back to ${backLabel}`}
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
        <Ionicons name="chevron-back" size={20} color={theme.accent} />
        <ThemedText type="small" style={{ color: theme.accent }}>
          {backLabel}
        </ThemedText>
      </Pressable>
      <View style={styles.center}>
        <MessagesAvatar name={thread.title} color={thread.color} size="sm" />
        <View style={styles.titleBlock}>
          <ThemedText type="smallBold" numberOfLines={1} style={{ color: theme.textPrimary }}>
            {thread.title}
          </ThemedText>
          {thread.subtitle ? (
            <ThemedText type="small" numberOfLines={1} style={{ color: theme.textSecondary }}>
              {thread.subtitle}
            </ThemedText>
          ) : null}
        </View>
      </View>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minWidth: 100,
  },
  center: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  titleBlock: {
    flexShrink: 1,
    maxWidth: 180,
  },
  spacer: {
    minWidth: 100,
  },
});
