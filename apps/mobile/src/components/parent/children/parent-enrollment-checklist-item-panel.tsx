import * as DocumentPicker from 'expo-document-picker';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { FormattedDocumentText } from '@/components/admissions/formatted-document-text';
import { ParentEmbeddedPdfPreview } from '@/components/parent/shared/parent-embedded-pdf-preview';
import { ParentFormSignatureField } from '@/components/parent/forms-documents/parent-form-signature-field';
import { StoryButton } from '@/components/story/story-button';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import {
  getAgreementInitialSectionIndex,
  parseAgreementConsentValue,
  parseAgreementSectionSignatures,
  signaturesBySectionId,
} from '@/lib/admissions/enrollment-agreement-progress';
import type {
  EnrollmentChecklistItem,
  EnrollmentChecklistItemInstance,
  LoadedEnrollmentChecklist,
} from '@/lib/admissions/enrollment-checklist';
import { formatFeeAmount } from '@/lib/admissions/application-form-schema';
import { openStripeCheckout } from '@/lib/parent/open-stripe-checkout';
import {
  createEnrollmentChecklistCheckout,
  patchEnrollmentChecklistItem,
} from '@/lib/parent/parent-enrollment-checklist-api';
import { getSupabaseClient } from '@/lib/supabase';
import { buildEmbeddedPdfViewerUrl } from '@/lib/school-bulletin/bulletin-format';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

const APPLICATION_FILES_BUCKET = 'application-files';

type ParentEnrollmentChecklistItemPanelProps = {
  item: EnrollmentChecklistItem;
  instance: EnrollmentChecklistItemInstance;
  checklist: LoadedEnrollmentChecklist;
  organizationId: string;
  applicationId: string;
  initialSectionId?: string;
  onUpdated: (checklist: LoadedEnrollmentChecklist) => void;
  onClose: () => void;
};

function buildChecklistFileStoragePath(input: {
  organizationId: string;
  checklistId: string;
  instanceId: string;
  fileName: string;
  fileId?: string;
}): string {
  const fileId = input.fileId ?? `${Date.now()}`;
  const safeName = input.fileName.replace(/[/\\]/g, '_');
  return `${input.organizationId}/enrollment-checklists/${input.checklistId}/${input.instanceId}/${fileId}_${safeName}`;
}

