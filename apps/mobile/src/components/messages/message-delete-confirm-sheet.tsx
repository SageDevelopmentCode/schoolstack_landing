import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

type MessageDeleteConfirmSheetProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deleting?: boolean;
};

export function MessageDeleteConfirmSheet({
  visible,
  onClose,
  onConfirm,
  deleting = false,
}: MessageDeleteConfirmSheetProps) {
  const theme = useParentTheme();

  return (
    <BottomSheetShell
      visible={visible}
      onClose={onClose}
      accessibilityLabel="Close delete confirmation"
      backgroundColor={theme.white}
      borderColor={theme.line}
      handleColor={theme.line}
      scrollable={false}
      scrollContentStyle={styles.content}>
      <Text style={[styles.title, { color: theme.ink }]}>Delete message?</Text>
      <Text style={[styles.body, { color: theme.muted }]}>
        This message will be removed for everyone in the conversation. This cannot be undone.
      </Text>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          onPress={onClose}
          disabled={deleting}
          style={({ pressed }) => [styles.footerButton, pressed && styles.pressed]}>
          <Text style={[styles.cancelText, { color: theme.muted }]}>Cancel</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete"
          onPress={onConfirm}
          disabled={deleting}
          style={({ pressed }) => [
            styles.deleteButton,
            { backgroundColor: theme.alert },
            pressed && styles.pressed,
            deleting && styles.disabled,
          ]}>
          <Text style={styles.deleteText}>{deleting ? 'Deleting…' : 'Delete'}</Text>
        </Pressable>
      </View>
    </BottomSheetShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  body: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  footerButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  cancelText: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 15,
    fontWeight: '500',
  },
  deleteButton: {
    borderRadius: Radius.pill,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    minWidth: 96,
    alignItems: 'center',
  },
  deleteText: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.6,
  },
});
