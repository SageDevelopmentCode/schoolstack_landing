import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FormattedDocumentText } from '@/components/admissions/formatted-document-text';
import { GChoiceChips, GInlineBanner, GTextField } from '@/components/parent/garden/fields';
import { GStepList } from '@/components/parent/garden/steps';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GChip, GKicker, GOutlineButton, GToyButton, gText } from '@/components/parent/garden/ui';
import { ParentEmbeddedPdfPreview } from '@/components/parent/shared/parent-embedded-pdf-preview';
import { formatFeeAmount } from '@/lib/admissions/application-form-schema';
import {
  getAgreementInitialSectionIndex,
  parseAgreementConsentValue,
  parseAgreementSectionSignatures,
  signaturesBySectionId,
} from '@/lib/admissions/enrollment-agreement-progress';
import type {
  EnrollmentChecklistItem,
  EnrollmentChecklistItemInstance,
} from '@/lib/admissions/enrollment-checklist';
import { buildChecklistFileStoragePath, checklistFormDraftValues } from '@/lib/parent/parent-children-garden';
import { buildEmbeddedPdfViewerUrl } from '@/lib/school-bulletin/bulletin-format';
import { getSupabaseClient } from '@/lib/supabase';

// keyboard: verified on device — panels render only inside ChecklistItemSheet (ParentBottomSheet)

export const APPLICATION_FILES_BUCKET = 'application-files';

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

/** Typed legal-name signature with a live preview. */
export function GardenSignatureField({
  value,
  onChange,
  disabled,
  onBlocked,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onBlocked?: () => void;
}) {
  const accent = useGardenAccent();
  return (
    <View style={styles.signature}>
      <GTextField
        label="Type your full legal name"
        value={value}
        onChangeText={onChange}
        disabled={disabled}
        onPressIn={disabled ? onBlocked : undefined}
        autoCapitalize="words"
        autoCorrect={false}
        textContentType="name"
        placeholder="Full legal name"
      />
      <View style={[styles.signaturePreview, { borderColor: value.trim() ? accent.clay : Garden.ink15 }]}>
        <Text style={styles.signatureLabel}>Signature</Text>
        <Text
          style={[styles.signatureInk, !value.trim() && styles.signaturePlaceholder]}
          accessibilityLabel={value.trim() ? `Signature preview: ${value.trim()}` : 'Signature preview, empty'}>
          {value.trim() || 'Your name appears here'}
        </Text>
      </View>
    </View>
  );
}

function DoneNote({ label }: { label: string }) {
  return <GInlineBanner tone="success" title={label} description="Nothing else to do here." />;
}

export type PanelCommon = {
  item: EnrollmentChecklistItem;
  instance: EnrollmentChecklistItemInstance;
  submitting: boolean;
  error: string | null;
  readOnly: boolean;
  onBlocked: () => void;
};

function ErrorBanner({ error }: { error: string | null }) {
  if (!error) return null;
  return <GInlineBanner tone="error" title="That didn't go through" description={`${error} Try again.`} />;
}

/* ------------------------------------------------------------------ */
/* Acknowledgment                                                      */
/* ------------------------------------------------------------------ */

