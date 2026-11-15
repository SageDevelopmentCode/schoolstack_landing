import type { BillingCtx } from '@/components/parent/billing/billing-ctx';
import { BillingChargeList, BillingPaymentList } from '@/components/parent/billing/sections/billing-lists';
import { closeThen } from '@/components/parent/billing/use-parent-billing-model';
import { ParentBottomSheet } from '@/components/parent/parent-bottom-sheet';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { childFirstNameFromFullName } from '@/lib/tuition/billing-helpers';

/** The full payment schedule. Paying closes this sheet first, then opens the pay sheet. */
export function BillingChargesSheet({ ctx }: { ctx: BillingCtx }) {
  const { view, model } = ctx;
  const sheetTheme = useAdminTheme();
  const close = () => model.setChargesOpen(false);
  const charges = view.displayedCharges.filter((charge) =>
    ['scheduled', 'sent', 'overdue'].includes(charge.status),
  );
  const payFromSheet: BillingCtx = {
    ...ctx,
    view: { ...view, payCharge: (id) => closeThen(close, () => view.payCharge(id)) },
  };

  return (
    <ParentBottomSheet
      visible={model.chargesOpen}
      onClose={close}
      title="Payment schedule"
      subtitle={`${charges.length} open charge${charges.length === 1 ? '' : 's'}`}
      accessibilityLabel="Close upcoming charges">
      <BillingChargeList ctx={payFromSheet} charges={charges} surface={sheetTheme.surface} />
    </ParentBottomSheet>
  );
}

/** Every payment for the current view. Tapping one closes this sheet and opens its receipt. */
export function BillingPaymentsSheet({ ctx }: { ctx: BillingCtx }) {
  const { view, model } = ctx;
  const close = () => model.setPaymentsOpen(false);
  const title = view.activeChild
    ? `Payments for ${childFirstNameFromFullName(view.activeChild.studentName)}`
    : 'All family payments';

  return (
    <ParentBottomSheet
      visible={model.paymentsOpen}
      onClose={close}
      title={title}
      subtitle={`${view.displayedPayments.length} on file`}
      accessibilityLabel="Close payment history">
      <BillingPaymentList
        payments={view.displayedPayments}
        onOpenReceipt={(id) => closeThen(close, () => view.openReceipt(id))}
      />
    </ParentBottomSheet>
  );
}
