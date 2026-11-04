import { useMemo } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useKeyboardHeight } from '@/hooks/use-keyboard-height';

type BaseScrollStyle = StyleProp<ViewStyle>;

export function useBottomSheetKeyboardScrollStyle(baseStyle: BaseScrollStyle) {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const keyboardOpen = keyboardHeight > 0;

  const scrollContentStyle = useMemo(
    (): StyleProp<ViewStyle> => [
      baseStyle,
      keyboardOpen
        ? { paddingBottom: Math.max(0, keyboardHeight - insets.bottom) + Spacing.four }
        : null,
    ],
    [baseStyle, insets.bottom, keyboardHeight, keyboardOpen],
  );

  return { keyboardOpen, scrollContentStyle };
}
