import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBottomSheetMotion } from '@/hooks/use-bottom-sheet-motion';
import { Radius, Spacing } from '@/constants/theme';

export type BottomSheetShellProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  accessibilityLabel?: string;
  keyboardAvoiding?: boolean;
  scrollable?: boolean;
  enableDragToDismiss?: boolean;
  maxHeight?: `${number}%` | number;
  sheetStyle?: StyleProp<ViewStyle>;
  scrollContentStyle?: StyleProp<ViewStyle>;
  handleColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  backdropColor?: string;
  bounces?: boolean;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  bottomInset?: number;
};

export function BottomSheetShell({
  visible,
  onClose,
  children,
  header,
  footer,
  accessibilityLabel = 'Close',
  keyboardAvoiding = false,
  scrollable = true,
  enableDragToDismiss = true,
  maxHeight = '92%',
  sheetStyle,
  scrollContentStyle,
  handleColor = '#E7EBE2',
  backgroundColor = '#FFFFFF',
  borderColor = '#E7EBE2',
  backdropColor = 'rgba(0,0,0,0.45)',
  bounces = true,
  keyboardShouldPersistTaps,
  bottomInset,
}: BottomSheetShellProps) {
  const insets = useSafeAreaInsets();
  const resolvedBottomInset = bottomInset ?? insets.bottom + Spacing.two;

  const {
    modalVisible,
    backdropAnimatedStyle,
    sheetAnimatedStyle,
    scrollHandler,
    handlePanGesture,
    contentPanGesture,
  } = useBottomSheetMotion({
    visible,
    onClose,
    enableDragToDismiss,
  });

  const sheetContent = (
    <Animated.View
      style={[
        styles.sheet,
        sheetAnimatedStyle,
        {
          backgroundColor,
          borderColor,
          maxHeight,
          paddingBottom: resolvedBottomInset,
        },
        sheetStyle,
      ]}>
      <GestureDetector gesture={handlePanGesture}>
        <View style={styles.handleRow}>
          <View style={[styles.handle, { backgroundColor: handleColor }]} />
        </View>
      </GestureDetector>

      {header}

      <GestureDetector gesture={contentPanGesture}>
        <View style={styles.contentArea}>
          {scrollable ? (
            <Animated.ScrollView
              style={styles.scroll}
              contentContainerStyle={[styles.body, scrollContentStyle]}
              showsVerticalScrollIndicator={false}
              bounces={bounces}
              keyboardShouldPersistTaps={keyboardShouldPersistTaps}
              onScroll={scrollHandler}
              scrollEventThrottle={16}>
              {children}
            </Animated.ScrollView>
          ) : (
            <View style={[styles.body, scrollContentStyle]}>{children}</View>
          )}
        </View>
      </GestureDetector>

      {footer}
    </Animated.View>
  );

  return (
    <Modal visible={modalVisible} animationType="none" transparent onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.root}>
        <View style={styles.overlay}>
          <Animated.View
            pointerEvents="none"
            style={[styles.backdrop, { backgroundColor: backdropColor }, backdropAnimatedStyle]}
          />
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityLabel={accessibilityLabel}
          />
          {keyboardAvoiding ? (
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.keyboardAvoiding}>
              {sheetContent}
            </KeyboardAvoidingView>
          ) : (
            sheetContent
          )}
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  keyboardAvoiding: {
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: Radius.pill,
  },
  contentArea: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scroll: {
    flexGrow: 0,
  },
  body: {
    flexGrow: 1,
    paddingBottom: Spacing.four,
  },
});
