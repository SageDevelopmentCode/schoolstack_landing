import { forwardRef, useMemo, type ReactNode, type Ref } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PARENT_FLOATING_TAB_BAR_HEIGHT } from '@/components/parent/parent-floating-tab-bar';
import { Spacing } from '@/constants/theme';

type ParentKeyboardAwareScrollViewProps = Omit<ScrollViewProps, 'contentContainerStyle'> & {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  includeTabBarPadding?: boolean;
  keyboardVerticalOffset?: number;
  style?: StyleProp<ViewStyle>;
};

export const ParentKeyboardAwareScrollView = forwardRef(function ParentKeyboardAwareScrollView(
  {
    children,
    contentContainerStyle,
    includeTabBarPadding = true,
    keyboardVerticalOffset = 0,
    style,
    keyboardShouldPersistTaps = 'handled',
    showsVerticalScrollIndicator = false,
    ...scrollProps
  }: ParentKeyboardAwareScrollViewProps,
  ref: Ref<ScrollView>,
) {
  const insets = useSafeAreaInsets();

  const resolvedContentContainerStyle = useMemo(
    () => [
      styles.content,
      contentContainerStyle,
      includeTabBarPadding
        ? { paddingBottom: PARENT_FLOATING_TAB_BAR_HEIGHT + insets.bottom + Spacing.six }
        : { paddingBottom: insets.bottom + Spacing.six },
    ],
    [contentContainerStyle, includeTabBarPadding, insets.bottom],
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={keyboardVerticalOffset}
      style={[styles.flex, style]}>
      <ScrollView
        ref={ref}
        contentContainerStyle={resolvedContentContainerStyle}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        {...scrollProps}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
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
