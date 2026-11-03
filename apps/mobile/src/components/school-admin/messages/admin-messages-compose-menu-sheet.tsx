import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryMoreMenuIcon } from '@/components/story/more/story-more-menu-icon';
import { StoryBottomSheet } from '@/components/story/story-bottom-sheet';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { useParentTheme } from '@/contexts/parent-theme-context';

type AdminMessagesComposeMenuSheetProps = {
  visible: boolean;
  onClose: () => void;
  onDismissed?: () => void;
  onNewConversation: () => void;
  onBulkMessage?: () => void;
};

export function AdminMessagesComposeMenuSheet({
  visible,
  onClose,
  onDismissed,
  onNewConversation,
  onBulkMessage,
}: AdminMessagesComposeMenuSheetProps) {
  const theme = useParentTheme();

  const handleNewConversation = () => {
    onNewConversation();
  };

  const handleBulkMessage = () => {
    onBulkMessage?.();
  };

  return (
    <StoryBottomSheet
      visible={visible}
      onClose={onClose}
      onDismissed={onDismissed}
      accessibilityLabel="Close compose options">
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.ink }]}>New message</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            Start a one-to-one thread or message a group of parents.
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="New conversation"
            onPress={handleNewConversation}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <StoryMoreMenuIcon
              name="chatbubble-ellipses-outline"
              iconBg={theme.primarySoft}
              iconColor={theme.primary}
            />
            <View style={styles.copy}>
              <Text style={[styles.label, { color: theme.ink }]}>New conversation</Text>
              <Text style={[styles.actionSubtitle, { color: theme.muted }]}>
                Message one parent or staff member
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.muted} />
          </Pressable>

          {onBulkMessage ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Bulk message"
              testID="admin-messages-bulk-message"
              onPress={handleBulkMessage}
              style={({ pressed }) => [styles.row, styles.rowBordered, pressed && styles.pressed]}>
              <StoryMoreMenuIcon
                name="people-outline"
                iconBg={theme.infoBg}
                iconColor={theme.sky}
              />
              <View style={styles.copy}>
                <Text style={[styles.label, { color: theme.ink }]}>Bulk message</Text>
                <Text style={[styles.actionSubtitle, { color: theme.muted }]}>
                  Filter by program, class, grade, or parents
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.muted} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </StoryBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.four,
  },
  header: {
    gap: 2,
    marginBottom: Spacing.two,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  actions: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  rowBordered: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E7EBE2',
  },
  pressed: {
    opacity: 0.85,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  label: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  actionSubtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
});
