import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import type { CheckoutPaymentMethod } from '@/lib/parent/parent-portal-api';
import { formatCents } from '@/lib/tuition/format-cents';

export const PAYMENT_METHOD_SHEET_CLOSE_MS = 220;

type ParentPaymentMethodSheetProps = {
  visible: boolean;
  amountCents: number;
  label: string;
  loading: boolean;
  onClose: () => void;
  onDismissed?: () => void;
  onSelect: (method: CheckoutPaymentMethod) => void;
};

const SHEET_SLIDE_OFFSET = 400;
const OPEN_DURATION_MS = 280;

export function ParentPaymentMethodSheet({
  visible,
  amountCents,
  label,
  loading,
  onClose,
  onDismissed,
  onSelect,
}: ParentPaymentMethodSheetProps) {
  const theme = useAdminTheme();
  const insets = useSafeAreaInsets();
  const onDismissedRef = useRef(onDismissed);
  const [modalVisible, setModalVisible] = useState(false);
  const backdropOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue(SHEET_SLIDE_OFFSET);

  useEffect(() => {
    onDismissedRef.current = onDismissed;
  }, [onDismissed]);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      backdropOpacity.value = 0;
      sheetTranslateY.value = SHEET_SLIDE_OFFSET;
      backdropOpacity.value = withTiming(1, { duration: 250 });
      sheetTranslateY.value = withTiming(0, {
        duration: OPEN_DURATION_MS,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    if (!visible && modalVisible) {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      sheetTranslateY.value = withTiming(
        SHEET_SLIDE_OFFSET,
        { duration: PAYMENT_METHOD_SHEET_CLOSE_MS, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) {
            runOnJS(setModalVisible)(false);
            const dismiss = onDismissedRef.current;
            if (dismiss) {
              runOnJS(dismiss)();
            }
          }
        },
      );
    }
  }, [visible, modalVisible, backdropOpacity, sheetTranslateY]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  return (
    <Modal visible={modalVisible} animationType="none" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View pointerEvents="none" style={[styles.backdrop, backdropAnimatedStyle]} />
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={loading ? undefined : onClose}
          accessibilityLabel="Close payment method selection"
        />
        <Animated.View
          style={[
            styles.sheet,
            sheetAnimatedStyle,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              paddingBottom: insets.bottom + Spacing.four,
            },
          ]}>
          <View style={styles.handleRow}>
            <View style={[styles.handle, { backgroundColor: theme.borderStrong }]} />
          </View>

          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <ThemedText type="title" style={{ color: theme.textPrimary }}>
              Choose payment method
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 4 }}>
              {label}
            </ThemedText>
            <ThemedText type="smallBold" style={{ color: theme.textPrimary, marginTop: 8 }}>
              {formatCents(amountCents)}
            </ThemedText>
          </View>

          <View style={styles.options}>
            <Pressable
              onPress={() => onSelect('card')}
              disabled={loading}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.option,
                { borderColor: theme.border, backgroundColor: theme.bg },
                pressed && !loading && { opacity: 0.85 },
              ]}>
              <Ionicons name="card-outline" size={24} color={theme.accent} />
              <View style={styles.optionText}>
                <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                  Credit or debit card
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Pay instantly with card
                </ThemedText>
              </View>
              {loading ? (
                <ActivityIndicator color={theme.accent} />
              ) : (
                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
              )}
            </Pressable>

            <Pressable
              onPress={() => onSelect('us_bank_account')}
              disabled={loading}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.option,
                { borderColor: theme.border, backgroundColor: theme.bg },
                pressed && !loading && { opacity: 0.85 },
              ]}>
              <Ionicons name="business-outline" size={24} color={theme.accent} />
              <View style={styles.optionText}>
                <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                  Bank account (ACH)
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Pay from your bank account
                </ThemedText>
              </View>
              {loading ? (
                <ActivityIndicator color={theme.accent} />
              ) : (
                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
              )}
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: Spacing.two,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: Radius.pill,
  },
  header: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  options: {
    padding: Spacing.five,
    gap: Spacing.three,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.four,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
});
