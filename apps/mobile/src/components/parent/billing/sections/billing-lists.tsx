import { StyleSheet, Text, View } from 'react-native';

import type { BillingCtx } from '@/components/parent/billing/billing-ctx';
import { BillingChargeTicket, BillingPaymentRow } from '@/components/parent/billing/sections/billing-rows';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GCard, GChip, GHand, GLink } from '@/components/parent/garden/ui';
import type { ParentTuitionPaymentRecord, TuitionCharge } from '@/lib/parent/parent-portal-api';
import { childFirstNameFromFullName } from '@/lib/tuition/billing-helpers';

export const BILLING_VISIBLE_ROW_LIMIT = 3;

export function BillingChargeList({
  ctx,
  charges,
  surface,
}: {
  ctx: BillingCtx;
  charges: TuitionCharge[];
  surface?: string;
}) {
  const { view } = ctx;
  return (
    <View style={styles.tickets}>
      {charges.map((charge) => (
        <BillingChargeTicket
          key={charge.id}
          charge={charge}
          studentName={view.studentNameForCharge(charge)}
          autopayEnabled={view.data.autopayEnabled}
          paying={view.payingChargeId === charge.id}
          onPay={() => view.payCharge(charge.id)}
          surface={surface}
        />
      ))}
    </View>
  );
}

export function BillingPaymentList({
  payments,
  onOpenReceipt,
}: {
  payments: ParentTuitionPaymentRecord[];
  onOpenReceipt: (paymentId: string) => void;
}) {
  return (
    <View style={styles.notebook}>
      {payments.map((payment, i) => (
        <BillingPaymentRow
          key={payment.id}
          payment={payment}
          first={i === 0}
          onPress={() => onOpenReceipt(payment.id)}
        />
      ))}
    </View>
  );
}

/** Upcoming charges (family) or "Payment schedule" (child): first 3, then the full list in a sheet. */
export function BillingChargesSection({ ctx, index = 0 }: { ctx: BillingCtx; index?: number }) {
  const { view, model } = ctx;
  const charges = view.displayedCharges.filter((charge) =>
    ['scheduled', 'sent', 'overdue'].includes(charge.status),
  );
  const visible = charges.slice(0, BILLING_VISIBLE_ROW_LIMIT);
  const more = charges.length > BILLING_VISIBLE_ROW_LIMIT;
  const title = view.activeChild ? 'Payment schedule' : 'Upcoming charges';

  return (
    <GCard
      index={index}
      title={title}
      action={charges.length > 0 ? <GChip label={`${charges.length} open`} /> : undefined}>
      {charges.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No open charges</Text>
          <GHand>nothing on the calendar ✿</GHand>
        </View>
      ) : (
        <>
          <BillingChargeList ctx={ctx} charges={visible} />
          {more ? (
            <GLink
              label={`View full schedule (${charges.length})`}
              accessibilityLabel={`Show all ${charges.length}`}
              onPress={() => model.setChargesOpen(true)}
              style={styles.more}
            />
          ) : null}
        </>
      )}
    </GCard>
  );
}

/** Payment history: first 3, then everything in a sheet. Each row opens its receipt. */
export function BillingPaymentsSection({ ctx, index = 0 }: { ctx: BillingCtx; index?: number }) {
  const { view, model } = ctx;
  const payments = view.displayedPayments;
  const visible = payments.slice(0, BILLING_VISIBLE_ROW_LIMIT);
  const title = view.activeChild
    ? `Payments for ${childFirstNameFromFullName(view.activeChild.studentName)}`
    : 'All family payments';

  return (
    <GCard
      index={index}
      title={title}
      action={payments.length > 0 ? <GChip tone="success" label={`${payments.length} on file`} /> : undefined}>
      {payments.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No payments yet</Text>
        </View>
      ) : (
        <>
          <BillingPaymentList payments={visible} onOpenReceipt={view.openReceipt} />
          {payments.length > BILLING_VISIBLE_ROW_LIMIT ? (
            <GLink
              label={`See all payments (${payments.length})`}
              accessibilityLabel={`Show all ${payments.length}`}
              onPress={() => model.setPaymentsOpen(true)}
              style={styles.more}
            />
          ) : null}
        </>
      )}
    </GCard>
  );
}

const styles = StyleSheet.create({
  tickets: {
    marginTop: 12,
    gap: 10,
  },
  notebook: {
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Garden.ink10,
    backgroundColor: Garden.notebook,
    overflow: 'hidden',
  },
  more: {
    marginTop: 10,
  },
  empty: {
    marginTop: 8,
    gap: 2,
  },
  emptyText: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    color: Garden.soft,
  },
});
