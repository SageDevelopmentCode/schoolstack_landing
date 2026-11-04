import { type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { Story } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { useBottomSheetKeyboardScrollStyle } from '@/hooks/use-bottom-sheet-keyboard-scroll-style';

type StoryBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  onDismissed?: () => void;
  children: ReactNode;
  accessibilityLabel?: string;
};

export function StoryBottomSheet({
  visible,
  onClose,
  onDismissed,
  children,
  accessibilityLabel = 'Close',
}: StoryBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { scrollContentStyle } = useBottomSheetKeyboardScrollStyle(styles.body);

  return (
    <BottomSheetShell
      visible={visible}
      onClose={onClose}
      onDismissed={onDismissed}
      accessibilityLabel={accessibilityLabel}
      keyboardAvoiding
      keyboardShouldPersistTaps="handled"
      backgroundColor={Story.paper}
      borderColor={Story.line}
      handleColor={Story.line}
      maxHeight="92%"
      bottomInset={insets.bottom + Spacing.four}
      scrollContentStyle={scrollContentStyle}>
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