export function ParentEnrollmentChecklistItemPanel({
  item,
  instance,
  checklist,
  organizationId,
  applicationId,
  initialSectionId,
  onUpdated,
  onClose,
}: ParentEnrollmentChecklistItemPanelProps) {
  const theme = useParentTheme();
  const { reportError } = useMobileErrorReporter(organizationId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateInstance = useCallback(
    (patch: Partial<EnrollmentChecklistItemInstance>) => {
      const nextInstances = checklist.instances.map((row) =>
        row.id === instance.id ? { ...row, ...patch } : row,
      );
      onUpdated({ ...checklist, instances: nextInstances });
    },
    [checklist, instance.id, onUpdated],
  );

  const handleComplete = useCallback(
    async (responses?: Record<string, unknown>) => {
      updateInstance({
        status: 'completed',
        responses: responses ?? instance.responses,
      });
      onClose();
    },
    [instance.responses, onClose, updateInstance],
  );

  if (item.type === 'acknowledgment') {
    return (
      <AcknowledgmentPanel
        item={item}
        instance={instance}
        submitting={submitting}
        error={error}
        onSubmit={async (signerName) => {
          setSubmitting(true);
          setError(null);
          try {
            await patchEnrollmentChecklistItem(instance.id, { signerName });
            await handleComplete({ signerName, signedAt: new Date().toISOString() });
          } catch (submitError) {
            reportError('parent_enrollment_acknowledgment', submitError);
            setError(
              submitError instanceof Error ? submitError.message : 'Failed to sign acknowledgment.',
            );
          } finally {
            setSubmitting(false);
          }
        }}
      />
    );
  }

  if (item.type === 'document_sign_pdf') {
    return (
      <DocumentSignPdfPanel
        item={item}
        instance={instance}
        organizationId={organizationId}
        applicationId={applicationId}
        submitting={submitting}
        error={error}
        onSubmit={async (signerName) => {
          setSubmitting(true);
          setError(null);
          try {
            const result = await patchEnrollmentChecklistItem(instance.id, { signerName });
            if (result.status === 'completed') {
              await handleComplete(result.responses ?? { signerName });
              return;
            }
            updateInstance({
              status: (result.status as EnrollmentChecklistItemInstance['status']) ?? 'in_progress',
              responses: result.responses ?? instance.responses,
            });
          } catch (submitError) {
            reportError('parent_enrollment_pdf_sign', submitError);
            setError(submitError instanceof Error ? submitError.message : 'Failed to sign document.');
          } finally {
            setSubmitting(false);
          }
        }}
      />
    );
  }

  if (item.type === 'document_sign') {
    return (
      <DocumentSignInlinePanel
        item={item}
        instance={instance}
        initialSectionId={initialSectionId}
        submitting={submitting}
        error={error}
        onSubmitSection={async (body) => {
          setSubmitting(true);
          setError(null);
          try {
            const result = await patchEnrollmentChecklistItem(instance.id, body);
            if (result.status === 'completed') {
              await handleComplete(result.responses ?? instance.responses ?? {});
              return;
            }
            updateInstance({
              status: (result.status as EnrollmentChecklistItemInstance['status']) ?? 'in_progress',
              responses: result.responses ?? instance.responses,
            });
          } catch (submitError) {
            reportError('parent_enrollment_agreement_section', submitError);
            setError(
              submitError instanceof Error ? submitError.message : 'Failed to save agreement section.',
            );
          } finally {
            setSubmitting(false);
          }
        }}
        onAcknowledgeAmendment={async () => {
          setSubmitting(true);
          setError(null);
          try {
            const result = await patchEnrollmentChecklistItem(instance.id, {
              acknowledgeAgreementAmendment: true,
            });
            updateInstance({
              status: (result.status as EnrollmentChecklistItemInstance['status']) ?? instance.status,
              responses: result.responses ?? instance.responses,
            });
            if (result.status === 'completed') {
              await handleComplete(result.responses ?? instance.responses ?? {});
            }
          } catch (submitError) {
            reportError('parent_enrollment_agreement_amendment', submitError);
            setError(
              submitError instanceof Error ? submitError.message : 'Failed to continue agreement review.',
            );
          } finally {
            setSubmitting(false);
          }
        }}
      />
    );
  }

  if (item.type === 'form') {
    return (
      <FormChecklistPanel
        item={item}
        instance={instance}
        submitting={submitting}
        error={error}
        onSaveDraft={async (responses) => {
          const result = await patchEnrollmentChecklistItem(instance.id, {
            draft: true,
            responses,
          });
          updateInstance({
            status: (result.status as EnrollmentChecklistItemInstance['status']) ?? 'in_progress',
            responses: result.responses ?? responses,
          });
        }}
        onSubmit={async (responses) => {
          setSubmitting(true);
          setError(null);
          try {
            const result = await patchEnrollmentChecklistItem(instance.id, { responses });
            await handleComplete(result.responses ?? responses);
          } catch (submitError) {
            reportError('parent_enrollment_form_submit', submitError);
            setError(submitError instanceof Error ? submitError.message : 'Failed to submit form.');
          } finally {
            setSubmitting(false);
          }
        }}
      />
    );
  }

  if (item.type === 'file_upload') {
    return (
      <FileUploadChecklistPanel
        item={item}
        instance={instance}
        checklistId={checklist.checklistId}
        organizationId={organizationId}
        submitting={submitting}
        error={error}
        onSubmit={async (responses) => {
          setSubmitting(true);
          setError(null);
          try {
            const result = await patchEnrollmentChecklistItem(instance.id, { responses });
            await handleComplete(result.responses ?? responses);
          } catch (submitError) {
            reportError('parent_enrollment_file_upload', submitError);
            setError(submitError instanceof Error ? submitError.message : 'Failed to submit files.');
          } finally {
            setSubmitting(false);
          }
        }}
      />
    );
  }

  if (item.type === 'payment') {
    return (
      <PaymentChecklistPanel
        item={item}
        instance={instance}
        submitting={submitting}
        error={error}
        onCheckout={async () => {
          setSubmitting(true);
          setError(null);
          try {
            const result = await createEnrollmentChecklistCheckout(instance.id);
            await openStripeCheckout(result.checkoutUrl);
            updateInstance({ paymentStatus: 'pending' });
          } catch (checkoutError) {
            reportError('parent_enrollment_payment_checkout', checkoutError);
            setError(
              checkoutError instanceof Error ? checkoutError.message : 'Failed to start payment.',
            );
          } finally {
            setSubmitting(false);
          }
        }}
      />
    );
  }

  return (
    <Text style={[styles.body, { color: theme.muted }]}>
      This checklist item is not supported in the mobile app yet.
    </Text>
  );
}

function AcknowledgmentPanel({
  item,
  instance,
  submitting,
  error,
  onSubmit,
}: {
  item: EnrollmentChecklistItem;
  instance: EnrollmentChecklistItemInstance;
  submitting: boolean;
  error: string | null;
  onSubmit: (signerName: string) => Promise<void>;
}) {
  const theme = useParentTheme();
  const isCompleted = instance.status === 'completed';
  const [signature, setSignature] = useState('');

  return (
    <View style={styles.panel}>
      <Text style={[styles.title, { color: theme.ink }]}>{item.label}</Text>
      <FormattedDocumentText content={item.acknowledgment?.body ?? ''} />
      <ParentFormSignatureField
        value={signature}
        onChange={setSignature}
        disabled={isCompleted}
      />
      {error ? <StoryErrorBanner message={error} /> : null}
      <StoryButton
        label={isCompleted ? 'Completed' : 'Sign and submit'}
        onPress={() => void onSubmit(signature.trim())}
        disabled={isCompleted || !signature.trim() || submitting}
      />
    </View>
  );
}

function DocumentSignPdfPanel({
  item,
  instance,
  organizationId,
  applicationId,
  submitting,
  error,
  onSubmit,
}: {
  item: EnrollmentChecklistItem;
  instance: EnrollmentChecklistItemInstance;
  organizationId: string;
  applicationId: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (signerName: string) => Promise<void>;
}) {
  const theme = useParentTheme();
  const isCompleted = instance.status === 'completed';
  const [signature, setSignature] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const storagePath = item.document?.kind === 'pdf' ? item.document.storagePath : null;
    if (!storagePath) return;

    const supabase = getSupabaseClient();
    void supabase.storage
      .from(APPLICATION_FILES_BUCKET)
      .createSignedUrl(storagePath, 3600)
      .then(({ data }) => {
        if (data?.signedUrl) {
          setPreviewUrl(buildEmbeddedPdfViewerUrl(data.signedUrl));
        }
      })
      .catch(() => {
        // Preview is optional; signing can still proceed.
      });
  }, [applicationId, item.document, organizationId]);

  return (
    <View style={styles.panel}>
      <Text style={[styles.title, { color: theme.ink }]}>{item.label}</Text>
      {previewUrl ? (
        <ParentEmbeddedPdfPreview url={previewUrl} title={item.label} minHeight={280} />
      ) : null}
      <View style={styles.signatureSection}>
        <ParentFormSignatureField
          value={signature}
          onChange={setSignature}
          disabled={isCompleted}
        />
      </View>
      {error ? <StoryErrorBanner message={error} /> : null}
      <StoryButton
        label={isCompleted ? 'Completed' : 'Sign document'}
        onPress={() => void onSubmit(signature.trim())}
        disabled={isCompleted || !signature.trim() || submitting}
      />
    </View>
  );
}

