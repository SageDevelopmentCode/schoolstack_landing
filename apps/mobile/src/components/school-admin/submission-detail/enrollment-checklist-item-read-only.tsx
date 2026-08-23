import { StyleSheet, View } from 'react-native';

import { FormattedDocumentText } from '@/components/admissions/formatted-document-text';
import { ReadOnlyFieldRow } from '@/components/school-admin/submission-detail/read-only-field-row';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Spacing } from '@/constants/theme';
import { formatFeeAmount } from '@/lib/admissions/application-form-schema';
import {
  isMultiEntryResponses,
  normalizeFormResponses,
} from '@/lib/admissions/checklist-form-responses';
import {
  hasPaymentBreakdown,
  type EnrollmentChecklistItem,
  type EnrollmentChecklistItemInstance,
} from '@/lib/admissions/enrollment-checklist';
import type { ChecklistFormResponses } from '@/lib/admissions/checklist-form-responses';
import {
  parseAgreementConsentValue,
  parseAgreementSectionSignatures,
  signaturesBySectionId,
} from '@/lib/admissions/enrollment-agreement-progress';
import {
  formatReadOnlyFieldValue,
  parseChecklistFileResponses,
  parseStoredSignerName,
} from '@/lib/admissions/read-only-field-utils';
import { PaymentFeeBreakdown } from '@/components/school-admin/submission-detail/payment-fee-breakdown';

type EnrollmentChecklistItemReadOnlyProps = {
  item: EnrollmentChecklistItem;
  instance: EnrollmentChecklistItemInstance | null;
};

function paymentStatusLabel(status: string | undefined): string {
  switch (status) {
    case 'paid':
      return 'Paid';
    case 'pending':
      return 'Pending';
    case 'waived':
      return 'Waived';
    case 'not_required':
      return 'Not required';
    default:
      return 'Not started';
  }
}

