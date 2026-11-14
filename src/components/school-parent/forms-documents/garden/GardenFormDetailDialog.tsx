"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, Loader2, PenLine, RotateCcw } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import { GDialog } from "@/components/school-parent/garden/GDialog";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import {
  GChip,
  GKicker,
  GSkeleton,
  gBtnOutlineSm,
  gBtnPopSm,
} from "@/components/school-parent/garden/ui";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { ParentFormDetail, ParentFormListItem } from "@/lib/school-parent/forms-documents/types";
import { PARENT_FORM_MODAL_PREVIEW_HEIGHT_CLASS } from "@/lib/school-parent/forms-documents/utils";
import { parentToast } from "@/lib/school-parent/parent-toast";
import { formatFormDueDate } from "@/lib/school-teacher/forms-documents/utils";
import { useParentFormDetail } from "../useParentFormDetail";
import GardenFormDocumentPreview from "./GardenFormDocumentPreview";
import GardenFormFields, { parentFormFieldDomId } from "./GardenFormFields";
import GardenFormSteps, { type GardenFormStep } from "./GardenFormSteps";
import GardenSignatureField from "./GardenSignatureField";
import { formatSignedOn, formsCount, joinStudentNames } from "./forms-garden-ui";

const TITLE_ID = "parent-form-detail-modal-title";
/** Keeps toasts clear of the dialog's sticky action footer. */
export const DIALOG_TOAST_POSITION = "top-center" as const;

type GardenFormDetailDialogProps = {
  theme: ParentThemeTokens;
  open: boolean;
  organizationId: string;
  formId: string | null;
  initialItem: ParentFormListItem | null;
  readOnly?: boolean;
  uploadPreviewUrl?: string | null;
  onClose: () => void;
  onSubmitted: (detail: ParentFormDetail) => void;
  /** Other forms still waiting on the family (not counting this one). */
  queueRemaining?: number;
  /** Opens the next form in the queue (shown after signing). */
  onOpenNext?: () => void;
};

/**
 * Parent Garden signing dialog: steps that tick off as you go (read / answer →
 * sign → done), live help on what's missing, a sticky sign button, a success
 * state with "Next form", and toasts for every outcome. Same fetch/submit rules
 * as the story modal via `useParentFormDetail`.
 */
