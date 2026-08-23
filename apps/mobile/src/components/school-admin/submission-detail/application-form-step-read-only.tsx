import { StyleSheet, View } from 'react-native';

import { ReadOnlyFieldRow } from '@/components/school-admin/submission-detail/read-only-field-row';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Spacing } from '@/constants/theme';
import { formatFeeAmount } from '@/lib/admissions/application-form-schema';
import type { ApplicationFormStepWithStatus } from '@/lib/admissions/application-form-steps';
import type { ApplicationDetail } from '@/lib/admissions/application-detail';
import { FEE_STATUS_LABELS } from '@/lib/admissions/application-status-ui';
import { formatReadOnlyFieldValue } from '@/lib/admissions/read-only-field-utils';

type ApplicationFormStepReadOnlyProps = {
  step: ApplicationFormStepWithStatus;
  detail: ApplicationDetail;
  feeStatus: string;
};

export function ApplicationFormStepReadOnly({
  step,
  detail,
  feeStatus,
}: ApplicationFormStepReadOnlyProps) {
  const theme = useAdminTheme();

  if (step.kind === 'fee') {
    const amount = formatFeeAmount(detail.feeConfig.amount_cents ?? 0);
    const statusLabel = FEE_STATUS_LABELS[feeStatus] ?? feeStatus.replace(/_/g, ' ');
    const isPaid =
      feeStatus === 'paid' || feeStatus === 'not_required' || feeStatus === 'waived';

    return (
      <View style={styles.container}>
        <ReadOnlyFieldRow label="Amount due" value={amount} />
        <ThemedText
          type="smallBold"
          style={{ color: isPaid ? theme.success : theme.textSecondary }}>
          {statusLabel}
        </ThemedText>
      </View>
    );
  }

  if (step.kind === 'acknowledgments') {
    const acknowledgments = detail.schema.acknowledgments;
    if (acknowledgments.length === 0) {
      return (
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          No acknowledgments for this form.
        </ThemedText>
      );
    }

    return (
      <View style={styles.container}>
        {acknowledgments.map((ack) => (
          <ReadOnlyFieldRow
            key={ack.id}
            label={ack.label}
            value={detail.acknowledgments[ack.id] ? 'Yes' : 'No'}
          />
        ))}
      </View>
    );
  }

  const section = detail.schema.sections.find((entry) => entry.id === step.id);
  if (!section) {
    return (
      <ThemedText type="small" style={{ color: theme.textSecondary }}>
        Step not found.
      </ThemedText>
    );
  }

  if (section.fields.length === 0) {
    return (
      <ThemedText type="small" style={{ color: theme.textSecondary }}>
        No fields in this step.
      </ThemedText>
    );
  }

  return (
    <View style={styles.container}>
      {section.fields.map((field) => (
        <ReadOnlyFieldRow
          key={field.id}
          label={field.label}
          value={formatReadOnlyFieldValue(field, detail.responses[field.id])}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
});
