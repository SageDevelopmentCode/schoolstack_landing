import { type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { Story } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { useKeyboardHeight } from '@/hooks/use-keyboard-height';

type StoryBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  accessibilityLabel?: string;
};

export function StoryBottomSheet({
  visible,
  onClose,
  children,
  accessibilityLabel = 'Close',
}: StoryBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const keyboardInset = useKeyboardHeight();

  return (
    <BottomSheetShell
      visible={visible}
      onClose={onClose}
      accessibilityLabel={accessibilityLabel}
      keyboardAvoiding
      keyboardShouldPersistTaps="handled"
      backgroundColor={Story.paper}
      borderColor={Story.line}
      handleColor={Story.line}
      maxHeight="92%"
      bottomInset={insets.bottom + Spacing.four}
      scrollContentStyle={[
        styles.body,
        keyboardInset > 0 ? { paddingBottom: keyboardInset + Spacing.four } : null,
      ]}>
      {children}
    </BottomSheetShell>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
});
