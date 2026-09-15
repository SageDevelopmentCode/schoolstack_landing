import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryFonts } from '@/constants/story-theme';
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
  const theme = useParentTheme();
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
              backgroundColor: Story.white,
              borderColor: theme.line,
              paddingBottom: insets.bottom + Spacing.four,
            },
          ]}>
          <View style={styles.handleRow}>
            <View style={[styles.handle, { backgroundColor: theme.line }]} />
          </View>

          <View style={[styles.header, { borderBottomColor: theme.line }]}>
            <Text style={[styles.title, { color: theme.ink }]}>Payment receipt</Text>
            <Text style={[styles.subtitle, { color: theme.muted }]}>{receipt.paidAtLabel}</Text>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {receipt.lineItems.map((item, index) => (
              <View
                key={`${item.chargeLabel}-${index}`}
                style={[styles.lineItem, { borderBottomColor: theme.line }]}>
                <View style={styles.lineText}>
                  <Text style={[styles.lineTitle, { color: theme.ink }]}>{item.studentName}</Text>
                  <Text style={[styles.lineMeta, { color: theme.muted }]}>{item.chargeLabel}</Text>
                </View>
                <Text style={[styles.lineAmount, { color: theme.ink }]}>
                  {formatCents(item.amountCents)}
                </Text>
              </View>
            ))}

            <View style={styles.summaryRow}>
              <Text style={[styles.lineMeta, { color: theme.muted }]}>Payment method</Text>
              <Text style={[styles.lineMeta, { color: theme.ink }]}>
                {receipt.paymentMethodLabel}
              </Text>
            </View>

            {receipt.processingFeeCents > 0 ? (
              <>
                <View style={styles.summaryRow}>
                  <Text style={[styles.lineMeta, { color: theme.muted }]}>Tuition</Text>
                  <Text style={[styles.lineMeta, { color: theme.ink }]}>
                    {formatCents(receipt.schoolAmountCents)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.lineMeta, { color: theme.muted }]}>Processing fee</Text>
                  <Text style={[styles.lineMeta, { color: theme.ink }]}>
                    {formatCents(receipt.processingFeeCents)}
                  </Text>
                </View>
              </>
            ) : null}

            <View style={[styles.totalRow, { borderTopColor: theme.line }]}>
              <Text style={[styles.totalLabel, { color: theme.ink }]}>Total paid</Text>
              <Text style={[styles.totalLabel, { color: theme.ink }]}>
                {formatCents(receipt.totalPaidCents)}
              </Text>
            </View>
          </ScrollView>

          <Pressable
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: theme.paper }]}
            accessibilityRole="button"
            accessibilityLabel="Close">
            <Text style={[styles.doneLabel, { color: theme.primary }]}>Done</Text>
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
  title: {
    fontFamily: StoryFonts.display,
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    marginTop: 4,
  },
  lineTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '600',
  },
  lineMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
  lineAmount: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '600',
  },
  totalLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '600',
  },
  doneLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '600',
  },
});
