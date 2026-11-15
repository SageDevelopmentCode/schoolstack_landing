import { StyleSheet, Text, View } from 'react-native';

import { GSheet } from '@/components/parent/garden/sheet';
import { Garden } from '@/components/parent/garden/tokens';
import { GChip, GKicker, gText } from '@/components/parent/garden/ui';
import type { ApplicationDetail } from '@/lib/admissions/application-detail';
import { formatFeeAmount } from '@/lib/admissions/application-form-schema';
import type { ApplicationFormStepWithStatus } from '@/lib/admissions/application-form-steps';
import { FEE_STATUS_LABELS } from '@/lib/admissions/application-status-ui';
import { statusChip } from '@/lib/parent/parent-children-garden';
import { formatReadOnlyFieldValue } from '@/lib/admissions/read-only-field-utils';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field} accessible accessibilityLabel={`${label}: ${value || 'Not provided'}`}>
      <GKicker>{label}</GKicker>
      <Text style={[gText.body, !value && styles.empty]}>{value || 'Not provided'}</Text>
    </View>
  );
}

function StepBody({ step, detail }: { step: ApplicationFormStepWithStatus; detail: ApplicationDetail }) {
  const feeStatus = detail.feeStatus ?? 'not_required';
  if (step.kind === 'fee') {
    const isPaid = feeStatus === 'paid' || feeStatus === 'not_required' || feeStatus === 'waived';
    return (
      <View style={styles.card}>
        <Field label="Amount due" value={formatFeeAmount(detail.feeConfig.amount_cents ?? 0)} />
        <GChip
          label={FEE_STATUS_LABELS[feeStatus] ?? feeStatus.replace(/_/g, ' ')}
          tone={isPaid ? 'success' : 'neutral'}
        />
      </View>
    );
  }

  if (step.kind === 'acknowledgments') {
    const acks = detail.schema.acknowledgments;
    if (acks.length === 0) return <Text style={gText.meta}>No acknowledgments for this form.</Text>;
    return (
      <View style={styles.card}>
        {acks.map((ack) => (
          <Field key={ack.id} label={ack.label} value={detail.acknowledgments[ack.id] ? 'Yes' : 'No'} />
        ))}
      </View>
    );
  }

  const section = detail.schema.sections.find((entry) => entry.id === step.id);
  if (!section) return <Text style={gText.meta}>Step not found.</Text>;
  if (section.fields.length === 0) return <Text style={gText.meta}>No fields in this step.</Text>;
  return (
    <View style={styles.card}>
      {section.fields.map((field) => (
        <Field
          key={field.id}
          label={field.label}
          value={formatReadOnlyFieldValue(field, detail.responses[field.id])}
        />
      ))}
    </View>
  );
}

/** Read-only view of one submitted application step. */
export function ApplicationStepSheet({
  step,
  detail,
  onClose,
}: {
  step: ApplicationFormStepWithStatus | null;
  detail: ApplicationDetail;
  onClose: () => void;
}) {
  const chip = step ? statusChip(step.status) : null;
  return (
    <GSheet
      visible={step !== null}
      onClose={onClose}
      accessibilityLabel="Close step details"
      kicker="Application"
      title={step?.label ?? ''}
      subtitle="What you submitted"
      headerAside={chip ? <GChip label={chip.label} tone={chip.tone} /> : null}>
      {step ? <StepBody step={step} detail={detail} /> : null}
    </GSheet>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
  },
  field: { gap: 3 },
  empty: { color: Garden.soft },
});