function DocumentSignInlinePanel({
  item,
  instance,
  initialSectionId,
  submitting,
  error,
  onSubmitSection,
  onAcknowledgeAmendment,
}: {
  item: EnrollmentChecklistItem;
  instance: EnrollmentChecklistItemInstance;
  initialSectionId?: string;
  submitting: boolean;
  error: string | null;
  onSubmitSection: (body: {
    agreementSection?: { sectionId: string; signerName: string; consentValue?: string };
    acknowledgeAgreementAmendment?: boolean;
  }) => Promise<void>;
  onAcknowledgeAmendment: () => Promise<void>;
}) {
  const theme = useParentTheme();
  const sections = item.document?.sections ?? [];
  const consentOptions = item.document?.consentOptions ?? [];
  const existingResponses = instance.responses ?? {};
  const signatures = parseAgreementSectionSignatures(existingResponses);
  const signatureMap = signaturesBySectionId(signatures);
  const amendmentNotice =
    typeof existingResponses.amendmentNotice === 'string'
      ? existingResponses.amendmentNotice
      : null;

  const initialIndex = useMemo(() => {
    if (initialSectionId) {
      const idx = sections.findIndex((section) => section.id === initialSectionId);
      if (idx >= 0) return idx;
    }
    return getAgreementInitialSectionIndex(sections, signatures);
  }, [initialSectionId, sections, signatures]);

  const [sectionIndex, setSectionIndex] = useState(initialIndex);
  const [signature, setSignature] = useState('');
  const [consentValue, setConsentValue] = useState(parseAgreementConsentValue(existingResponses));

  const section = sections[sectionIndex];
  const isLastSection = sectionIndex >= sections.length - 1;
  const isCompleted = instance.status === 'completed';
  const signedSection = section ? signatureMap.get(section.id) : undefined;

  useEffect(() => {
    setSignature(signedSection?.signerName ?? '');
  }, [section?.id, signedSection?.signerName]);

  if (!section) {
    return (
      <Text style={[styles.body, { color: theme.muted }]}>
        Agreement content is not configured.
      </Text>
    );
  }

  return (
    <View style={styles.panel}>
      <Text style={[styles.title, { color: theme.ink }]}>{item.label}</Text>
      <Text style={[styles.sectionTitle, { color: theme.ink }]}>{section.title}</Text>
      <FormattedDocumentText content={section.body ?? ''} />

      {amendmentNotice ? (
        <View style={[styles.amendmentBanner, { backgroundColor: theme.warningBg }]}>
          <Text style={[styles.body, { color: theme.ink }]}>{amendmentNotice}</Text>
          <StoryButton
            label="Review updated agreement"
            onPress={() => void onAcknowledgeAmendment()}
            disabled={submitting}
          />
        </View>
      ) : null}

      <ParentFormSignatureField
        value={signature}
        onChange={setSignature}
        disabled={isCompleted}
      />

      {isLastSection && consentOptions.length > 0 ? (
        <View style={styles.choiceList}>
          {consentOptions.map((option) => (
            <StoryButton
              key={option.value}
              label={option.label}
              variant={consentValue === option.value ? 'primary' : 'outline'}
              onPress={() => setConsentValue(option.value)}
              disabled={isCompleted}
            />
          ))}
        </View>
      ) : null}

      {error ? <StoryErrorBanner message={error} /> : null}

      <StoryButton
        label={isCompleted ? 'Completed' : isLastSection ? 'Finish agreement' : 'Continue'}
        onPress={() =>
          void onSubmitSection({
            agreementSection: {
              sectionId: section.id,
              signerName: signature.trim(),
              ...(isLastSection && consentValue ? { consentValue } : {}),
            },
          }).then(() => {
            if (!isLastSection) {
              setSectionIndex((index) => index + 1);
              setSignature('');
            }
          })
        }
        disabled={isCompleted || !signature.trim() || submitting}
      />
    </View>
  );
}

