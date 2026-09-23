import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
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

export function ParentBillingPaymentReceiptSheet({
  visible,
  receipt,
  onClose,
}: ParentBillingPaymentReceiptSheetProps) {
  const theme = useParentTheme();

  if (!receipt) return null;

  return (
    <BottomSheetShell
      visible={visible}
      onClose={onClose}
      accessibilityLabel="Close receipt"
      backgroundColor={Story.white}
      borderColor={theme.line}
      handleColor={theme.line}
      maxHeight="85%"
      header={
        <View style={[styles.header, { borderBottomColor: theme.line }]}>
          <Text style={[styles.title, { color: theme.ink }]}>Payment receipt</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>{receipt.paidAtLabel}</Text>
        </View>
      }
      scrollContentStyle={styles.content}
      footer={
        <Pressable
          onPress={onClose}
          style={[styles.closeButton, { backgroundColor: theme.paper }]}
          accessibilityRole="button"
          accessibilityLabel="Close">
          <Text style={[styles.doneLabel, { color: theme.primary }]}>Done</Text>
        </Pressable>
      }>
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
    </BottomSheetShell>
  );
}

const styles = StyleSheet.create({
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
