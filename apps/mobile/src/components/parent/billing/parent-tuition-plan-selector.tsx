import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryButton } from '@/components/story/story-button';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts, StoryRadius } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import type { FamilyTuitionSelectionItem } from '@/lib/parent/parent-portal-api';
import { saveEnrollmentPaymentPlan } from '@/lib/parent/parent-portal-api';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';
import {
  computeInstallmentAmountCents,
  filterPaymentPlansForBillingStart,
  maxInstallmentsForBillingStart,
  paymentScheduleCadence,
  schoolYearMonthSpan,
} from '@/lib/tuition/plan-selector-helpers';
import { formatCents } from '@/lib/tuition/format-cents';

type ParentTuitionPlanSelectorProps = {
  selectionItem: FamilyTuitionSelectionItem;
  studentName?: string;
  onComplete: () => void;
};

function possessiveFirstName(fullName: string): string {
  const firstName = fullName.trim().split(/\s+/)[0] ?? fullName;
  if (!firstName) return 'Your';
  return `${firstName}'s`;
}

export function ParentTuitionPlanSelector({
  selectionItem,
  studentName,
  onComplete,
}: ParentTuitionPlanSelectorProps) {
  const { reportError } = useMobileErrorReporter();
  const theme = useParentTheme();
  const { assignment, ratePlan } = selectionItem.context;
  const tier =
    ratePlan.tiers.find((item) => item.id === assignment.rateTierId) ??
    ratePlan.tiers.find((item) => item.isDefault) ??
    ratePlan.tiers[0];
  const annualAmountCents = tier?.amountCents ?? ratePlan.amountCents;
  const billingStart = assignment.effectiveStart ?? ratePlan.effectiveStart ?? null;
  const schoolYearMonths = schoolYearMonthSpan(
    billingStart ?? ratePlan.effectiveStart,
    ratePlan.effectiveEnd,
  );
  const availablePaymentPlans = filterPaymentPlansForBillingStart(
    ratePlan.paymentPlans,
    billingStart
      ? maxInstallmentsForBillingStart(
          ratePlan.effectiveStart,
          ratePlan.effectiveEnd,
          billingStart,
        )
      : null,
  );
  const enrollmentFees = ratePlan.feeComponents.filter((fee) => fee.timing === 'enrollment');

  const [selectedPlanId, setSelectedPlanId] = useState(
    assignment.paymentPlanId ||
      availablePaymentPlans.find((plan) => plan.isDefault)?.id ||
      availablePaymentPlans[0]?.id ||
      '',
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heading = studentName
    ? `${possessiveFirstName(studentName)} payment schedule`
    : 'Your payment schedule';

  const handleConfirm = async () => {
    if (!selectedPlanId) {
      setError('Select a payment schedule.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await saveEnrollmentPaymentPlan(assignment.enrollmentId, selectedPlanId);
      onComplete();
    } catch (err) {
      reportError('parent_billing_payment_plan_save', err, {
        entityType: 'enrollment',
        entityId: assignment.enrollmentId,
      });
      setError(err instanceof Error ? err.message : 'Failed to save payment schedule.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.white, borderColor: theme.warning },
      ]}
      testID="parent-tuition-plan-selector">
      <View>
        <Text style={[styles.heading, { color: theme.ink }]}>{heading}</Text>
        <Text style={[styles.subheading, { color: theme.muted }]}>
          Required before tuition charges are generated.
        </Text>
        <Text style={[styles.subheading, { color: theme.muted }]}>
          Annual tuition {formatCents(annualAmountCents)} · {ratePlan.name}
          {tier ? ` (${tier.label})` : ''} for the school year.
        </Text>
      </View>

      <View style={styles.planList}>
        {availablePaymentPlans.map((plan) => {
          const amountCents = computeInstallmentAmountCents(
            annualAmountCents,
            plan.installmentCount,
          );
          const selected = selectedPlanId === plan.id;

          return (
            <Pressable
              key={plan.id}
              onPress={() => setSelectedPlanId(plan.id)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={[
                styles.planCard,
                {
                  borderColor: selected ? theme.primary : theme.line,
                  backgroundColor: selected ? theme.primarySoft : theme.white,
                },
              ]}>
              <Text style={[styles.planName, { color: theme.ink }]}>{plan.name}</Text>
              <Text style={[styles.planMeta, { color: theme.muted }]}>
                {paymentScheduleCadence(plan.installmentCount, schoolYearMonths)}
              </Text>
              <Text style={[styles.planAmount, { color: theme.ink }]}>
                {formatCents(amountCents)} per payment
              </Text>
              <Text style={[styles.planTotal, { color: theme.muted }]}>
                {formatCents(amountCents * plan.installmentCount)} annual total
              </Text>
            </Pressable>
          );
        })}
      </View>

      {enrollmentFees.length > 0 ? (
        <View style={[styles.feesBox, { backgroundColor: theme.paper, borderColor: theme.line }]}>
          <Text style={[styles.feesTitle, { color: theme.ink }]}>Due at enrollment</Text>
          {enrollmentFees.map((fee) => (
            <View key={fee.id} style={styles.feeRow}>
              <Text style={[styles.feeLabel, { color: theme.muted }]}>{fee.label}</Text>
              <Text style={[styles.feeAmount, { color: theme.ink }]}>
                {formatCents(fee.amountCents)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {error ? (
        <Text style={[styles.error, { color: theme.alert }]}>{error}</Text>
      ) : null}

      <StoryButton
        label={saving ? 'Saving…' : 'Confirm schedule'}
        onPress={() => void handleConfirm()}
        disabled={saving}
        trailingIcon={saving ? <ActivityIndicator color="#FFFFFF" size="small" /> : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: StoryRadius.card,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  heading: {
    fontFamily: StoryFonts.display,
    fontSize: 18,
    fontWeight: '600',
  },
  subheading: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  planList: {
    gap: Spacing.two,
  },
  planCard: {
    borderRadius: StoryRadius.cardCompact,
    borderWidth: 1.5,
    padding: Spacing.four,
    gap: 4,
  },
  planName: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
    fontWeight: '600',
  },
  planMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
  planAmount: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    marginTop: 4,
  },
  planTotal: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
  feesBox: {
    borderRadius: StoryRadius.cardCompact,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  feesTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  feeLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    flex: 1,
  },
  feeAmount: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
  },
  error: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
  },
});
