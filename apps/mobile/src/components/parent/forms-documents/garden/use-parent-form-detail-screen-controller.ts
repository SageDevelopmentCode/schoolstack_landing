import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useParentBilling } from '@/contexts/parent-billing-context';
import { useParentFormsDocuments } from '@/contexts/parent-forms-documents-context';
import { useParentHome } from '@/contexts/parent-home-context';
import { goBackOrReplace } from '@/lib/navigation';
import type { ParentFormDetail } from '@/lib/parent/parent-forms-documents-types';
import {
  areBuilderFieldValuesComplete,
  parseStoredSignerName,
} from '@/lib/parent/parent-forms-documents-utils';
import { parentFormsDocumentsRoute } from '@/lib/parent/parent-nav';
import {
  fetchParentFormDetail,
  fetchParentFormDownloadUrl,
  submitParentFormResponse,
} from '@/lib/parent/parent-portal-api';
import { openExternalUrlSafely } from '@/lib/open-external-url';
import { buildEmbeddedPdfViewerUrl } from '@/lib/school-bulletin/bulletin-format';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export type FormActionResult =
  | { ok: true; detail: ParentFormDetail }
  | { ok: false; message: string };

/**
 * One form's data + callbacks (no UI). Load, PDF preview URL, `canSign`, the
 * submit payload, the `apply*` context updates and `router.back()` after
 * signing are unchanged from the Story screen; results are returned so the
 * Garden screen can give feedback instead of `Alert`.
 */
export function useParentFormDetailScreenController({
  slug,
  organizationId,
  formId,
}: {
  slug: string;
  organizationId: string;
  formId: string;
}) {
  const router = useRouter();
  const { items, hasLoaded: listLoaded, applySubmittedForm } = useParentFormsDocuments();
  const { applySignedForm } = useParentHome();
  const { applySignedAgreement } = useParentBilling();
  const { reportError } = useMobileErrorReporter(organizationId);

  const [detail, setDetail] = useState<ParentFormDetail | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string | boolean | string[]>>(
    {},
  );
  const [signerName, setSignerName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setPreviewUrl(null);

    try {
      const payload = await fetchParentFormDetail(organizationId, formId);
      setDetail(payload);
      setSignerName(parseStoredSignerName(payload.response.responses));
      setFieldValues({});

      if (payload.form.formType === 'upload' && payload.form.uploadFormat === 'pdf') {
        const download = await fetchParentFormDownloadUrl(organizationId, formId);
        setPreviewUrl(buildEmbeddedPdfViewerUrl(download.signedUrl));
      }
    } catch (loadError) {
      reportError('parent_forms_documents.detail', loadError);
      setError(loadError instanceof Error ? loadError.message : 'Failed to load form.');
    } finally {
      setIsLoading(false);
    }
  }, [formId, organizationId, reportError]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const isSigned = detail?.response.status === 'signed';
  const builderFields = useMemo(() => detail?.form.fields ?? [], [detail]);
  const bodyBuilderFields = useMemo(
    () => builderFields.filter((field) => field.type !== 'signature'),
    [builderFields],
  );
  const bodySignatureFields = useMemo(
    () => builderFields.filter((field) => field.type === 'signature'),
    [builderFields],
  );
  const bodySignatureField = bodySignatureFields[0] ?? null;

  const canSign = useMemo(() => {
    if (!detail || isSigned || isSubmitting) return false;

    if (detail.form.formType === 'upload') {
      if (!detail.form.requireSignature) return true;
      return signerName.trim().length > 0;
    }

    if (detail.form.formType === 'builder') {
      return areBuilderFieldValuesComplete(builderFields, fieldValues);
    }

    return false;
  }, [builderFields, detail, fieldValues, isSigned, isSubmitting, signerName]);

  const isAcknowledge = detail?.form.formType === 'upload' && !detail.form.requireSignature;
  const submitActionLabel = isAcknowledge ? 'Acknowledge' : 'Sign now';

  const setFieldValue = useCallback((fieldId: string, value: string | boolean | string[]) => {
    setFieldValues((current) => ({ ...current, [fieldId]: value }));
  }, []);

  /** Forms still waiting on the family once this one is signed (null until the list has loaded). */
  const remainingAfterThis = useMemo(
    () =>
      listLoaded
        ? items.filter((item) => item.listStatus === 'needs_action' && item.form.id !== formId)
            .length
        : null,
    [formId, items, listLoaded],
  );

  const openDocx = useCallback(async (): Promise<FormActionResult | null> => {
    try {
      const download = await fetchParentFormDownloadUrl(organizationId, formId);
      await openExternalUrlSafely(download.signedUrl, reportError, {
        operation: 'parent_forms_documents.open_docx_link',
        entityType: 'parent_form',
        entityId: formId,
        errorTitle: 'Could not open document',
      });
      return null;
    } catch (openError) {
      reportError('parent_forms_documents.open_docx', openError);
      return {
        ok: false,
        message: openError instanceof Error ? openError.message : 'Please try again.',
      };
    }
  }, [formId, organizationId, reportError]);

  const submit = useCallback(async (): Promise<FormActionResult | null> => {
    if (!detail || !canSign) return null;

    setIsSubmitting(true);
    try {
      const payload = await submitParentFormResponse(organizationId, formId, {
        signerName:
          detail.form.formType === 'upload'
            ? signerName.trim() || undefined
            : bodySignatureField
              ? String(fieldValues[bodySignatureField.id] ?? '').trim() || undefined
              : undefined,
        fieldValues: detail.form.formType === 'builder' ? fieldValues : undefined,
      });
      setDetail(payload);
      applySubmittedForm(payload);
      applySignedForm(payload);
      applySignedAgreement(payload);
      router.back();
      return { ok: true, detail: payload };
    } catch (submitError) {
      reportError('parent_forms_documents.submit', submitError);
      return {
        ok: false,
        message: submitError instanceof Error ? submitError.message : 'Please try again.',
      };
    } finally {
      setIsSubmitting(false);
    }
  }, [
    applySignedAgreement,
    applySignedForm,
    applySubmittedForm,
    bodySignatureField,
    canSign,
    detail,
    fieldValues,
    formId,
    organizationId,
    reportError,
    router,
    signerName,
  ]);

  const onBack = useCallback(() => {
    goBackOrReplace(router, parentFormsDocumentsRoute(slug));
  }, [router, slug]);

  const retry = useCallback(() => {
    void loadDetail();
  }, [loadDetail]);

  return {
    formId,
    detail,
    isLoading,
    error,
    previewUrl,
    isSigned,
    isSubmitting,
    isAcknowledge,
    submitActionLabel,
    bodyBuilderFields,
    bodySignatureField,
    fieldValues,
    setFieldValue,
    signerName,
    setSignerName,
    canSign,
    remainingAfterThis,
    openDocx,
    submit,
    retry,
    onBack,
  };
}

export type ParentFormDetailScreenController = ReturnType<
  typeof useParentFormDetailScreenController
>;