function FormChecklistPanel({
  item,
  instance,
  submitting,
  error,
  onSaveDraft,
  onSubmit,
}: {
  item: EnrollmentChecklistItem;
  instance: EnrollmentChecklistItemInstance;
  submitting: boolean;
  error: string | null;
  onSaveDraft: (responses: Record<string, unknown>) => Promise<void>;
  onSubmit: (responses: Record<string, unknown>) => Promise<void>;
}) {
  const theme = useParentTheme();
  const fields = item.formSchema?.fields ?? [];
  const [values, setValues] = useState<Record<string, string>>({});

  const payload = { fields: values };

  return (
    <View style={styles.panel}>
      <Text style={[styles.title, { color: theme.ink }]}>{item.label}</Text>
      {fields.map((field) => (
        <View key={field.id} style={styles.field}>
          <Text style={[styles.label, { color: theme.muted }]}>{field.label}</Text>
          <TextInput
            value={values[field.id] ?? ''}
            onChangeText={(next) => setValues((current) => ({ ...current, [field.id]: next }))}
            multiline={field.type === 'textarea'}
            style={[
              field.type === 'textarea' ? styles.textArea : styles.input,
              { borderColor: theme.line, backgroundColor: theme.white, color: theme.ink },
            ]}
          />
        </View>
      ))}
      {error ? <StoryErrorBanner message={error} /> : null}
      <StoryButton
        label="Save progress"
        variant="outline"
        onPress={() => void onSaveDraft(payload)}
        disabled={submitting}
      />
      <StoryButton
        label="Submit form"
        onPress={() => void onSubmit(payload)}
        disabled={submitting}
      />
    </View>
  );
}

