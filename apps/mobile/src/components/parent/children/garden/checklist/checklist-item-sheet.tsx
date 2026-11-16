import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

// keyboard: verified on device — enrollment checklist item sheet uses ParentBottomSheet scroll inset

import {
  AcknowledgmentPanel,
  DocumentSignInlinePanel,
  DocumentSignPdfPanel,
  FileUploadChecklistPanel,
  FormChecklistPanel,
  PaymentChecklistPanel,
} from '@/components/parent/children/garden/checklist/checklist-panels';
import { useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { GChip, gText } from '@/components/parent/garden/ui';
import { ParentBottomSheet } from '@/components/parent/parent-bottom-sheet';
import {
  checklistItemTypeLabel,
  type EnrollmentChecklistItem,
  type EnrollmentChecklistItemInstance,
  type LoadedEnrollmentChecklist,
} from '@/lib/admissions/enrollment-checklist';
import { statusChip } from '@/lib/parent/parent-children-garden';
import { openStripeCheckout } from '@/lib/parent/open-stripe-checkout';
import {
  createEnrollmentChecklistCheckout,
  patchEnrollmentChecklistItem,
} from '@/lib/parent/parent-enrollment-checklist-api';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type InstanceStatus = EnrollmentChecklistItemInstance['status'];

/**
 * One enrollment checklist item. Same PATCH / checkout calls and operation
 * names as the Story panel; status is shown inside the sheet (toasts sit
 * behind native sheets) and success hands off to `onCompleted`.
 */
export function ChecklistItemSheet({
  item,
  checklist,
  organizationId,
  initialSectionId,
  onChecklistUpdated,
  onCompleted,
  onClose,
}: {
  item: EnrollmentChecklistItem | null;
  checklist: LoadedEnrollmentChecklist | null;
  organizationId: string;
  initialSectionId?: string;
  onChecklistUpdated: (checklist: LoadedEnrollmentChecklist) => void;
  /** The item finished: close the sheet and celebrate/toast. */
  onCompleted: (item: EnrollmentChecklistItem) => void;
  onClose: () => void;
}) {
  const { reportError } = useMobileErrorReporter(organizationId);
  const { readOnly, notifyReadOnly } = useGardenReadOnlyGate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftSaving, setDraftSaving] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    setError(null);
    setDraftSavedAt(null);
  }, [item?.id]);

  const instance =
    item && checklist
      ? (checklist.instances.find((row) => row.templateItemId === item.id) ?? null)
      : null;

  const updateInstance = useCallback(
    (patch: Partial<EnrollmentChecklistItemInstance>) => {
      if (!checklist || !instance) return;
      onChecklistUpdated({
        ...checklist,
        instances: checklist.instances.map((row) => (row.id === instance.id ? { ...row, ...patch } : row)),
      });
    },
    [checklist, instance, onChecklistUpdated],
  );

  const complete = useCallback(
    (responses: Record<string, unknown> | undefined) => {
      if (!item || !instance) return;
      updateInstance({ status: 'completed', responses: responses ?? instance.responses });
      onCompleted(item);
    },
    [instance, item, onCompleted, updateInstance],
  );

  /** Run a write with the shared busy/error handling; resolves true on success. */
  const run = useCallback(
    async (operation: string, fallback: string, work: () => Promise<void>): Promise<boolean> => {
      setSubmitting(true);
      setError(null);
      try {
        await work();
        return true;
      } catch (err) {
        reportError(operation, err);
        setError(err instanceof Error ? err.message : fallback);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [reportError],
  );

  if (!item || !checklist || !instance) return null;

  const chip = statusChip(instance.status ?? 'not_started');
  const common = {
    item,
    instance,
    submitting,
    error,
    readOnly,
    onBlocked: notifyReadOnly,
  };

  const signPatch = (operation: string, fallback: string, signerName: string) =>
    void run(operation, fallback, async () => {
      const result = await patchEnrollmentChecklistItem(instance.id, { signerName });
      if (item.type === 'acknowledgment' || result.status === 'completed') {
        complete(
          item.type === 'acknowledgment'
            ? { signerName, signedAt: new Date().toISOString() }
            : (result.responses ?? { signerName }),
        );
        return;
      }
      updateInstance({
        status: (result.status as InstanceStatus) ?? 'in_progress',
        responses: result.responses ?? instance.responses,
      });
    });

  let body: ReactNode;
  switch (item.type) {
    case 'acknowledgment':
      body = (
        <AcknowledgmentPanel
          {...common}
          onSubmit={(name) => signPatch('parent_enrollment_acknowledgment', 'Failed to sign acknowledgment.', name)}
        />
      );
      break;
    case 'document_sign_pdf':
      body = (
        <DocumentSignPdfPanel
          {...common}
          onSubmit={(name) => signPatch('parent_enrollment_pdf_sign', 'Failed to sign document.', name)}
        />
      );
      break;
    case 'document_sign':
      body = (
        <DocumentSignInlinePanel
          {...common}
          initialSectionId={initialSectionId}
          onSubmitSection={(payload) =>
            run('parent_enrollment_agreement_section', 'Failed to save agreement section.', async () => {
              const result = await patchEnrollmentChecklistItem(instance.id, payload);
              if (result.status === 'completed') {
                complete(result.responses ?? instance.responses ?? {});
                return;
              }
              updateInstance({
                status: (result.status as InstanceStatus) ?? 'in_progress',
                responses: result.responses ?? instance.responses,
              });
            })
          }
          onAcknowledgeAmendment={() =>
            void run('parent_enrollment_agreement_amendment', 'Failed to continue agreement review.', async () => {
              const result = await patchEnrollmentChecklistItem(instance.id, {
                acknowledgeAgreementAmendment: true,
              });
              updateInstance({
                status: (result.status as InstanceStatus) ?? instance.status,
                responses: result.responses ?? instance.responses,
              });
              if (result.status === 'completed') complete(result.responses ?? instance.responses ?? {});
            })
          }
        />
      );
      break;
    case 'form':
      body = (
        <FormChecklistPanel
          {...common}
          draftSaving={draftSaving}
          draftSavedAt={draftSavedAt}
          onSaveDraft={(responses) => {
            void (async () => {
              setDraftSaving(true);
              setError(null);
              try {
                const result = await patchEnrollmentChecklistItem(instance.id, { draft: true, responses });
                updateInstance({
                  status: (result.status as InstanceStatus) ?? 'in_progress',
                  responses: result.responses ?? responses,
                });
                setDraftSavedAt(new Date());
              } catch (err) {
                reportError('parent_enrollment_form_draft_save', err);
                setError(err instanceof Error ? err.message : 'Failed to save progress.');
              } finally {
                setDraftSaving(false);
              }
            })();
          }}
          onSubmit={(responses) =>
            void run('parent_enrollment_form_submit', 'Failed to submit form.', async () => {
              const result = await patchEnrollmentChecklistItem(instance.id, { responses });
              complete(result.responses ?? responses);
            })
          }
        />
      );
      break;
    case 'file_upload':
      body = (
        <FileUploadChecklistPanel
          {...common}
          checklistId={checklist.checklistId}
          organizationId={organizationId}
          onUploadFailed={(err, message) => {
            reportError('parent_enrollment_file_upload', err);
            setError(message);
          }}
          onSubmit={(responses) =>
            void run('parent_enrollment_file_upload', 'Failed to submit files.', async () => {
              const result = await patchEnrollmentChecklistItem(instance.id, { responses });
              complete(result.responses ?? responses);
            })
          }
        />
      );
      break;
    case 'payment':
      body = (
        <PaymentChecklistPanel
          {...common}
          onCheckout={() =>
            void run('parent_enrollment_payment_checkout', 'Failed to start payment.', async () => {
              const result = await createEnrollmentChecklistCheckout(instance.id);
              await openStripeCheckout(result.checkoutUrl);
              updateInstance({ paymentStatus: 'pending' });
            })
          }
        />
      );
      break;
    default:
      body = <Text style={gText.meta}>This checklist item is not supported in the mobile app yet.</Text>;
  }

  return (
    <ParentBottomSheet
      visible
      onClose={onClose}
      title={item.label}
      subtitle={`${checklistItemTypeLabel(item.type)}${item.required ? '' : ' · Optional'}`}
      accessibilityLabel="Close checklist item">
      <View style={styles.body}>
        <GChip label={chip.label} tone={chip.tone} icon={chip.tone === 'success' ? 'checkmark' : undefined} />
        {body}
      </View>
    </ParentBottomSheet>
  );
}

const styles = StyleSheet.create({
  body: { gap: 16 },
});
