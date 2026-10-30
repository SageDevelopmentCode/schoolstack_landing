import { forwardRef, useMemo, type ReactNode, type Ref } from 'react';
import {
  ScrollView,
  StyleSheet,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PARENT_FLOATING_TAB_BAR_HEIGHT } from '@/components/parent/parent-floating-tab-bar';
import { Spacing } from '@/constants/theme';
import { useKeyboardHeight } from '@/hooks/use-keyboard-height';

type ParentKeyboardAwareScrollViewProps = Omit<ScrollViewProps, 'contentContainerStyle'> & {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  includeTabBarPadding?: boolean;
  /** @deprecated Prefer keyboard lift via useKeyboardHeight; kept for rare manual tweaks. */
  keyboardVerticalOffset?: number;
  style?: StyleProp<ViewStyle>;
};

export const ParentKeyboardAwareScrollView = forwardRef(function ParentKeyboardAwareScrollView(
  {
    children,
    contentContainerStyle,
    includeTabBarPadding = true,
    style,
    keyboardShouldPersistTaps = 'handled',
    showsVerticalScrollIndicator = false,
    ...scrollProps
  }: ParentKeyboardAwareScrollViewProps,
  ref: Ref<ScrollView>,
) {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const keyboardLift = Math.max(0, keyboardHeight - insets.bottom);

  const resolvedContentContainerStyle = useMemo(
    () => [
      styles.content,
      contentContainerStyle,
      includeTabBarPadding
        ? {
            paddingBottom:
              PARENT_FLOATING_TAB_BAR_HEIGHT + insets.bottom + Spacing.six + keyboardLift,
          }
        : { paddingBottom: insets.bottom + Spacing.six + keyboardLift },
    ],
    [contentContainerStyle, includeTabBarPadding, insets.bottom, keyboardLift],
  );

  return (
    <ScrollView
      ref={ref}
      style={[styles.flex, style]}
      contentContainerStyle={resolvedContentContainerStyle}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      {...scrollProps}>
      {children}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});