function FileUploadChecklistPanel({
  item,
  instance,
  checklistId,
  organizationId,
  submitting,
  error,
  onSubmit,
}: {
  item: EnrollmentChecklistItem;
  instance: EnrollmentChecklistItemInstance;
  checklistId: string;
  organizationId: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (responses: Record<string, unknown>) => Promise<void>;
}) {
  const theme = useParentTheme();
  const existingFiles = Array.isArray(instance.responses?.files)
    ? (instance.responses?.files as Array<{ fileName?: string }>)
    : [];

  const pickFiles = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;

    const supabase = getSupabaseClient();
    const uploaded: Array<Record<string, unknown>> = [];

    for (const asset of result.assets) {
      const storagePath = buildChecklistFileStoragePath({
        organizationId,
        checklistId,
        instanceId: instance.id,
        fileName: asset.name,
      });
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const { error: uploadError } = await supabase.storage
        .from(APPLICATION_FILES_BUCKET)
        .upload(storagePath, blob, {
          contentType: asset.mimeType ?? undefined,
          upsert: false,
        });
      if (uploadError) {
        Alert.alert('Upload failed', uploadError.message);
        return;
      }
      uploaded.push({
        id: `${Date.now()}`,
        fileName: asset.name,
        storagePath,
        mimeType: asset.mimeType ?? null,
        sizeBytes: asset.size ?? null,
      });
    }

    await onSubmit({ files: [...existingFiles, ...uploaded] });
  };

  return (
    <View style={styles.panel}>
      <Text style={[styles.title, { color: theme.ink }]}>{item.label}</Text>
      <Text style={[styles.body, { color: theme.muted }]}>
        {item.fileUpload?.helpText ?? 'Upload the requested documents.'}
      </Text>
      {existingFiles.map((file, index) => (
        <Text key={`${file.fileName ?? 'file'}-${index}`} style={[styles.body, { color: theme.ink }]}>
          {file.fileName ?? 'Uploaded file'}
        </Text>
      ))}
      {error ? <StoryErrorBanner message={error} /> : null}
      <StoryButton
        label={existingFiles.length > 0 ? 'Upload more files' : 'Choose files'}
        onPress={() => void pickFiles()}
        disabled={submitting}
      />
    </View>
  );
}

function PaymentChecklistPanel({
  item,
  instance,
  submitting,
  error,
  onCheckout,
}: {
  item: EnrollmentChecklistItem;
  instance: EnrollmentChecklistItemInstance;
  submitting: boolean;
  error: string | null;
  onCheckout: () => Promise<void>;
}) {
  const theme = useParentTheme();
  const amount = item.payment?.amountCents ?? 0;
  const isPaid = instance.paymentStatus === 'paid' || instance.status === 'completed';

  return (
    <View style={styles.panel}>
      <Text style={[styles.title, { color: theme.ink }]}>{item.label}</Text>
      <Text style={[styles.body, { color: theme.muted }]}>
        {item.payment?.label ?? 'Enrollment payment'}
      </Text>
      <Text style={[styles.amount, { color: theme.ink }]}>{formatFeeAmount(amount)}</Text>
      {error ? <StoryErrorBanner message={error} /> : null}
      <StoryButton
        label={isPaid ? 'Paid' : 'Pay now'}
        onPress={() => void onCheckout()}
        disabled={isPaid || submitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: Spacing.four,
  },
  signatureSection: {
    marginTop: Spacing.two,
  },
  title: {
    fontFamily: StoryFonts.display,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  sectionTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  body: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 22,
  },
  label: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  field: {
    gap: 4,
  },
  amount: {
    fontFamily: StoryFonts.display,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 30,
  },
  amendmentBanner: {
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  choiceList: {
    gap: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: StoryFonts.body,
    fontSize: 14,
    textAlignVertical: 'top',
  },
});
