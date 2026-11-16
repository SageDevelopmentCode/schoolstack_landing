import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

import { formsCount } from '@/components/parent/forms-documents/garden/forms-garden-ui';
import type { ParentFormDetailScreenController } from '@/components/parent/forms-documents/garden/use-parent-form-detail-screen-controller';
import { useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import type { GStep } from '@/components/parent/garden/steps';
import { useGardenToast } from '@/components/parent/garden/toast';
import { haptic } from '@/lib/haptics';
import { areBuilderFieldValuesComplete } from '@/lib/parent/parent-forms-documents-utils';

/**
 * Feedback + derived state for one form: steps, the hint line, inline
 * "required" flags after a sign attempt, the read-only gate and toasts for
 * every outcome. Wraps the controller's callbacks; never changes what they send.
 */
export function useParentFormDetailFeedback(
  controller: ParentFormDetailScreenController,
  {
    scrollToFields,
    scrollToSign,
    focusSignature,
  }: {
    scrollToFields: () => void;
    scrollToSign: () => void;
    focusSignature: () => void;
  },
) {
  const toast = useGardenToast();
  const { readOnly, guard } = useGardenReadOnlyGate();
  const [attempted, setAttempted] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const {
    detail,
    isSigned,
    isSubmitting,
    isAcknowledge,
    canSign,
    bodyBuilderFields,
    bodySignatureField,
    fieldValues,
    signerName,
  } = controller;
  const isUpload = detail?.form.formType === 'upload';

  const requiredQuestions = useMemo(
    () => (isUpload ? [] : bodyBuilderFields.filter((field) => field.required)),
    [bodyBuilderFields, isUpload],
  );
  const missingRequired = useMemo(
    () => requiredQuestions.filter((field) => !areBuilderFieldValuesComplete([field], fieldValues)),
    [fieldValues, requiredQuestions],
  );
  const signatureNeeded = isUpload
    ? Boolean(detail?.form.requireSignature)
    : Boolean(bodySignatureField?.required);
  const signatureValue = isUpload
    ? signerName
    : bodySignatureField
      ? String(fieldValues[bodySignatureField.id] ?? '')
      : '';
  const signatureFilled = signatureValue.trim().length > 0;

  const invalidIds = useMemo(
    () => (attempted ? new Set(missingRequired.map((field) => field.id)) : undefined),
    [attempted, missingRequired],
  );
  const signatureInvalid = attempted && signatureNeeded && !signatureFilled;

  /* ---------------- Steps ---------------- */
  const steps = useMemo<GStep[]>(() => {
    if (!detail) return [];
    const answered = requiredQuestions.length - missingRequired.length;
    const firstDone = isSigned
      ? true
      : isUpload
        ? signatureNeeded && signatureFilled
        : requiredQuestions.length > 0 && missingRequired.length === 0;
    const secondDone = isSigned;
    return [
      {
        id: 'review',
        title: isUpload ? 'Read the document' : 'Answer the questions',
        meta:
          !isUpload && !isSigned && requiredQuestions.length > 0
            ? `${answered} of ${requiredQuestions.length} answered`
            : null,
        state: firstDone ? 'done' : 'current',
        onPress: scrollToFields,
      },
      {
        id: 'sign',
        title: isAcknowledge ? 'Acknowledge' : 'Sign',
        meta: !isAcknowledge && signatureFilled && !isSigned ? 'Name typed' : null,
        state: secondDone ? 'done' : firstDone ? 'current' : 'todo',
        onPress: isSigned ? undefined : scrollToSign,
      },
    ];
  }, [
    detail,
    isAcknowledge,
    isSigned,
    isUpload,
    missingRequired.length,
    requiredQuestions.length,
    scrollToFields,
    scrollToSign,
    signatureFilled,
    signatureNeeded,
  ]);

  /* ---------------- Hint ---------------- */
  let hint: string;
  if (readOnly) hint = "Preview mode — forms can't be signed here.";
  else if (isSubmitting) hint = 'Signing…';
  else if (missingRequired.length > 0)
    hint = `Answer ${missingRequired.length} more required question${
      missingRequired.length === 1 ? '' : 's'
    }`;
  else if (signatureNeeded && !signatureFilled) hint = 'Type your full legal name to sign';
  else if (isAcknowledge) hint = 'Read the document, then acknowledge.';
  else hint = 'Ready to sign';
  const ready = !readOnly && canSign;

  /* ---------------- Actions ---------------- */
  const submitRef = useRef<() => Promise<void>>(async () => undefined);

  const handlePrimary = useCallback(async () => {
    if (!detail || isSigned || isSubmitting) return;
    if (!canSign) {
      setAttempted(true);
      haptic.warning();
      if (missingRequired.length > 0) scrollToFields();
      else focusSignature();
      return;
    }
    const remaining = controller.remainingAfterThis;
    const result = await controller.submit();
    if (!result) return;
    if (result.ok) {
      setAttempted(false);
      toast.success(isAcknowledge ? 'Form acknowledged' : 'Form signed', {
        id: `parent-form-signed-${result.detail.form.id}`,
        description:
          remaining == null
            ? 'Your response has been saved.'
            : remaining > 0
              ? `${formsCount(remaining)} more waiting for you.`
              : 'Nothing else is waiting for your signature.',
      });
    } else {
      toast.error("Couldn't sign this form", {
        id: `parent-form-sign-error-${detail.form.id}`,
        description: `${result.message} Your answers are still here.`,
        action: { label: 'Try again', onPress: () => void submitRef.current() },
      });
    }
  }, [
    canSign,
    controller,
    detail,
    focusSignature,
    isAcknowledge,
    isSigned,
    isSubmitting,
    missingRequired.length,
    scrollToFields,
    toast,
  ]);

  useEffect(() => {
    submitRef.current = handlePrimary;
  }, [handlePrimary]);

  const onPrimary = useMemo(() => guard(() => void handlePrimary()), [guard, handlePrimary]);

  const openRef = useRef<() => Promise<void>>(async () => undefined);
  const openDocument = useCallback(async () => {
    const result = await controller.openDocx();
    if (result && !result.ok) {
      toast.error('Could not open document', {
        id: `parent-form-open-${controller.formId}`,
        description: result.message,
        action: { label: 'Try again', onPress: () => void openRef.current() },
      });
    }
  }, [controller, toast]);

  useEffect(() => {
    openRef.current = openDocument;
  }, [openDocument]);

  return {
    readOnly,
    keyboardVisible,
    steps,
    hint,
    ready,
    invalidIds,
    signatureInvalid,
    onPrimary,
    openDocument,
  };
}

export type ParentFormDetailFeedback = ReturnType<typeof useParentFormDetailFeedback>;
