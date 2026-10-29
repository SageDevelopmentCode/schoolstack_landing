import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useKeyboardHeight } from '@/hooks/use-keyboard-height';

type MessageThreadKeyboardLayoutProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  /** Called when the keyboard opens (e.g. scroll message list to end). */
  onKeyboardShow?: () => void;
};

export function MessageThreadKeyboardLayout({
  children,
  style,
  backgroundColor,
  onKeyboardShow,
}: MessageThreadKeyboardLayoutProps) {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const bottomLift = Math.max(0, keyboardHeight - insets.bottom);

  useEffect(() => {
    if (keyboardHeight > 0) {
      onKeyboardShow?.();
    }
  }, [keyboardHeight, onKeyboardShow]);

  return (
    <View
      style={[
        styles.container,
        backgroundColor != null ? { backgroundColor } : null,
        { paddingBottom: bottomLift },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
