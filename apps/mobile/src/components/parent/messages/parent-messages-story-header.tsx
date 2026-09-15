import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  MESSAGES_HEADER_GAP,
  MESSAGES_PAGE_HORIZONTAL_PADDING,
  MESSAGES_SEARCH_FIELD_BG,
} from '@/components/parent/messages/messages-layout';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StoryFonts } from '@/constants/story-theme';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Radius, Spacing } from '@/constants/theme';

type ParentMessagesStoryHeaderProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewMessage: () => void;
  newMessageDisabled?: boolean;
};

export function ParentMessagesStoryHeader({
  searchQuery,
  onSearchChange,
  onNewMessage,
  newMessageDisabled = false,
}: ParentMessagesStoryHeaderProps) {
  const theme = useParentTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.white,
          borderBottomColor: theme.line,
          paddingHorizontal: MESSAGES_PAGE_HORIZONTAL_PADDING,
        },
      ]}
      testID="parent-messages-inbox-header">
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <StoryDisplayHeading size="section">Messages</StoryDisplayHeading>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="New message"
          disabled={newMessageDisabled}
          onPress={onNewMessage}
          testID="parent-messages-new-button"
          style={({ pressed }) => [
            styles.newButton,
            {
              backgroundColor: theme.primary,
              opacity: newMessageDisabled ? 0.5 : pressed ? 0.9 : 1,
            },
          ]}>
          <Text style={styles.newButtonLabel}>+ New</Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.searchWrap,
          {
            backgroundColor: MESSAGES_SEARCH_FIELD_BG,
            borderColor: theme.line,
          },
        ]}>
        <Ionicons name="search" size={14} color={theme.muted} />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search messages"
          placeholderTextColor={theme.muted}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          accessibilityLabel="Search messages"
          style={[styles.searchInput, { color: theme.ink }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: MESSAGES_HEADER_GAP,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  newButton: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
  },
  newButtonLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontFamily: StoryFonts.body,
    fontSize: 16,
    paddingVertical: 2,
  },
});