export default function GardenFormDetailDialog({
  theme,
  open,
  organizationId,
  formId,
  initialItem,
  readOnly = false,
  uploadPreviewUrl = null,
  onClose,
  onSubmitted,
  queueRemaining,
  onOpenNext,
}: GardenFormDetailDialogProps) {
  const reduce = useReducedMotion() === true;
  const state = useParentFormDetail({
    open,
    organizationId,
    formId,
    initialItem,
    readOnly,
    onSubmitted,
  });
  const {
    detail,
    isSigned,
    formReadOnly,
    isLoadingDetail,
    isSubmitting,
    detailError,
    reload,
    fieldValues,
    setFieldValue,
    signerName,
    setSignerName,
    bodyBuilderFields,
    bodySignatureField,
    builderSignatureValue,
    setBuilderSignature,
    storedSignerName,
    canSign,
    requiredQuestions,
    missingRequiredFields,
    signatureNeeded,
    signatureFilled,
    submitActionLabel,
    statusTone,
    statusLabel,
    showSignSection,
    isSignSectionInView,
    scrollToSignSection,
    scrollBodyRef,
    signSectionRef,
  } = state;

  const [justSigned, setJustSigned] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [reachedSign, setReachedSign] = useState(false);
  const [trackedFormId, setTrackedFormId] = useState(formId);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  // A different form (e.g. "Next form") starts with a clean slate.
  if (trackedFormId !== formId) {
    setTrackedFormId(formId);
    setJustSigned(false);
    setAttempted(false);
    setReachedSign(false);
  }

  if (isSignSectionInView && !reachedSign) setReachedSign(true);

  useEffect(() => {
    scrollBodyRef.current?.scrollTo({ top: 0 });
  }, [formId, scrollBodyRef]);

  const isUpload = detail?.form.formType === "upload";
  const isAcknowledge = Boolean(isUpload && !detail?.form.requireSignature);
  const signedOn = formatSignedOn(detail?.response.signedAt);
  const invalidIds = attempted ? new Set(missingRequiredFields.map((field) => field.id)) : undefined;
  const signatureInvalid = attempted && signatureNeeded && !signatureFilled;
  const answeredCount = requiredQuestions.length - missingRequiredFields.length;

  const focusFirstMissing = useCallback(() => {
    const firstMissing = missingRequiredFields[0];
    if (firstMissing) {
      const el = document.getElementById(parentFormFieldDomId(firstMissing.id));
      const block = el?.closest<HTMLElement>("[data-field-id]") ?? el;
      block?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      window.setTimeout(() => el?.focus({ preventScroll: true }), reduce ? 0 : 350);
      return;
    }
    scrollToSignSection();
    window.setTimeout(() => signatureInputRef.current?.focus({ preventScroll: true }), reduce ? 0 : 400);
  }, [missingRequiredFields, reduce, scrollToSignSection]);

  const submitRef = useRef<() => Promise<void>>(async () => undefined);

  const handlePrimary = useCallback(async () => {
    if (!detail || formReadOnly || isSubmitting) return;
    if (!canSign) {
      setAttempted(true);
      focusFirstMissing();
      return;
    }
    const result = await state.submit();
    if (!result) return;
    if (result.ok) {
      setJustSigned(true);
      setAttempted(false);
      scrollBodyRef.current?.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      const title = result.detail.form.title;
      const saved = `“${title}” is saved with your signed forms.`;
      const remainder =
        queueRemaining == null
          ? ""
          : queueRemaining > 0
            ? ` ${formsCount(queueRemaining)} still ${queueRemaining === 1 ? "needs" : "need"} you.`
            : " That was the last one — you're all set.";
      parentToast.success(isAcknowledge ? "Form acknowledged" : "Form signed", {
        id: `parent-form-signed-${result.detail.form.id}`,
        position: DIALOG_TOAST_POSITION,
        description: `${saved}${remainder}`,
      });
    } else {
      parentToast.error("Couldn't sign this form", {
        id: `parent-form-sign-error-${detail.form.id}`,
        position: DIALOG_TOAST_POSITION,
        description: `${result.message} Your answers are still here.`,
        action: { label: "Try again", onClick: () => void submitRef.current() },
      });
    }
  }, [
    canSign,
    detail,
    focusFirstMissing,
    formReadOnly,
    isAcknowledge,
    isSubmitting,
    queueRemaining,
    reduce,
    scrollBodyRef,
    state,
  ]);

  useEffect(() => {
    submitRef.current = handlePrimary;
  }, [handlePrimary]);

  /* ---------------- Steps ---------------- */
  const firstStepDone = isSigned
    ? true
    : isUpload
      ? reachedSign || signatureFilled
      : missingRequiredFields.length === 0 && (requiredQuestions.length > 0 || reachedSign);
  const secondStepDone = isSigned || (signatureNeeded && signatureFilled && firstStepDone);
  const steps: GardenFormStep[] = detail
    ? [
        {
          key: "review",
          label: isUpload ? "Read the document" : "Answer questions",
          detail: isUpload || formReadOnly
            ? undefined
            : requiredQuestions.length > 0
              ? `${answeredCount} of ${requiredQuestions.length} answered`
              : undefined,
          done: firstStepDone,
          onSelect: () => scrollBodyRef.current?.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }),
        },
        {
          key: "sign",
          label: isAcknowledge ? "Acknowledge" : "Sign",
          detail: !isAcknowledge && signatureFilled && !isSigned ? "Name typed" : undefined,
          done: secondStepDone,
          onSelect: showSignSection ? scrollToSignSection : undefined,
        },
        { key: "done", label: "Done", detail: isSigned && signedOn ? signedOn : undefined, done: isSigned },
      ]
    : [];

  /* ---------------- Footer hint ---------------- */
  let hint: string;
  if (!detail || isLoadingDetail) hint = "Loading form…";
  else if (detailError) hint = "This form didn't load.";
  else if (isSigned) hint = signedOn ? `Signed on ${signedOn}` : "Signed";
  else if (readOnly) hint = "Preview mode — forms can't be signed here.";
  else if (missingRequiredFields.length > 0)
    hint = `Answer ${missingRequiredFields.length} more required question${missingRequiredFields.length === 1 ? "" : "s"}`;
  else if (signatureNeeded && !signatureFilled) hint = "Type your full legal name to sign";
  else if (isAcknowledge) hint = "Read the document, then acknowledge.";
  else hint = canSign || !isSubmitting ? "Ready to sign" : "Signing…";

  const canAct = Boolean(detail && !formReadOnly && !isLoadingDetail && !detailError);
  const ready = canAct && canSign;
  const showGoToSign = canAct && showSignSection && !isSignSectionInView;
  const hasNext = Boolean(onOpenNext && (queueRemaining ?? 0) > 0);

  const footer = (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-2" aria-live="polite" aria-atomic="true">
        {isSigned ? (
          <Tick className="h-5 w-5 shrink-0" color="var(--sf-forest)" fill="var(--sf-mint)" />
        ) : ready ? (
          <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--sf-forest)]" />
        ) : canAct ? (
          <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--sf-clay)]" />
        ) : null}
        <p
          className={`m-0 text-[13px] font-extrabold ${
            attempted && !ready && canAct ? "text-[#b42318]" : "text-[var(--sf-ink)]/70"
          }`}
          data-testid="parent-form-detail-hint"
        >
          {hint}
        </p>
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
        {isSigned || !canAct ? (
          <>
            <button
              type="button"
              onClick={onClose}
              className={hasNext && justSigned ? gBtnOutlineSm : justSigned ? gBtnPopSm : gBtnOutlineSm}
            >
              {justSigned ? "Done" : "Close"}
            </button>
            {justSigned && hasNext ? (
              <button type="button" onClick={onOpenNext} className={gBtnPopSm} data-testid="parent-form-next">
                Next form ({queueRemaining} left)
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            ) : null}
          </>
        ) : (
          <>
            {showGoToSign ? (
              <button type="button" onClick={scrollToSignSection} className={gBtnOutlineSm}>
                <ArrowDown className="h-4 w-4" aria-hidden />
                Go to sign
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => void handlePrimary()}
              aria-disabled={!ready || isSubmitting || undefined}
              aria-busy={isSubmitting || undefined}
              data-testid="parent-form-submit"
              className={`${gBtnPopSm} ${
                ready || isSubmitting
                  ? ""
                  : "!border-[var(--sf-ink)]/40 !bg-[var(--sf-ink)]/25 !text-white !shadow-[0_3px_0_0_rgba(43,36,29,0.25)]"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Signing…
                </>
              ) : (
                <>
                  {isAcknowledge ? null : <PenLine className="h-4 w-4" aria-hidden />}
                  {submitActionLabel}
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );

  const showModal = open && Boolean(detail);
  const dueLine = detail?.form.dueDate ? `Due ${formatFormDueDate(detail.form.dueDate)}` : null;
  const forLine =
    detail && detail.response.studentNames.length > 0
      ? `For ${joinStudentNames(detail.response.studentNames)}`
      : null;

  return (
    <GDialog
      theme={theme}
      open={showModal}
      onClose={onClose}
      title={detail?.form.title ?? ""}
      titleId={TITLE_ID}
      size="2xl"
      closeDisabled={isSubmitting}
      bodyRef={scrollBodyRef}
      data-testid="parent-form-detail-modal"
      footerBordered
      description={
        detail ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <GChip tone={statusTone}>{statusLabel}</GChip>
            {detail.form.formCategory === "tuition" ? <GChip tone="info">Tuition</GChip> : null}
            {[forLine, isSigned ? null : dueLine].filter(Boolean).length > 0 ? (
              <span className="text-[13px] font-semibold text-[var(--sf-soft)]">
                {[forLine, isSigned ? null : dueLine].filter(Boolean).join(" · ")}
              </span>
            ) : null}
          </div>
        ) : null
      }
      headerExtra={
        detail && !detailError ? (
          <div className="rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] px-3 pb-2 pt-3">
            <GardenFormSteps steps={steps} allDone={isSigned} />
          </div>
        ) : null
      }
      footer={detail ? footer : undefined}
    >
      {detail ? (
        <div className="pb-6">
          <AnimatePresence initial={false}>
            {justSigned && isSigned ? (
              <motion.div
                key="signed-banner"
                initial={reduce ? false : { opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.32, ease: PORTAL_EASE }}
                className="mb-5 flex items-center gap-4 rounded-[20px] bg-[var(--sf-mint)] p-4 sm:p-5"
                role="status"
                data-testid="parent-form-signed-banner"
              >
                <Tick className="h-12 w-12 shrink-0" color="var(--sf-forest)" />
                <div className="min-w-0">
                  <p className="sf-display m-0 text-[1.3rem] leading-tight text-[var(--sf-ink)]">
                    {isAcknowledge ? "All done — you've acknowledged this form." : "All done — this form is signed."}
                  </p>
                  <p className="m-0 mt-1 text-[13px] font-bold text-[var(--sf-forest)]">
                    {signedOn ? `Signed on ${signedOn}. ` : ""}
                    {hasNext
                      ? `${formsCount(queueRemaining ?? 0)} still ${queueRemaining === 1 ? "needs" : "need"} you.`
                      : queueRemaining === 0
                        ? "Nothing else is waiting for your signature."
                        : "You can reopen it any time."}
                  </p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {isLoadingDetail ? (
            <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading form">
              <GSkeleton className="h-4 w-2/3 !rounded-full" />
              <GSkeleton className="h-3 w-full !rounded-full" />
              <GSkeleton className={`${PARENT_FORM_MODAL_PREVIEW_HEIGHT_CLASS} w-full !rounded-[18px]`} />
              <GSkeleton className="h-24 w-full !rounded-[18px]" />
            </div>
          ) : detailError ? (
            <div
              className="flex flex-col items-start gap-3 rounded-[20px] bg-[var(--sf-peach)]/70 p-5"
              role="alert"
              data-testid="parent-form-detail-error"
            >
              <p className="m-0 text-[15px] font-extrabold text-[var(--sf-clay-deep)]">We couldn&apos;t open this form.</p>
              <p className="m-0 text-[14px] font-semibold text-[var(--sf-ink)]/75">{detailError}</p>
              <button type="button" className={gBtnOutlineSm} onClick={reload}>
                <RotateCcw className="h-4 w-4" aria-hidden />
                Try again
              </button>
            </div>
          ) : (
            <>
              {detail.form.description ? (
                <p className="m-0 mb-4 whitespace-pre-line text-[15px] font-semibold leading-relaxed text-[var(--sf-ink)]/75">
                  {detail.form.description}
                </p>
              ) : null}

              {isUpload ? (
                <section aria-label="Document">
                  <GardenFormDocumentPreview
                    form={detail.form}
                    organizationId={organizationId}
                    readOnly={readOnly}
                    remoteDownloadEnabled
                    previewUrl={readOnly ? uploadPreviewUrl : null}
                    localPreviewUrl={!readOnly ? uploadPreviewUrl : null}
                    previewHeightClass={PARENT_FORM_MODAL_PREVIEW_HEIGHT_CLASS}
                  />
                </section>
              ) : null}

              {detail.form.formType === "builder" && bodyBuilderFields.length > 0 ? (
                <section aria-labelledby="parent-form-questions-heading">
                  <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <GKicker>{formReadOnly ? "Submitted" : "Step 1"}</GKicker>
                      <h3
                        id="parent-form-questions-heading"
                        className="sf-display m-0 mt-1 text-[1.15rem] leading-tight text-[var(--sf-ink)]"
                      >
                        {formReadOnly ? "Your response" : "Answer the questions"}
                      </h3>
                    </div>
                    {!formReadOnly && requiredQuestions.length > 0 ? (
                      <GChip tone={missingRequiredFields.length === 0 ? "success" : "neutral"}>
                        {missingRequiredFields.length === 0 ? "✓ " : ""}
                        {answeredCount} of {requiredQuestions.length} required answered
                      </GChip>
                    ) : null}
                  </div>
                  <GardenFormFields
                    fields={bodyBuilderFields}
                    values={fieldValues}
                    onChange={setFieldValue}
                    disabled={formReadOnly}
                    storedResponses={detail.response.responses}
                    invalidIds={invalidIds}
                  />
                </section>
              ) : null}

              {showSignSection ? (
                <section
                  ref={signSectionRef}
                  id="parent-form-sign-section"
                  aria-labelledby="parent-form-sign-heading"
                  className="mt-6 scroll-mt-4 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/15 pt-5"
                >
                  <GKicker>{formReadOnly ? "Signature" : detail.form.formType === "builder" ? "Step 2" : "Last step"}</GKicker>
                  <h3
                    id="parent-form-sign-heading"
                    className="sf-display m-0 mb-3 mt-1 text-[1.15rem] leading-tight text-[var(--sf-ink)]"
                  >
                    {formReadOnly ? "Your signature" : isAcknowledge ? "Acknowledge" : "Complete and sign"}
                  </h3>

                  {formReadOnly ? (
                    storedSignerName ? (
                      <GardenSignatureField value={storedSignerName} onChange={() => undefined} readOnly signedOn={signedOn} />
                    ) : (
                      <div className="flex items-center gap-3 rounded-[16px] bg-[var(--sf-mint)] p-4">
                        <Tick className="h-7 w-7 shrink-0" color="var(--sf-forest)" />
                        <p className="m-0 text-[14px] font-extrabold text-[var(--sf-forest)]">
                          {signedOn ? `Signed on ${signedOn}` : "Signed"}
                        </p>
                      </div>
                    )
                  ) : isAcknowledge ? (
                    <p className="m-0 rounded-[16px] bg-[var(--sf-accent-wash)] p-4 text-[14px] font-semibold text-[var(--sf-ink)]/80">
                      Review the document above, then acknowledge below.
                    </p>
                  ) : isUpload ? (
                    <GardenSignatureField
                      ref={signatureInputRef}
                      value={signerName}
                      onChange={setSignerName}
                      onSubmit={() => void handlePrimary()}
                      disabled={isSubmitting}
                      invalid={signatureInvalid}
                    />
                  ) : bodySignatureField ? (
                    <GardenSignatureField
                      ref={signatureInputRef}
                      value={builderSignatureValue}
                      onChange={setBuilderSignature}
                      onSubmit={() => void handlePrimary()}
                      disabled={isSubmitting}
                      invalid={signatureInvalid}
                    />
                  ) : null}
                </section>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </GDialog>
  );
}
