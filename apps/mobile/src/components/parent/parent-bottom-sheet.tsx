import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { useKeyboardHeight } from '@/hooks/use-keyboard-height';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Spacing } from '@/constants/theme';

type ParentBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  accessibilityLabel?: string;
};

export function ParentBottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  accessibilityLabel = 'Close',
}: ParentBottomSheetProps) {
  const theme = useAdminTheme();
  const insets = useSafeAreaInsets();
  const keyboardInset = useKeyboardHeight();

  return (
    <BottomSheetShell
      visible={visible}
      onClose={onClose}
      accessibilityLabel={accessibilityLabel}
      keyboardAvoiding
      keyboardShouldPersistTaps="handled"
      backgroundColor={theme.surface}
      borderColor={theme.border}
      handleColor={theme.borderStrong}
      maxHeight="85%"
      bottomInset={insets.bottom + Spacing.four}
      scrollContentStyle={[
        styles.body,
        keyboardInset > 0 ? { paddingBottom: keyboardInset + Spacing.four } : null,
      ]}
      header={
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <ThemedText type="title" style={{ color: theme.textPrimary }}>
            {title}
          </ThemedText>
          {subtitle ? (
            <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 4 }}>
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
      }>
      {children}
    </BottomSheetShell>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  body: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
});