export function EnrollmentChecklistItemReadOnly({
  item,
  instance,
}: EnrollmentChecklistItemReadOnlyProps) {
  const theme = useAdminTheme();
  const responses = instance?.responses ?? {};
  const instanceStatus = instance?.status ?? 'not_started';

  if (instanceStatus === 'not_started') {
    return (
      <ThemedText type="small" style={{ color: theme.textSecondary }}>
        Not started yet.
      </ThemedText>
    );
  }

  switch (item.type) {
    case 'form': {
      const formSchema = item.formSchema;
      if (!formSchema) {
        return (
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            No form fields configured.
          </ThemedText>
        );
      }

      const normalized = normalizeFormResponses(
        responses as ChecklistFormResponses,
        Boolean(formSchema.allowMultiple),
      );

      if (isMultiEntryResponses(normalized)) {
        return (
          <View style={styles.container}>
            {normalized.entries.map((entry, index) => (
              <View key={entry.id} style={styles.entryBlock}>
                <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                  Entry {index + 1}
                </ThemedText>
                {formSchema.fields.map((field) => (
                  <ReadOnlyFieldRow
                    key={`${entry.id}-${field.id}`}
                    label={field.label}
                    value={formatReadOnlyFieldValue(field, entry.values[field.id])}
                  />
                ))}
              </View>
            ))}
          </View>
        );
      }

      return (
        <View style={styles.container}>
          {formSchema.fields.map((field) => (
            <ReadOnlyFieldRow
              key={field.id}
              label={field.label}
              value={formatReadOnlyFieldValue(field, normalized[field.id])}
            />
          ))}
        </View>
      );
    }

    case 'payment': {
      const payment = item.payment;
      if (!payment) {
        return (
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            No payment configured.
          </ThemedText>
        );
      }

      return (
        <View style={styles.container}>
          <ReadOnlyFieldRow label="Status" value={paymentStatusLabel(instance?.paymentStatus)} />
          {hasPaymentBreakdown(payment) ? (
            <PaymentFeeBreakdown lineItems={payment.lineItems} totalCents={payment.amountCents} />
          ) : (
            <ReadOnlyFieldRow label="Amount due" value={formatFeeAmount(payment.amountCents)} />
          )}
        </View>
      );
    }

    case 'document_sign': {
      const sections = item.document?.kind === 'inline_sections' ? item.document.sections ?? [] : [];
      const consentOptions =
        item.document?.kind === 'inline_sections' ? item.document.consentOptions ?? [] : [];
      const sectionSignatures = parseAgreementSectionSignatures(responses);
      const signatureBySectionId = signaturesBySectionId(sectionSignatures);
      const legacySignerName = parseStoredSignerName(responses);
      const consentValue = parseAgreementConsentValue(responses);
      const consentLabel = consentOptions.find((option) => option.value === consentValue)?.label;

      return (
        <View style={styles.container}>
          {sections.map((section, index) => {
            const signature = signatureBySectionId.get(section.id);
            const isSigned = Boolean(signature);
            return (
              <View
                key={section.id}
                style={[
                  styles.sectionCard,
                  {
                    borderColor: isSigned ? theme.success : theme.border,
                    backgroundColor: isSigned ? theme.successBg : theme.surface,
                  },
                ]}>
                <View style={styles.sectionHeader}>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="small" style={{ color: theme.textTertiary }}>
                      Section {index + 1} of {sections.length}
                    </ThemedText>
                    <ThemedText type="smallBold" style={{ color: theme.textPrimary, marginTop: 2 }}>
                      {section.title}
                    </ThemedText>
                  </View>
                  <View
                    style={[
                      styles.sectionBadge,
                      {
                        backgroundColor: isSigned ? theme.success : theme.elevated,
                      },
                    ]}>
                    <ThemedText
                      type="smallBold"
                      style={{ color: isSigned ? '#FFFFFF' : theme.textSecondary, fontSize: 10 }}>
                      {isSigned ? 'Signed' : 'Not signed'}
                    </ThemedText>
                  </View>
                </View>
                {section.body ? <FormattedDocumentText content={section.body} /> : null}
                {signature ? (
                  <ReadOnlyFieldRow
                    label="Signature"
                    value={signature.signerName}
                    variant="signature"
                  />
                ) : null}
                {signature?.signedAt ? (
                  <ReadOnlyFieldRow
                    label="Signed"
                    value={new Date(signature.signedAt).toLocaleString()}
                  />
                ) : null}
              </View>
            );
          })}
          {consentLabel ? (
            <ReadOnlyFieldRow label="Consent" value={consentLabel} variant="consent" />
          ) : null}
          {sections.length === 0 ? (
            <ReadOnlyFieldRow
              label="Signature"
              value={legacySignerName || '—'}
              variant="signature"
            />
          ) : null}
        </View>
      );
    }

    case 'document_sign_pdf': {
      const fileName = item.document?.fileName;
      const signerName = parseStoredSignerName(responses);
      return (
        <View style={styles.container}>
          {fileName ? <ReadOnlyFieldRow label="Document" value={fileName} /> : null}
          <ReadOnlyFieldRow
            label="Signature"
            value={signerName || '—'}
            variant="signature"
          />
        </View>
      );
    }

    case 'file_upload': {
      const files = parseChecklistFileResponses(responses);
      if (files.length === 0) {
        return (
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            No files uploaded.
          </ThemedText>
        );
      }

      return (
        <View style={styles.container}>
          {files.map((file) => (
            <ReadOnlyFieldRow key={file.id} label="File" value={file.fileName} variant="upload" />
          ))}
        </View>
      );
    }

    case 'acknowledgment': {
      const body =
        item.acknowledgment?.body ??
        'By signing below, I confirm that the information provided is accurate.';
      const signerName = parseStoredSignerName(responses);
      return (
        <View style={styles.container}>
          <FormattedDocumentText content={body} />
          <ReadOnlyFieldRow
            label="Signature"
            value={signerName || '—'}
            variant="signature"
          />
        </View>
      );
    }

    default:
      return (
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          No details available.
        </ThemedText>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  entryBlock: {
    gap: Spacing.two,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  sectionBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
