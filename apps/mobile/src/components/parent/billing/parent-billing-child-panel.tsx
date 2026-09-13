import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BILLING_SECTION_GAP } from '@/components/parent/billing/billing-layout';
import { ParentBillingDueCard } from '@/components/parent/billing/parent-billing-due-card';
import { ParentBillingExpandableSection } from '@/components/parent/billing/parent-billing-expandable-section';
import { ParentBillingPaymentHistoryRow } from '@/components/parent/billing/parent-billing-payment-history-row';
import { ParentBillingSettingsCard } from '@/components/parent/billing/parent-billing-settings-card';
import { ParentTuitionPlanSelector } from '@/components/parent/billing/parent-tuition-plan-selector';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import type {
  ParentBillingChildView,
  ParentTuitionPaymentRecord,
  SavedPaymentMethodSummary,
  TuitionCharge,
} from '@/lib/parent/parent-portal-api';
import { childFirstNameFromFullName } from '@/lib/tuition/billing-helpers';
import { formatCents } from '@/lib/tuition/format-cents';
import type { ParentLastPaymentDaySummary } from '@/lib/tuition/payment-summary';

type ParentBillingChildPanelProps = {
  child: ParentBillingChildView;
  charges: TuitionCharge[];
  payments: ParentTuitionPaymentRecord[];
  autopayEnabled: boolean;
  savedPaymentMethod: SavedPaymentMethodSummary | null;
  paymentMethodLoading: boolean;
  payNowLabel: string;
  lastPaymentSummary: ParentLastPaymentDaySummary | null;
  paying: boolean;
  onPay: () => void;
  onPayExtra: () => void;
  onAutopayToggleRequest: (enabled: boolean) => void;
  onManagePaymentMethod: () => void;
  onScheduleComplete: () => void;
  onPaymentClick: (paymentId: string) => void;
  renderChargeRow: (charge: TuitionCharge) => ReactNode;
  onShowAllCharges: () => void;
};

export function ParentBillingChildPanel({
  child,
  charges,
  payments,
  autopayEnabled,
  savedPaymentMethod,
  paymentMethodLoading,
  payNowLabel,
  lastPaymentSummary,
  paying,
  onPay,
  onPayExtra,
  onAutopayToggleRequest,
  onManagePaymentMethod,
  onScheduleComplete,
  onPaymentClick,
  renderChargeRow,
  onShowAllCharges,
}: ParentBillingChildPanelProps) {
  const theme = useParentTheme();
  const firstName = childFirstNameFromFullName(child.studentName);
  const planSubtitle =
    child.paymentPlanLabel ?? `Annual ${formatCents(child.annualTuitionCents)}`;

  const childPayments = payments.filter(
    (payment) => payment.enrollmentId === child.childKey,
  );

  const canPayExtra =
    child.nextChargeId != null && child.totalRemainingCents > child.balanceDueCents;

  const openCharges = charges.filter((charge) =>
    ['scheduled', 'sent', 'overdue'].includes(charge.status),
  );

  return (
    <View style={styles.panel}>
      <Text style={[styles.planSubtitle, { color: theme.muted }]}>{planSubtitle}</Text>

      <ParentBillingDueCard
        balanceDueCents={child.balanceDueCents}
        nextCharge={child.nextCharge}
        nextChargeId={child.nextChargeId}
        payNowLabel={payNowLabel}
        paying={paying}
        autopayEnabled={autopayEnabled}
        hasPendingSchedule={child.status === 'needs_schedule'}
        lastPaymentSummary={lastPaymentSummary}
        showLastPayment
        canPayExtra={canPayExtra}
        onPay={onPay}
        onPayExtra={onPayExtra}
        testID={`parent-billing-child-${child.childKey}`}
      />

      <ParentBillingSettingsCard
        autopayEnabled={autopayEnabled}
        savedPaymentMethod={savedPaymentMethod}
        paymentMethodLoading={paymentMethodLoading}
        onAutopayToggleRequest={onAutopayToggleRequest}
        onManagePaymentMethod={onManagePaymentMethod}
      />

      {child.status === 'needs_schedule' && child.selectionItem ? (
        <ParentTuitionPlanSelector
          selectionItem={child.selectionItem}
          studentName={child.studentName}
          onComplete={onScheduleComplete}
        />
      ) : null}

      <ParentBillingExpandableSection
        title="Payment schedule"
        items={openCharges}
        onShowAll={onShowAllCharges}
        emptyMessage="No open charges"
        keyExtractor={(charge) => charge.id}
        renderItem={renderChargeRow}
      />

      <ParentBillingExpandableSection
        title={`Payments for ${firstName}`}
        items={childPayments}
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
  planSubtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
});
