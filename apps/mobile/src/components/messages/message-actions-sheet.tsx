import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryMoreMenuIcon } from '@/components/story/more/story-more-menu-icon';
import { StoryBottomSheet } from '@/components/story/story-bottom-sheet';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type MessageActionsSheetProps = {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  title?: string;
};

export function MessageActionsSheet({
  visible,
  onClose,
  onEdit,
  onDelete,
  title = 'Message',
}: MessageActionsSheetProps) {
  const theme = useParentTheme();

  const handleEdit = () => {
    onEdit();
    onClose();
  };

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  return (
    <StoryBottomSheet visible={visible} onClose={onClose} accessibilityLabel="Close message actions">
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.ink }]}>{title}</Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit"
            onPress={handleEdit}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <StoryMoreMenuIcon
              name="pencil"
              iconBg={theme.primarySoft}
              iconColor={theme.primary}
            />
            <Text style={[styles.label, { color: theme.ink }]}>Edit</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Delete"
            onPress={handleDelete}
            style={({ pressed }) => [styles.row, styles.rowBordered, pressed && styles.pressed]}>
            <StoryMoreMenuIcon
              name="trash"
              iconBg={theme.warningBg}
              iconColor={theme.alert}
            />
            <Text style={[styles.label, { color: theme.alert }]}>Delete</Text>
          </Pressable>
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
    marginBottom: Spacing.two,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
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
  label: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
