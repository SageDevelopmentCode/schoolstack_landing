import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
import { formatCents } from '@/lib/tuition/format-cents';
import type { TuitionPaymentReceiptDetail } from '@/lib/tuition/payment-receipt';

type ParentBillingPaymentReceiptSheetProps = {
  visible: boolean;
  receipt: TuitionPaymentReceiptDetail | null;
  onClose: () => void;
};

const SHEET_SLIDE_OFFSET = 500;
const OPEN_DURATION_MS = 280;
const CLOSE_DURATION_MS = 220;

export function ParentBillingPaymentReceiptSheet({
  visible,
  receipt,
  onClose,
}: ParentBillingPaymentReceiptSheetProps) {
  const theme = useAdminTheme();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const backdropOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue(SHEET_SLIDE_OFFSET);

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
        { duration: CLOSE_DURATION_MS, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) {
            runOnJS(setModalVisible)(false);
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

  if (!receipt) return null;

  return (
    <Modal visible={modalVisible} animationType="none" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View pointerEvents="none" style={[styles.backdrop, backdropAnimatedStyle]} />
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close receipt"
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
              Payment receipt
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 4 }}>
              {receipt.paidAtLabel}
            </ThemedText>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {receipt.lineItems.map((item, index) => (
              <View
                key={`${item.chargeLabel}-${index}`}
                style={[styles.lineItem, { borderBottomColor: theme.border }]}>
                <View style={styles.lineText}>
                  <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                    {item.studentName}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    {item.chargeLabel}
                  </ThemedText>
                </View>
                <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                  {formatCents(item.amountCents)}
                </ThemedText>
              </View>
            ))}

            <View style={styles.summaryRow}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Payment method
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textPrimary }}>
                {receipt.paymentMethodLabel}
              </ThemedText>
            </View>

            {receipt.processingFeeCents > 0 ? (
              <>
                <View style={styles.summaryRow}>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    Tuition
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.textPrimary }}>
                    {formatCents(receipt.schoolAmountCents)}
                  </ThemedText>
                </View>
                <View style={styles.summaryRow}>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    Processing fee
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.textPrimary }}>
                    {formatCents(receipt.processingFeeCents)}
                  </ThemedText>
                </View>
              </>
            ) : null}

            <View style={[styles.totalRow, { borderTopColor: theme.border }]}>
              <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                Total paid
              </ThemedText>
              <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                {formatCents(receipt.totalPaidCents)}
              </ThemedText>
            </View>
          </ScrollView>

          <Pressable
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: theme.bg }]}
            accessibilityRole="button"
            accessibilityLabel="Close">
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              Done
            </ThemedText>
          </Pressable>
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
    maxHeight: '85%',
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
  content: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
    gap: Spacing.three,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.three,
    paddingBottom: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  lineText: {
    flex: 1,
    gap: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.two,
  },
  closeButton: {
    marginHorizontal: Spacing.five,
    marginTop: Spacing.two,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
});
