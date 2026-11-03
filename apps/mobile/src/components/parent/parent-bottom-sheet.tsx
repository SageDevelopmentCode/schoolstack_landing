import { type ReactNode } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { useBottomSheetKeyboardScrollStyle } from '@/hooks/use-bottom-sheet-keyboard-scroll-style';
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
  scrollContentStyle?: StyleProp<ViewStyle>;
};

export function ParentBottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  accessibilityLabel = 'Close',
  scrollContentStyle: extraScrollContentStyle,
}: ParentBottomSheetProps) {
  const theme = useAdminTheme();
  const insets = useSafeAreaInsets();
  const { scrollContentStyle } = useBottomSheetKeyboardScrollStyle([
    styles.body,
    extraScrollContentStyle,
  ]);

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
      scrollContentStyle={scrollContentStyle}
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
