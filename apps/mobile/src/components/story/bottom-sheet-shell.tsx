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
  onDismissed?: () => void;
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
  onDismissed,
}: BottomSheetShellProps) {
  const insets = useSafeAreaInsets();
  const resolvedBottomInset = bottomInset ?? insets.bottom + Spacing.two;

  const {
    modalVisible,
    isClosing,
    backdropAnimatedStyle,
    sheetAnimatedStyle,
    scrollHandler,
    handlePanGesture,
    contentPanGesture,
  } = useBottomSheetMotion({
    visible,
    onClose,
    onDismissed,
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
        !scrollable ? styles.sheetFill : null,
      ]}>
      <GestureDetector gesture={handlePanGesture}>
        <View style={styles.handleRow}>
          <View style={[styles.handle, { backgroundColor: handleColor }]} />
        </View>
      </GestureDetector>

      {header}

      <GestureDetector gesture={contentPanGesture}>
        <View style={[styles.contentArea, !scrollable ? styles.contentAreaFill : null]}>
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
            <View style={[styles.body, styles.bodyFill, scrollContentStyle]}>{children}</View>
          )}
        </View>
      </GestureDetector>

      {footer}
    </Animated.View>
  );

  return (
    <Modal visible={modalVisible} animationType="none" transparent onRequestClose={onClose}>
      <GestureHandlerRootView
        style={[styles.root, isClosing ? styles.rootPassthrough : null]}
        pointerEvents={isClosing ? 'box-none' : 'auto'}>
        <View style={styles.overlay} pointerEvents={isClosing ? 'box-none' : 'auto'}>
          <Animated.View
            pointerEvents="none"
            style={[styles.backdrop, { backgroundColor: backdropColor }, backdropAnimatedStyle]}
          />
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityLabel={accessibilityLabel}
            pointerEvents={isClosing ? 'none' : 'auto'}
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
  rootPassthrough: {
    pointerEvents: 'box-none',
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
  sheetFill: {
    flex: 1,
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
  contentAreaFill: {
    flex: 1,
    minHeight: 0,
  },
  scroll: {
    flexGrow: 0,
  },
  body: {
    flexGrow: 1,
    paddingBottom: Spacing.four,
  },
  bodyFill: {
    flex: 1,
    minHeight: 0,
  },
});
