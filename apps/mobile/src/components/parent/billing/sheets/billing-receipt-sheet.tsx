import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GDashedRule, GOutlineButton } from '@/components/parent/garden/ui';
import { ParentBottomSheet } from '@/components/parent/parent-bottom-sheet';
import { formatCents } from '@/lib/tuition/format-cents';
import type { TuitionPaymentReceiptDetail } from '@/lib/tuition/payment-receipt';

/** Payment receipt: same rows as before, laid out as a paper receipt. */
export function BillingReceiptSheet({
  visible,
  receipt,
  onClose,
}: {
  visible: boolean;
  receipt: TuitionPaymentReceiptDetail | null;
  onClose: () => void;
}) {
  if (!receipt) return null;

  return (
    <ParentBottomSheet
      visible={visible}
      onClose={onClose}
      title="Payment receipt"
      subtitle={receipt.paidAtLabel}
      accessibilityLabel="Close receipt">
      <View style={styles.paper}>
        {receipt.lineItems.map((item, index) => (
          <View key={`${item.chargeLabel}-${index}`} style={styles.line}>
            <View style={styles.lineCopy}>
              <Text style={styles.lineTitle}>{item.studentName}</Text>
              <Text style={styles.lineMeta}>{item.chargeLabel}</Text>
            </View>
            <Text style={styles.lineAmount}>{formatCents(item.amountCents)}</Text>
          </View>
        ))}

        <GDashedRule color={Garden.ink25} />

        <Row label="Payment method" value={receipt.paymentMethodLabel} />
        {receipt.processingFeeCents > 0 ? (
          <>
            <Row label="Tuition" value={formatCents(receipt.schoolAmountCents)} />
            <Row label="Processing fee" value={formatCents(receipt.processingFeeCents)} />
          </>
        ) : null}

        <View style={styles.total}>
          <Text style={styles.totalLabel}>Total paid</Text>
          <Text style={styles.totalValue}>{formatCents(receipt.totalPaidCents)}</Text>
        </View>
      </View>

      <GOutlineButton label="Done" accessibilityLabel="Close" onPress={onClose} style={styles.done} />
    </ParentBottomSheet>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  paper: {
    gap: 10,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Garden.ink10,
    backgroundColor: Garden.notebook,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lineCopy: {
    flex: 1,
  },
  lineTitle: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 15,
    color: Garden.ink,
  },
  lineMeta: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    color: Garden.soft,
  },
  lineAmount: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 15,
    color: Garden.ink,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowLabel: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    color: Garden.soft,
  },
  rowValue: {
    fontFamily: GardenFonts.bodyBold,
    fontSize: 14,
    color: Garden.ink,
  },
  total: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1.5,
    borderTopColor: Garden.ink,
  },
  totalLabel: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 16,
    color: Garden.ink,
  },
  totalValue: {
    fontFamily: GardenFonts.display,
    fontSize: 26,
    color: Garden.ink,
  },
  done: {
    alignSelf: 'stretch',
    minHeight: 48,
  },
});
