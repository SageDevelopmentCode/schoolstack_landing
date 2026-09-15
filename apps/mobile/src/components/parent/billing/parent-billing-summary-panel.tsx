import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { BILLING_SECTION_GAP } from '@/components/parent/billing/billing-layout';
import { ParentBillingByStudentSection } from '@/components/parent/billing/parent-billing-by-student-section';
import { ParentBillingDueCard } from '@/components/parent/billing/parent-billing-due-card';
import { ParentBillingExpandableSection } from '@/components/parent/billing/parent-billing-expandable-section';
import { ParentBillingPaymentHistoryRow } from '@/components/parent/billing/parent-billing-payment-history-row';
import { ParentBillingSettingsCard } from '@/components/parent/billing/parent-billing-settings-card';
import type {
  ParentBillingChildView,
  ParentBillingFamilySummary,
  ParentTuitionPaymentRecord,
  SavedPaymentMethodSummary,
  TuitionCharge,
} from '@/lib/parent/parent-portal-api';
import type { ParentLastPaymentDaySummary } from '@/lib/tuition/payment-summary';

type ParentBillingSummaryPanelProps = {
  summary: ParentBillingFamilySummary;
  childViews: ParentBillingChildView[];
  payments: ParentTuitionPaymentRecord[];
  charges: TuitionCharge[];
  autopayEnabled: boolean;
  savedPaymentMethod: SavedPaymentMethodSummary | null;
  paymentMethodLoading: boolean;
  familyPayNowLabel: string;
  nextChargeId: string | null;
  lastPaymentSummary: ParentLastPaymentDaySummary | null;
  paying: boolean;
  onPay: () => void;
  onAutopayToggleRequest: (enabled: boolean) => void;
  onManagePaymentMethod: () => void;
  onSelectChild: (childKey: string) => void;
  onPaymentClick: (paymentId: string) => void;
  renderChargeRow: (charge: TuitionCharge) => ReactNode;
  onShowAllCharges: () => void;
};

export function ParentBillingSummaryPanel({
  summary,
  childViews,
  payments,
  charges,
  autopayEnabled,
  savedPaymentMethod,
  paymentMethodLoading,
  familyPayNowLabel,
  nextChargeId,
  lastPaymentSummary,
  paying,
  onPay,
  onAutopayToggleRequest,
  onManagePaymentMethod,
  onSelectChild,
  onPaymentClick,
  renderChargeRow,
  onShowAllCharges,
}: ParentBillingSummaryPanelProps) {
  const openCharges = charges.filter((charge) =>
    ['scheduled', 'sent', 'overdue'].includes(charge.status),
  );

  return (
    <View style={styles.panel} testID="parent-billing-summary-panel">
      <ParentBillingDueCard
        balanceDueCents={summary.balanceDueCents}
        nextCharge={summary.nextCharge}
        nextChargeId={nextChargeId}
        payNowLabel={familyPayNowLabel}
        paying={paying}
        autopayEnabled={autopayEnabled}
        hasMultipleChildren={childViews.length > 1}
        hasPendingSchedule={summary.hasPendingSchedule}
        familyTotalRemainingCents={summary.familyTotalRemainingCents}
        showEstimatedAnnual={
          summary.hasPendingSchedule && summary.balanceDueCents === 0
        }
        estimatedAnnualCents={summary.annualTuitionCents}
        lastPaymentSummary={lastPaymentSummary}
        showLastPayment
        onPay={onPay}
      />

      <ParentBillingSettingsCard
        autopayEnabled={autopayEnabled}
        savedPaymentMethod={savedPaymentMethod}
        paymentMethodLoading={paymentMethodLoading}
        onAutopayToggleRequest={onAutopayToggleRequest}
        onManagePaymentMethod={onManagePaymentMethod}
      />

      <ParentBillingByStudentSection childViews={childViews} onSelectChild={onSelectChild} />

      <ParentBillingExpandableSection
        title="Upcoming charges"
        items={openCharges}
        onShowAll={onShowAllCharges}
        emptyMessage="No open charges"
        keyExtractor={(charge) => charge.id}
        renderItem={renderChargeRow}
      />

      <ParentBillingExpandableSection
        title="All family payments"
        items={payments}
        emptyMessage="No payments yet"
        keyExtractor={(payment) => payment.id}
        renderItem={(payment) => (
          <ParentBillingPaymentHistoryRow
            payment={payment}
            onPress={() => onPaymentClick(payment.id)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: BILLING_SECTION_GAP,
  },
});
