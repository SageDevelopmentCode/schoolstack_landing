import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BillingStepStrip } from '@/components/parent/billing/sections/billing-step-strip';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GCard, GDashedRule, GPressable, GToyButton } from '@/components/parent/garden/ui';
import type { FamilyTuitionSelectionItem } from '@/lib/parent/parent-portal-api';
import { saveEnrollmentPaymentPlan } from '@/lib/parent/parent-portal-api';
import { formatCents } from '@/lib/tuition/format-cents';
import {
  computeInstallmentAmountCents,
  filterPaymentPlansForBillingStart,
  maxInstallmentsForBillingStart,
  paymentScheduleCadence,
  schoolYearMonthSpan,
} from '@/lib/tuition/plan-selector-helpers';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

function possessiveFirstName(fullName: string): string {
  const firstName = fullName.trim().split(/\s+/)[0] ?? fullName;
  if (!firstName) return 'Your';
  return `${firstName}'s`;
}

/**
 * Pick a plan · preview it · confirm. Garden version of the old
 * ParentTuitionPlanSelector: same data, same save call, same error reporting.
 */
export function BillingScheduleSetup({
  organizationId,
  selectionItem,
  studentName,
  guard,
  onConfirmed,
  onLayout,
  index = 0,
}: {
  organizationId: string;
  selectionItem: FamilyTuitionSelectionItem;
  studentName?: string;
  /** Wraps the confirm action with the read-only preview check. */
  guard: (action: () => void) => () => void;
  onConfirmed: () => void;
  onLayout?: (y: number) => void;
  index?: number;
}) {
  const accent = useGardenAccent();
  const { reportError } = useMobileErrorReporter(organizationId);
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
      ? maxInstallmentsForBillingStart(ratePlan.effectiveStart, ratePlan.effectiveEnd, billingStart)
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
  const selectedPlan = availablePaymentPlans.find((plan) => plan.id === selectedPlanId) ?? null;
  const selectedAmountCents = selectedPlan
    ? computeInstallmentAmountCents(annualAmountCents, selectedPlan.installmentCount)
    : 0;

  const handleConfirm = async () => {
    if (!selectedPlanId) {
      setError('Select a payment schedule.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await saveEnrollmentPaymentPlan(assignment.enrollmentId, selectedPlanId);
      onConfirmed();
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
    <GCard
      index={index}
      kicker="Pick a plan · preview it · confirm"
      title={heading}
      testID="parent-tuition-plan-selector"
      onLayout={onLayout}
      style={{ borderColor: accent.clay, borderWidth: 2 }}>
      <Text style={styles.sub}>Required before tuition charges are generated.</Text>
      <Text style={styles.sub}>
        Annual tuition {formatCents(annualAmountCents)} · {ratePlan.name}
        {tier ? ` (${tier.label})` : ''} for the school year.
      </Text>

      <View style={styles.strip}>
        <BillingStepStrip
          steps={[
            { label: 'Pick a plan', state: selectedPlan ? 'done' : 'current' },
            { label: 'Preview', state: selectedPlan ? 'current' : 'todo' },
            { label: 'Confirm', state: 'todo' },
          ]}
        />
      </View>

      <View style={styles.plans} accessibilityRole="radiogroup">
        {availablePaymentPlans.map((plan) => {
          const amountCents = computeInstallmentAmountCents(annualAmountCents, plan.installmentCount);
          const selected = selectedPlanId === plan.id;
          const cadence = paymentScheduleCadence(plan.installmentCount, schoolYearMonths);
          return (
            <GPressable
              key={plan.id}
              accessibilityRole="radio"
              accessibilityState={{ selected, checked: selected }}
              accessibilityLabel={`${plan.name}, ${cadence}, ${formatCents(amountCents)} per payment`}
              haptic="select"
              pressedScale={0.98}
              onPress={() => {
                setSelectedPlanId(plan.id);
                setError(null);
              }}
              style={[
                styles.plan,
                selected
                  ? { borderColor: accent.clay, backgroundColor: accent.wash }
                  : { borderColor: Garden.ink12, backgroundColor: Garden.white },
              ]}>
              <View
                style={[
                  styles.radio,
                  selected && { borderColor: accent.clay, backgroundColor: accent.clay },
                ]}>
                {selected ? <Ionicons name="checkmark" size={14} color={Garden.white} /> : null}
              </View>
              <View style={styles.planCopy}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planMeta}>{cadence}</Text>
              </View>
              <View style={styles.planAmounts}>
                <Text style={styles.planAmount}>{formatCents(amountCents)}</Text>
                <Text style={styles.planMeta}>per payment</Text>
              </View>
            </GPressable>
          );
        })}
      </View>

      {selectedPlan ? (
        <View style={styles.preview} accessibilityLabel="Plan preview">
          <Text style={styles.previewKicker}>Preview</Text>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>{selectedPlan.name}</Text>
            <Text style={styles.previewValue}>{formatCents(selectedAmountCents)} per payment</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>
              {paymentScheduleCadence(selectedPlan.installmentCount, schoolYearMonths)}
            </Text>
            <Text style={styles.previewValue}>
              {formatCents(selectedAmountCents * selectedPlan.installmentCount)} annual total
            </Text>
          </View>
          {enrollmentFees.length > 0 ? (
            <>
              <GDashedRule style={styles.rule} />
              <Text style={styles.previewKicker}>Due at enrollment</Text>
              {enrollmentFees.map((fee) => (
                <View key={fee.id} style={styles.previewRow}>
                  <Text style={styles.previewLabel}>{fee.label}</Text>
                  <Text style={styles.previewValue}>{formatCents(fee.amountCents)}</Text>
                </View>
              ))}
            </>
          ) : null}
        </View>
      ) : null}

      {error ? (
        <View style={styles.error} accessibilityRole="alert">
          <Ionicons name="alert-circle" size={16} color="#7E4533" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <GToyButton
        size="md"
        fullWidth
        icon="checkmark"
        label={saving ? 'Saving…' : 'Confirm schedule'}
        loading={saving}
        onPress={guard(() => void handleConfirm())}
        style={styles.confirm}
      />
    </GCard>
  );
}

const styles = StyleSheet.create({
  sub: {
    marginTop: 4,
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 18,
    color: Garden.soft,
  },
  strip: {
    marginTop: 16,
    alignItems: 'center',
  },
  plans: {
    marginTop: 14,
    gap: 8,
  },
  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Garden.ink25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planCopy: {
    flex: 1,
    gap: 2,
  },
  planName: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 15,
    color: Garden.ink,
  },
  planMeta: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 12,
    color: Garden.soft,
  },
  planAmounts: {
    alignItems: 'flex-end',
  },
  planAmount: {
    fontFamily: GardenFonts.display,
    fontSize: 20,
    color: Garden.ink,
  },
  preview: {
    marginTop: 14,
    padding: 14,
    gap: 6,
    borderRadius: 14,
    backgroundColor: Garden.notebook,
    borderWidth: 1,
    borderColor: Garden.ink10,
  },
  previewKicker: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: Garden.soft,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  previewLabel: {
    flex: 1,
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    color: Garden.ink65,
  },
  previewValue: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
    color: Garden.ink,
  },
  rule: {
    marginVertical: 4,
  },
  error: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 12,
    backgroundColor: Garden.peach,
  },
  errorText: {
    flex: 1,
    fontFamily: GardenFonts.bodyBold,
    fontSize: 13,
    color: '#7E4533',
  },
  confirm: {
    marginTop: 16,
  },
});
