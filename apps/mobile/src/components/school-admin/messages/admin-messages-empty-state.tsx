import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { MESSAGES_PAGE_HORIZONTAL_PADDING } from '@/components/parent/messages/messages-layout';
import { StoryFonts } from '@/constants/story-theme';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Spacing } from '@/constants/theme';

type AdminMessagesEmptyStateProps = {
  hasSearchQuery?: boolean;
};

export function AdminMessagesEmptyState({ hasSearchQuery = false }: AdminMessagesEmptyStateProps) {
  const theme = useParentTheme();

  const title = hasSearchQuery ? 'No conversations match this filter' : 'No conversations yet';
  const description = hasSearchQuery
    ? 'Try a different search term.'
    : 'Tap + New to start messaging families and staff.';

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: theme.primarySoft }]}>
        <Ionicons name="chatbubble-ellipses-outline" size={28} color={theme.primary} />
      </View>
      <Text style={[styles.title, { color: theme.ink }]}>{title}</Text>
      <Text style={[styles.description, { color: theme.muted }]}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: MESSAGES_PAGE_HORIZONTAL_PADDING,
    paddingTop: Spacing.six,
    gap: Spacing.three,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 280,
  },
});