export function AcknowledgmentPanel({
  item,
  instance,
  submitting,
  error,
  readOnly,
  onBlocked,
  onSubmit,
}: PanelCommon & { onSubmit: (signerName: string) => void }) {
  const isCompleted = instance.status === 'completed';
  const [signature, setSignature] = useState('');
  return (
    <View style={styles.panel}>
      <View style={styles.doc}>
        <FormattedDocumentText content={item.acknowledgment?.body ?? ''} />
      </View>
      {isCompleted ? (
        <DoneNote label="Signed" />
      ) : (
        <>
          <GKicker>Sign below</GKicker>
          <GardenSignatureField value={signature} onChange={setSignature} disabled={readOnly} onBlocked={onBlocked} />
          <ErrorBanner error={error} />
          <GToyButton
            label={submitting ? 'Submitting…' : 'Sign and submit'}
            icon="create-outline"
            size="md"
            fullWidth
            loading={submitting}
            disabled={!signature.trim()}
            onPress={() => (readOnly ? onBlocked() : onSubmit(signature.trim()))}
          />
        </>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* PDF to sign                                                         */
/* ------------------------------------------------------------------ */

export function DocumentSignPdfPanel({
  item,
  instance,
  submitting,
  error,
  readOnly,
  onBlocked,
  onSubmit,
}: PanelCommon & { onSubmit: (signerName: string) => void }) {
  const isCompleted = instance.status === 'completed';
  const [signature, setSignature] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewState, setPreviewState] = useState<'loading' | 'ready' | 'none'>('loading');

  useEffect(() => {
    const storagePath = item.document?.kind === 'pdf' ? item.document.storagePath : null;
    if (!storagePath) {
      setPreviewState('none');
      return;
    }
    void getSupabaseClient()
      .storage.from(APPLICATION_FILES_BUCKET)
      .createSignedUrl(storagePath, 3600)
      .then(({ data }) => {
        if (data?.signedUrl) {
          setPreviewUrl(buildEmbeddedPdfViewerUrl(data.signedUrl));
          setPreviewState('ready');
        } else {
          setPreviewState('none');
        }
      })
      .catch(() => {
        // intentionally silent: the preview is optional; signing can still proceed.
        setPreviewState('none');
      });
  }, [item.document]);

  return (
    <View style={styles.panel}>
      {previewUrl ? (
        <ParentEmbeddedPdfPreview
          url={previewUrl}
          title={item.label}
          minHeight={280}
          reportEntityType="enrollment_checklist_item"
          reportEntityId={item.id}
        />
      ) : previewState === 'loading' ? (
        <View style={styles.pdfPlaceholder}>
          <Ionicons name="document-text-outline" size={26} color={Garden.ink60} />
          <Text style={gText.meta}>Loading the document…</Text>
        </View>
      ) : null}
      {isCompleted ? (
        <DoneNote label="Signed" />
      ) : (
        <>
          <GKicker>Read the document, then sign</GKicker>
          <GardenSignatureField value={signature} onChange={setSignature} disabled={readOnly} onBlocked={onBlocked} />
          <ErrorBanner error={error} />
          <GToyButton
            label={submitting ? 'Signing…' : 'Sign document'}
            icon="create-outline"
            size="md"
            fullWidth
            loading={submitting}
            disabled={!signature.trim()}
            onPress={() => (readOnly ? onBlocked() : onSubmit(signature.trim()))}
          />
        </>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Multi-section agreement                                             */
/* ------------------------------------------------------------------ */

export function DocumentSignInlinePanel({
  item,
  instance,
  initialSectionId,
  submitting,
  error,
  readOnly,
  onBlocked,
  onSubmitSection,
  onAcknowledgeAmendment,
}: PanelCommon & {
  initialSectionId?: string;
  /** Resolves `true` when the section saved. */
  onSubmitSection: (body: {
    agreementSection: { sectionId: string; signerName: string; consentValue?: string };
  }) => Promise<boolean>;
  onAcknowledgeAmendment: () => void;
}) {
  const sections = useMemo(() => item.document?.sections ?? [], [item.document?.sections]);
  const consentOptions = item.document?.consentOptions ?? [];
  const responses = instance.responses ?? {};
  const signatures = parseAgreementSectionSignatures(responses);
  const signatureMap = signaturesBySectionId(signatures);
  const amendmentNotice = typeof responses.amendmentNotice === 'string' ? responses.amendmentNotice : null;

  const initialIndex = useMemo(() => {
    if (initialSectionId) {
      const idx = sections.findIndex((s) => s.id === initialSectionId);
      if (idx >= 0) return idx;
    }
    return getAgreementInitialSectionIndex(sections, signatures);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on open
  }, [initialSectionId, sections]);

  const [sectionIndex, setSectionIndex] = useState(initialIndex);
  const [signature, setSignature] = useState('');
  const [consentValue, setConsentValue] = useState(parseAgreementConsentValue(responses));

  const section = sections[sectionIndex];
  const isLast = sectionIndex >= sections.length - 1;
  const isCompleted = instance.status === 'completed';
  const signedSection = section ? signatureMap.get(section.id) : undefined;

  useEffect(() => {
    setSignature(signedSection?.signerName ?? '');
  }, [section?.id, signedSection?.signerName]);

  if (!section) {
    return <Text style={gText.meta}>Agreement content is not configured.</Text>;
  }

  return (
    <View style={styles.panel}>
      {sections.length > 1 ? (
        <GStepList
          accessibilityLabel="Agreement sections"
          steps={sections.map((s, i) => ({
            id: s.id,
            title: s.title,
            meta: signatureMap.get(s.id) ? `Signed by ${signatureMap.get(s.id)?.signerName}` : null,
            state: signatureMap.get(s.id) ? 'done' : i === sectionIndex ? 'current' : 'todo',
          }))}
        />
      ) : null}

      <View style={styles.sectionHead}>
        <GChip label={`Section ${sectionIndex + 1} of ${sections.length}`} tone="info" />
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
      <View style={styles.doc}>
        <FormattedDocumentText content={section.body ?? ''} />
      </View>

      {amendmentNotice ? (
        <GInlineBanner
          tone="warning"
          title="The agreement was updated"
          description={amendmentNotice}
          action={
            <GOutlineButton
              label="Review updated agreement"
              onPress={() => (readOnly ? onBlocked() : onAcknowledgeAmendment())}
              style={styles.bannerAction}
            />
          }
        />
      ) : null}

      {isCompleted ? (
        <DoneNote label="Agreement complete" />
      ) : (
        <>
          <GardenSignatureField value={signature} onChange={setSignature} disabled={readOnly} onBlocked={onBlocked} />
          {isLast && consentOptions.length > 0 ? (
            <GChoiceChips
              label="Your choice"
              layout="stack"
              value={consentValue || null}
              onChange={setConsentValue}
              disabled={readOnly}
              onBlocked={onBlocked}
              options={consentOptions.map((option) => ({ id: option.value, label: option.label }))}
            />
          ) : null}
          <ErrorBanner error={error} />
          <View style={styles.row}>
            {sectionIndex > 0 ? (
              <GOutlineButton label="Back" icon="chevron-back" onPress={() => setSectionIndex((i) => i - 1)} />
            ) : null}
            <GToyButton
              label={submitting ? 'Saving…' : isLast ? 'Finish agreement' : 'Sign and continue'}
              icon={isLast ? 'checkmark' : 'arrow-forward'}
              size="md"
              loading={submitting}
              disabled={!signature.trim()}
              style={styles.flex}
              fullWidth
              onPress={() => {
                if (readOnly) return onBlocked();
                void onSubmitSection({
                  agreementSection: {
                    sectionId: section.id,
                    signerName: signature.trim(),
                    ...(isLast && consentValue ? { consentValue } : {}),
                  },
                }).then((saved) => {
                  if (saved && !isLast) {
                    setSectionIndex((i) => i + 1);
                    setSignature('');
                  }
                });
              }}
            />
          </View>
        </>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Form                                                                */
/* ------------------------------------------------------------------ */

export function FormChecklistPanel({
  item,
  instance,
  submitting,
  error,
  readOnly,
  onBlocked,
  draftSaving,
  draftSavedAt,
  onSaveDraft,
  onSubmit,
}: PanelCommon & {
  draftSaving: boolean;
  draftSavedAt: Date | null;
  onSaveDraft: (responses: Record<string, unknown>) => void;
  onSubmit: (responses: Record<string, unknown>) => void;
}) {
  const fields = item.formSchema?.fields ?? [];
  const [values, setValues] = useState<Record<string, string>>(() =>
    checklistFormDraftValues(instance.responses),
  );
  const payload = { fields: values };
  const filled = fields.filter((field) => (values[field.id] ?? '').trim()).length;

  return (
    <View style={styles.panel}>
      {fields.length > 0 ? (
        <GChip
          label={`${filled} of ${fields.length} answered`}
          tone={filled === fields.length ? 'success' : 'neutral'}
        />
      ) : null}
      {fields.map((field) => (
        <GTextField
          key={field.id}
          label={field.label}
          value={values[field.id] ?? ''}
          onChangeText={(next) => setValues((current) => ({ ...current, [field.id]: next }))}
          multiline={field.type === 'textarea'}
          disabled={readOnly}
          onPressIn={readOnly ? onBlocked : undefined}
        />
      ))}
      {draftSavedAt && !draftSaving ? (
        <GInlineBanner
          tone="success"
          title="Progress saved"
          description={`Saved at ${draftSavedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}. You can finish later.`}
        />
      ) : null}
      <ErrorBanner error={error} />
      <GToyButton
        label={submitting ? 'Submitting…' : 'Submit form'}
        icon="send"
        size="md"
        fullWidth
        loading={submitting}
        onPress={() => (readOnly ? onBlocked() : onSubmit(payload))}
      />
      <GOutlineButton
        label={draftSaving ? 'Saving…' : 'Save progress'}
        icon={draftSaving ? undefined : 'bookmark-outline'}
        onPress={() => {
          if (readOnly) return onBlocked();
          if (!draftSaving && !submitting) onSaveDraft(payload);
        }}
        style={styles.center}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* File upload                                                         */
/* ------------------------------------------------------------------ */

export function FileUploadChecklistPanel({
  item,
  instance,
  checklistId,
  organizationId,
  submitting,
  error,
  readOnly,
  onBlocked,
  onUploadFailed,
  onSubmit,
}: PanelCommon & {
  checklistId: string;
  organizationId: string;
  onUploadFailed: (err: unknown, message: string) => void;
  onSubmit: (responses: Record<string, unknown>) => void;
}) {
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const existingFiles = Array.isArray(instance.responses?.files)
    ? (instance.responses?.files as { fileName?: string }[])
    : [];

  const pickFiles = async () => {
    if (readOnly) return onBlocked();
    const result = await DocumentPicker.getDocumentAsync({ multiple: true, copyToCacheDirectory: true });
    if (result.canceled) return;

    const supabase = getSupabaseClient();
    const uploaded: Record<string, unknown>[] = [];
    setUploading({ done: 0, total: result.assets.length });
    try {
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
          .upload(storagePath, blob, { contentType: asset.mimeType ?? undefined, upsert: false });
        if (uploadError) {
          onUploadFailed(uploadError, uploadError.message);
          return;
        }
        uploaded.push({
          id: `${Date.now()}`,
          fileName: asset.name,
          storagePath,
          mimeType: asset.mimeType ?? null,
          sizeBytes: asset.size ?? null,
        });
        setUploading({ done: uploaded.length, total: result.assets.length });
      }
    } catch (err) {
      onUploadFailed(err, err instanceof Error ? err.message : 'Upload failed.');
      return;
    } finally {
      setUploading(null);
    }
    onSubmit({ files: [...existingFiles, ...uploaded] });
  };

  return (
    <View style={styles.panel}>
      <Text style={gText.body}>{item.fileUpload?.helpText ?? 'Upload the requested documents.'}</Text>
      {existingFiles.length > 0 ? (
        <View style={styles.files}>
          {existingFiles.map((file, index) => (
            <View key={`${file.fileName ?? 'file'}-${index}`} style={styles.file}>
              <Ionicons name="document-attach-outline" size={18} color={Garden.forest} />
              <Text style={[gText.itemTitle, styles.flex]} numberOfLines={1}>
                {file.fileName ?? 'Uploaded file'}
              </Text>
              <Ionicons name="checkmark-circle" size={18} color={Garden.forest} />
            </View>
          ))}
        </View>
      ) : null}
      {uploading ? (
        <GInlineBanner
          tone="info"
          title={`Uploading ${uploading.done + 1 > uploading.total ? uploading.total : uploading.done + 1} of ${uploading.total}…`}
          description="Keep the app open until this finishes."
        />
      ) : null}
      <ErrorBanner error={error} />
      <GToyButton
        label={
          uploading || submitting
            ? 'Uploading…'
            : existingFiles.length > 0
              ? 'Upload more files'
              : 'Choose files'
        }
        icon="cloud-upload-outline"
        size="md"
        fullWidth
        loading={Boolean(uploading) || submitting}
        onPress={() => void pickFiles()}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Payment                                                             */
/* ------------------------------------------------------------------ */

export function PaymentChecklistPanel({
  item,
  instance,
  submitting,
  error,
  readOnly,
  onBlocked,
  onCheckout,
}: PanelCommon & { onCheckout: () => void }) {
  const amount = item.payment?.amountCents ?? 0;
  const isPaid = instance.paymentStatus === 'paid' || instance.status === 'completed';
  const pending = instance.paymentStatus === 'pending' && !isPaid;
  return (
    <View style={styles.panel}>
      <View style={styles.amountCard}>
        <GKicker>{item.payment?.label ?? 'Enrollment payment'}</GKicker>
        <Text style={styles.amount}>{formatFeeAmount(amount)}</Text>
        {isPaid ? <GChip label="Paid" tone="success" icon="checkmark" /> : null}
        {pending ? <GChip label="Payment started" tone="warning" /> : null}
      </View>
      {pending ? (
        <GInlineBanner
          tone="info"
          title="Finish paying in checkout"
          description="This step updates once the payment goes through."
        />
      ) : null}
      <ErrorBanner error={error} />
      {isPaid ? null : (
        <GToyButton
          label={submitting ? 'Opening checkout…' : 'Pay now'}
          icon="card-outline"
          size="md"
          fullWidth
          loading={submitting}
          onPress={() => (readOnly ? onBlocked() : onCheckout())}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  panel: { gap: 16 },
  doc: {
    backgroundColor: Garden.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    padding: 14,
  },
  signature: { gap: 10 },
  signaturePreview: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Garden.paper,
  },
  signatureLabel: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: Garden.soft,
  },
  signatureInk: { fontFamily: GardenFonts.display, fontStyle: 'italic', fontSize: 24, lineHeight: 32, color: Garden.ink },
  signaturePlaceholder: { color: Garden.ink25 },
  pdfPlaceholder: {
    minHeight: 160,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sectionHead: { gap: 6 },
  sectionTitle: { fontFamily: GardenFonts.display, fontSize: 19, lineHeight: 23, color: Garden.ink },
  bannerAction: { marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  center: { alignSelf: 'center' },
  files: { gap: 8 },
  file: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Garden.mint,
  },
  amountCard: {
    gap: 6,
    padding: 16,
    borderRadius: 18,
    backgroundColor: Garden.butter,
  },
  amount: { fontFamily: GardenFonts.display, fontSize: 40, lineHeight: 44, color: Garden.ink },
});
