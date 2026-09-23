import { type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryRadius } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

type StoryMoreMenuSheetShellProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function StoryMoreMenuSheetShell({
  visible,
  onClose,
  children,
}: StoryMoreMenuSheetShellProps) {
  const theme = useParentTheme();
  const insets = useSafeAreaInsets();

  return (
    <BottomSheetShell
      visible={visible}
      onClose={onClose}
      accessibilityLabel="Close more menu"
      backgroundColor={theme.paper}
      borderColor={theme.line}
      handleColor={theme.line}
      maxHeight="85%"
      bounces={false}
      bottomInset={insets.bottom + Spacing.four}
      sheetStyle={styles.sheet}
      scrollContentStyle={styles.content}>
      {children}
    </BottomSheetShell>
  );
}

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: StoryRadius.card,
    borderTopRightRadius: StoryRadius.card,
    shadowColor: '#32483D',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 16,
  },
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    gap: Spacing.three,
  },
});
