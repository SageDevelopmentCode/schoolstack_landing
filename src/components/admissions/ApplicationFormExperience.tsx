"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CopyableApplication } from "@/lib/admissions/application-copy";
import ApplyPortalBranding from "@/components/admissions/ApplyPortalBranding";
import ApplicationFieldInput from "@/components/admissions/ApplicationFieldInput";
import ApplicationStepNotice from "@/components/admissions/ApplicationStepNotice";
import PaymentMethodSelectionModal from "@/components/admissions/PaymentMethodSelectionModal";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import ButtonLoadingLabel, {
  BUTTON_LOADING_LAYOUT_CLASS,
} from "@/components/ui/ButtonLoadingLabel";
import type { SaveApplicationDraftInput } from "@/lib/admissions/application-draft";
import type { ApplicationFileUploadContext } from "@/lib/admissions/application-file-storage";
import {
  formatFeeAmount,
  type ApplicationFormFeeConfig,
  type ApplicationFormSchema,
  type ApplicationSection,
} from "@/lib/admissions/application-form-schema";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { CheckoutPaymentMethod } from "@/lib/stripe/processing-fee";
import { createClient } from "@/utils/supabase/client";

type ExperienceStep =
  | { kind: "section"; sectionIndex: number }
  | { kind: "acknowledgments" }
  | { kind: "fee" };

export type ApplicationFormExperienceProps = {
  branding: OrganizationBranding;
  schoolName: string;
  title: string;
  intro: string | null;
  schema: ApplicationFormSchema;
  feeConfig: ApplicationFormFeeConfig;
  mode?: "preview" | "live";
  applicationId?: string;
  organizationId?: string;
  initialValues?: Record<string, string>;
  initialAcknowledgments?: Record<string, boolean>;
  initialStepIndex?: number;
  initialFeeStatus?: string;
  initialStatus?: string;
  paymentReturnPending?: boolean;
  schoolSlug?: string;
  copyableApplications?: CopyableApplication[];
  priorFieldValues?: Record<string, string>;
  onImportResponses?: (
    sourceApplicationId: string,
    fieldIds?: string[],
  ) => Promise<void>;
  onSaveDraft?: (input: SaveApplicationDraftInput) => Promise<void>;
  onSubmitted?: () => void;
  showExitToApplyDashboard?: boolean;
  onExitToApplyDashboard?: () => void | Promise<void>;
};

const stepVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 16 : -16,
  }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -16 : 16,
  }),
};

const stepTransition = { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] as const };

function buildSteps(
  schema: ApplicationFormSchema,
  feeConfig: ApplicationFormFeeConfig,
): ExperienceStep[] {
  const steps: ExperienceStep[] = schema.sections.map((_, sectionIndex) => ({
    kind: "section",
    sectionIndex,
  }));
  if (schema.acknowledgments.length > 0) {
    steps.push({ kind: "acknowledgments" });
  }
  if (feeConfig.enabled) {
    steps.push({ kind: "fee" });
  }
  return steps;
}

function getStepLabel(
  step: ExperienceStep | undefined,
  schema: ApplicationFormSchema,
  stepIndex: number,
  totalSteps: number,
): string {
  const prefix = `Step ${stepIndex + 1} of ${totalSteps}`;
  if (!step) return prefix;
  if (step.kind === "section") {
    const sectionTitle = schema.sections[step.sectionIndex]?.title;
    return sectionTitle ? `${prefix} · ${sectionTitle}` : prefix;
  }
  if (step.kind === "acknowledgments") {
    return `${prefix} · Acknowledgments`;
  }
  return `${prefix} · Application fee`;
}

export default function ApplicationFormExperience({
  branding,
  schoolName,
  title,
  intro,
  schema,
  feeConfig,
  mode = "preview",
  applicationId,
  organizationId,
  initialValues,
  initialAcknowledgments,
  initialStepIndex = 0,
  initialFeeStatus = "not_required",
  initialStatus = "draft",
  paymentReturnPending = false,
  schoolSlug,
  copyableApplications = [],
  priorFieldValues = {},
  onImportResponses,
  onSaveDraft,
  onSubmitted,
  showExitToApplyDashboard = false,
  onExitToApplyDashboard,
}: ApplicationFormExperienceProps) {
  const isLive = mode === "live";
  const canPersist = isLive && Boolean(applicationId && onSaveDraft);
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(
    () => (canPersist ? createClient() : null),
    [canPersist],
  );
  const uploadContext = useMemo<ApplicationFileUploadContext | undefined>(() => {
    if (!canPersist || !applicationId || !organizationId) return undefined;
    return { applicationId, organizationId };
  }, [applicationId, canPersist, organizationId]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const steps = useMemo(
    () => buildSteps(schema, feeConfig),
    [schema, feeConfig],
  );

  const [stepIndex, setStepIndex] = useState(() =>
    Math.min(Math.max(0, initialStepIndex), Math.max(0, buildSteps(schema, feeConfig).length - 1)),
  );
  const [direction, setDirection] = useState(1);
  const [values, setValues] = useState<Record<string, string>>(
    () => initialValues ?? {},
  );
  const [acknowledgments, setAcknowledgments] = useState<Record<string, boolean>>(
    () => initialAcknowledgments ?? {},
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feeStatus, setFeeStatus] = useState(initialFeeStatus);
  const [applicationStatus, setApplicationStatus] = useState(initialStatus);
  const [awaitingPaymentConfirmation, setAwaitingPaymentConfirmation] =
    useState(paymentReturnPending);
  const [bulkCopySourceId, setBulkCopySourceId] = useState(
    () => copyableApplications[0]?.id ?? "",
  );
  const [importing, setImporting] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const currentStep = steps[stepIndex];
  const totalSteps = steps.length;
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === totalSteps - 1;

  const stepLabel = getStepLabel(currentStep, schema, stepIndex, totalSteps);

  const section =
    currentStep?.kind === "section"
      ? schema.sections[currentStep.sectionIndex]
      : null;

  const stepContentKey = currentStep
    ? currentStep.kind === "section"
      ? `section-${currentStep.sectionIndex}`
      : currentStep.kind
    : "empty";

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateValue = (fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    setSaveError(null);
  };

  const persistDraft = async (nextStepIndex: number) => {
    if (!onSaveDraft) return;
    await onSaveDraft({
      responses: values,
      acknowledgments,
      stepIndex: nextStepIndex,
    });
  };

  const handleSaveAndContinueLater = async () => {
    if (!canPersist || !onExitToApplyDashboard) return;

    setSaving(true);
    setSaveError(null);
    try {
      await persistDraft(stepIndex);
      await onExitToApplyDashboard();
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to save your progress.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = async () => {
    if (stepIndex >= totalSteps - 1) return;

    const nextStepIndex = stepIndex + 1;

    if (canPersist) {
      setSaving(true);
      setSaveError(null);
      try {
        await persistDraft(nextStepIndex);
        setDirection(1);
        setStepIndex(nextStepIndex);
        scrollToTop();
      } catch (error) {
        setSaveError(
          error instanceof Error ? error.message : "Failed to save your progress.",
        );
      } finally {
        setSaving(false);
      }
      return;
    }

    setDirection(1);
    setStepIndex(nextStepIndex);
    scrollToTop();
  };

  const handleBack = async () => {
    if (stepIndex <= 0) return;

    const previousStepIndex = stepIndex - 1;

    if (canPersist) {
      setSaving(true);
      setSaveError(null);
      try {
        await persistDraft(previousStepIndex);
        setDirection(-1);
        setStepIndex(previousStepIndex);
        scrollToTop();
      } catch (error) {
        setSaveError(
          error instanceof Error ? error.message : "Failed to save your progress.",
        );
      } finally {
        setSaving(false);
      }
      return;
    }

    setDirection(-1);
    setStepIndex(previousStepIndex);
    scrollToTop();
  };

  const allAcknowledged =
    schema.acknowledgments.length === 0 ||
    schema.acknowledgments.every((item) => acknowledgments[item.id]);

  const handlePayFee = async () => {
    if (!applicationId || !isLive) return;

    setSaveError(null);

    try {
      if (canPersist) {
        setSaving(true);
        await persistDraft(stepIndex);
        setSaving(false);
      }
      setPaymentModalOpen(true);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to save your progress.",
      );
      setSaving(false);
    }
  };

  const handleConfirmPayment = async (paymentMethod: CheckoutPaymentMethod) => {
    if (!applicationId || !isLive) return;

    setActionLoading(true);
    setSaveError(null);

    try {
      const response = await fetch(
        `/api/admissions/applications/${applicationId}/checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentMethod }),
        },
      );
      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Failed to start checkout.");
      }

      window.location.href = payload.url;
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to start checkout.",
      );
      setActionLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!applicationId || !isLive) return;

    setActionLoading(true);
    setSaveError(null);

    try {
      if (canPersist) {
        await persistDraft(stepIndex);
      }

      const response = await fetch(
        `/api/admissions/applications/${applicationId}/submit`,
        { method: "POST" },
      );
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to submit application.");
      }

      setApplicationStatus("submitted");
      onSubmitted?.();
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to submit application.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkCopy = async () => {
    if (!onImportResponses || !bulkCopySourceId) return;

    setImporting(true);
    setSaveError(null);
    try {
      await onImportResponses(bulkCopySourceId);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to copy previous answers.",
      );
    } finally {
      setImporting(false);
    }
  };

  const handleReuseField = async (fieldId: string) => {
    const value = priorFieldValues[fieldId];
    if (!value) return;

    const nextValues = { ...values, [fieldId]: value };
    setValues(nextValues);
    setSaveError(null);

    if (canPersist && onSaveDraft) {
      setSaving(true);
      try {
        await onSaveDraft({
          responses: nextValues,
          acknowledgments,
          stepIndex,
        });
      } catch (error) {
        setSaveError(
          error instanceof Error ? error.message : "Failed to save your progress.",
        );
      } finally {
        setSaving(false);
      }
    }
  };

  const pageBg = branding.colors.bg;

  if (applicationStatus !== "draft") {
    return (
      <SubmittedConfirmation
        branding={branding}
        schoolName={schoolName}
        schoolSlug={schoolSlug}
        title={title}
        awaitingPaymentConfirmation={awaitingPaymentConfirmation}
      />
    );
  }

  if (schema.sections.length === 0) {
    return (
      <div
        className="flex h-full flex-col items-center justify-center px-6 py-12 text-center"
        style={{ backgroundColor: pageBg }}
      >
        <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
          Add at least one step to preview the form.
        </p>
        <p className="mt-2 text-sm" style={{ color: C.textSecondary }}>
          Families will see your application questions here once steps are added.
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-1 min-h-0 flex-col"
      style={{ backgroundColor: pageBg, color: C.textPrimary }}
    >
      <div
        ref={scrollContainerRef}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6"
      >
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ApplyPortalBranding
              branding={branding}
              schoolName={schoolName}
              className="min-w-0"
              schoolLogoClassName="h-7 w-auto max-w-[min(200px,70vw)] object-contain sm:h-8"
            />
            {showExitToApplyDashboard && canPersist && onExitToApplyDashboard ? (
              <button
                type="button"
                onClick={() => void handleSaveAndContinueLater()}
                disabled={saving}
                className="inline-flex shrink-0 items-center gap-1.5 text-xs font-normal transition hover:underline disabled:opacity-50"
                style={{ color: C.textTertiary }}
              >
                <ButtonLoadingLabel loading={saving} loadingLabel="Saving…">
                  Save & Continue later
                </ButtonLoadingLabel>
              </button>
            ) : null}
          </div>

          <AnimatePresence mode="wait" initial={false} custom={direction}>
            {isFirstStep && (title || intro) ? (
              <motion.div
                key="intro"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={stepTransition}
                className="mb-8"
              >
                {title ? (
                  <h1
                    className="text-2xl font-semibold leading-tight sm:text-3xl"
                    style={{ color: C.accentDark }}
                  >
                    {title}
                  </h1>
                ) : null}
                {intro ? (
                  <p
                    className="mt-4 text-sm leading-relaxed"
                    style={{ color: C.textPrimary }}
                  >
                    {intro}
                  </p>
                ) : null}
              </motion.div>
            ) : null}
          </AnimatePresence>

          <p
            className="mb-2 text-xs font-medium"
            style={{ color: C.textSecondary }}
          >
            {stepLabel}
          </p>
          <div className="mb-6 flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className="h-1.5 flex-1 rounded-full transition-colors"
                style={{
                  backgroundColor: index <= stepIndex ? C.accent : C.border,
                }}
              />
            ))}
          </div>

          {isFirstStep && copyableApplications.length > 0 && onImportResponses ? (
            <div
              className="mb-6 rounded-lg border px-4 py-4"
              style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
            >
              <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
                Applying for another child?
              </p>
              <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
                Copy answers from a previous application, then update student-specific
                details.
              </p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <select
                  value={bulkCopySourceId}
                  onChange={(event) => setBulkCopySourceId(event.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm sm:max-w-xs"
                  style={{
                    borderColor: C.inputBorder,
                    backgroundColor: C.input,
                    color: C.textPrimary,
                  }}
                >
                  {copyableApplications.map((application) => (
                    <option key={application.id} value={application.id}>
                      {application.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => void handleBulkCopy()}
                  disabled={importing || !bulkCopySourceId}
                  className={`rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-60 ${BUTTON_LOADING_LAYOUT_CLASS}`}
                  style={getAdminButtonStyle(C, "primary")}
                >
                  <ButtonLoadingLabel loading={importing} loadingLabel="Copying…">
                    Copy answers
                  </ButtonLoadingLabel>
                </button>
              </div>
            </div>
          ) : null}

          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={stepContentKey}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={stepTransition}
            >
              {currentStep?.kind === "acknowledgments" ? (
                <AcknowledgmentsStep
                  C={C}
                  schema={schema}
                  acknowledgments={acknowledgments}
                  onAckChange={(id, checked) =>
                    setAcknowledgments((prev) => ({ ...prev, [id]: checked }))
                  }
                />
              ) : currentStep?.kind === "fee" ? (
                <FeeStep C={C} feeConfig={feeConfig} feeStatus={feeStatus} />
              ) : section ? (
                <SectionStep
                  C={C}
                  section={section}
                  values={values}
                  onChange={updateValue}
                  priorFieldValues={priorFieldValues}
                  onReuseField={(fieldId) => void handleReuseField(fieldId)}
                  supabase={supabase ?? undefined}
                  uploadContext={uploadContext}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <footer
        className="shrink-0 border-t px-4 py-3 pb-safe sm:px-6 sm:py-4"
        style={{ borderColor: C.border, backgroundColor: pageBg }}
      >
        <div className="mx-auto max-w-3xl">
          <p
            className="mb-3 text-center text-xs font-medium sm:hidden"
            style={{ color: C.textSecondary }}
          >
            {stepLabel}
          </p>
          {saveError ? (
            <p
              className="mb-3 rounded-md border px-3 py-2 text-sm"
              style={{
                borderColor: C.errorBorder,
                backgroundColor: C.surface,
                color: C.error,
              }}
              role="alert"
            >
              {saveError}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
          {!isFirstStep ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={saving}
              className="w-full rounded-md border px-4 py-2.5 text-center text-sm font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              style={getAdminButtonStyle(C, "secondary")}
            >
              Back
            </button>
          ) : null}

          <div className="flex w-full flex-col gap-3 sm:ml-auto sm:w-auto sm:flex-row">
            {currentStep?.kind === "fee" ? (
              <button
                type="button"
                onClick={handlePayFee}
                disabled={
                  !isLive
                    ? false
                    : actionLoading ||
                      saving ||
                      feeStatus === "paid" ||
                      (feeConfig.amount_cents ?? 0) <= 0
                }
                className="w-full rounded-md px-5 py-2.5 text-center text-sm font-semibold text-white transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                style={getAdminButtonStyle(C, "primary")}
              >
                {actionLoading || saving
                  ? "Preparing checkout…"
                  : `Pay ${formatFeeAmount(feeConfig.amount_cents ?? 0)}`}
                {!isLive ? " (preview)" : ""}
              </button>
            ) : currentStep?.kind === "acknowledgments" && !feeConfig.enabled ? (
              <button
                type="button"
                onClick={isLive ? handleSubmit : undefined}
                disabled={
                  !allAcknowledged ||
                  (isLive && (actionLoading || saving))
                }
                className={`w-full rounded-md px-5 py-2.5 text-center text-sm font-semibold text-white transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${BUTTON_LOADING_LAYOUT_CLASS}`}
                style={getAdminButtonStyle(C, "primary")}
              >
                <ButtonLoadingLabel loading={actionLoading} loadingLabel="Submitting…">
                  Submit application
                </ButtonLoadingLabel>
                {!isLive ? " (preview)" : ""}
              </button>
            ) : isLastStep ? (
              <button
                type="button"
                onClick={isLive ? handleSubmit : undefined}
                disabled={isLive && (actionLoading || saving)}
                className={`w-full rounded-md px-5 py-2.5 text-center text-sm font-semibold text-white transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${BUTTON_LOADING_LAYOUT_CLASS}`}
                style={getAdminButtonStyle(C, "primary")}
              >
                <ButtonLoadingLabel loading={actionLoading} loadingLabel="Submitting…">
                  Submit application
                </ButtonLoadingLabel>
                {!isLive ? " (preview)" : ""}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleContinue}
                disabled={
                  saving ||
                  (currentStep?.kind === "acknowledgments" && !allAcknowledged)
                }
                className={`w-full rounded-md px-5 py-2.5 text-center text-sm font-semibold text-white transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${BUTTON_LOADING_LAYOUT_CLASS}`}
                style={getAdminButtonStyle(C, "primary")}
              >
                <ButtonLoadingLabel loading={saving} loadingLabel="Saving…">
                  {currentStep?.kind === "acknowledgments"
                    ? "Continue"
                    : "Save and continue"}
                </ButtonLoadingLabel>
              </button>
            )}
          </div>
          </div>
        </div>
      </footer>

      {feeConfig.enabled && (feeConfig.amount_cents ?? 0) > 0 ? (
        <PaymentMethodSelectionModal
          C={C}
          open={paymentModalOpen}
          onClose={() => {
            if (!actionLoading) setPaymentModalOpen(false);
          }}
          netAmountCents={feeConfig.amount_cents ?? 0}
          label={feeConfig.label ?? "Application fee"}
          loading={actionLoading}
          onConfirm={handleConfirmPayment}
        />
      ) : null}
    </div>
  );
}

function SectionStep({
  C,
  section,
  values,
  onChange,
  priorFieldValues,
  onReuseField,
  supabase,
  uploadContext,
}: {
  C: ReturnType<typeof buildAdminThemeTokens>;
  section: ApplicationSection;
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
  priorFieldValues?: Record<string, string>;
  onReuseField?: (fieldId: string) => void;
  supabase?: SupabaseClient;
  uploadContext?: ApplicationFileUploadContext;
}) {
  const topNotice =
    section.stepNotice?.body.trim() &&
    section.stepNotice.placement === "top"
      ? section.stepNotice.body.trim()
      : null;
  const bottomNotice =
    section.stepNotice?.body.trim() &&
    section.stepNotice.placement === "bottom"
      ? section.stepNotice.body.trim()
      : null;

  return (
    <div>
      <h2 className="text-lg font-semibold sm:text-xl" style={{ color: C.accentDark }}>
        {section.title}
      </h2>
      {section.description ? (
        <p className="mt-2 text-sm" style={{ color: C.textSecondary }}>
          {section.description}
        </p>
      ) : null}
      {topNotice ? (
        <ApplicationStepNotice body={topNotice} C={C} className="mt-5" />
      ) : null}
      <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
        {section.fields.map((field) => {
          const isAddress = field.type === "address";
          const isRadio = field.type === "radio";
          const useDivWrapper = isAddress || isRadio;
          const wrapperClassName = useDivWrapper
            ? "block min-w-0 sm:col-span-2"
            : field.width === "half"
              ? "block min-w-0"
              : "block min-w-0 sm:col-span-2";

          const fieldLabel =
            field.type !== "checkbox" ? (
              <span
                className="mb-1.5 flex items-center justify-between gap-2 text-sm font-medium"
                style={{ color: C.textPrimary }}
              >
                <span>
                  {field.label}
                  {field.required ? (
                    <span style={{ color: C.accent }}> *</span>
                  ) : null}
                </span>
                {field.type !== "file" &&
                priorFieldValues?.[field.id] &&
                onReuseField ? (
                  <button
                    type="button"
                    onClick={() => onReuseField(field.id)}
                    className="text-xs font-medium underline-offset-2 hover:underline"
                    style={{ color: C.accent }}
                  >
                    Reuse answer
                  </button>
                ) : null}
              </span>
            ) : null;

          const fieldInput = (
            <ApplicationFieldInput
              field={field}
              value={values[field.id] ?? ""}
              onChange={(value) => onChange(field.id, value)}
              C={C}
              supabase={supabase}
              uploadContext={uploadContext}
            />
          );

          if (useDivWrapper) {
            return (
              <div key={field.id} className={wrapperClassName}>
                {fieldLabel}
                {fieldInput}
              </div>
            );
          }

          return (
            <label key={field.id} className={wrapperClassName}>
              {fieldLabel}
              {fieldInput}
            </label>
          );
        })}
      </div>
      {bottomNotice ? (
        <ApplicationStepNotice body={bottomNotice} C={C} className="mt-5" />
      ) : null}
    </div>
  );
}

function AcknowledgmentsStep({
  C,
  schema,
  acknowledgments,
  onAckChange,
}: {
  C: ReturnType<typeof buildAdminThemeTokens>;
  schema: ApplicationFormSchema;
  acknowledgments: Record<string, boolean>;
  onAckChange: (id: string, checked: boolean) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold sm:text-xl" style={{ color: C.accentDark }}>
        Parent acknowledgments
      </h2>
      <p className="mt-2 text-sm" style={{ color: C.textSecondary }}>
        Please confirm the following before submitting your application.
      </p>
      <div className="mt-5 space-y-4">
        {schema.acknowledgments.map((item) => (
          <label
            key={item.id}
            className="flex items-start gap-3 rounded-md border px-4 py-3"
            style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
          >
            <input
              type="checkbox"
              checked={Boolean(acknowledgments[item.id])}
              onChange={(e) => onAckChange(item.id, e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ accentColor: C.accent }}
            />
            <span className="text-sm leading-relaxed" style={{ color: C.textPrimary }}>
              {item.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function FeeStep({
  C,
  feeConfig,
  feeStatus,
}: {
  C: ReturnType<typeof buildAdminThemeTokens>;
  feeConfig: ApplicationFormFeeConfig;
  feeStatus?: string;
}) {
  const amount = formatFeeAmount(feeConfig.amount_cents ?? 0);

  return (
    <div>
      <h2 className="text-lg font-semibold sm:text-xl" style={{ color: C.accentDark }}>
        Application fee
      </h2>
      <p className="mt-2 text-sm" style={{ color: C.textSecondary }}>
        {feeStatus === "paid"
          ? "Your application fee has been paid."
          : "Review the application fee before submitting."}
      </p>
      <div
        className="mt-6 rounded-lg border px-5 py-4"
        style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
      >
        <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
          {feeConfig.label ?? "Application fee"}
        </p>
        <p className="mt-1 text-2xl font-semibold" style={{ color: C.accentDark }}>
          {amount}
        </p>
      </div>
    </div>
  );
}

function SubmittedConfirmation({
  branding,
  schoolName,
  schoolSlug,
  title,
  awaitingPaymentConfirmation,
}: {
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug?: string;
  title: string;
  awaitingPaymentConfirmation: boolean;
}) {
  const router = useRouter();
  const C = buildAdminThemeTokens(branding);
  const pageBg = branding.colors.bg;
  const applyDashboardHref = schoolSlug ? `/school/${schoolSlug}/apply` : null;

  useEffect(() => {
    if (awaitingPaymentConfirmation || !applyDashboardHref) return;

    const timer = window.setTimeout(() => {
      router.push(applyDashboardHref);
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [applyDashboardHref, awaitingPaymentConfirmation, router]);

  return (
    <div
      className="flex h-full min-h-dvh flex-col items-center justify-center px-6 py-12 text-center"
      style={{ backgroundColor: pageBg, color: C.textPrimary }}
    >
      <SchoolDemoWordmark
        logo={{
          src: branding.logo.src,
          alt: branding.logo.alt || schoolName,
          width: branding.logo.width,
          height: branding.logo.height,
          text: branding.logo.src ? undefined : schoolName,
        }}
        className="mb-8 h-8 w-auto max-w-[200px] object-contain"
      />
      {awaitingPaymentConfirmation ? (
        <>
          <Loader2
            className="mx-auto h-8 w-8 animate-spin"
            style={{ color: C.accent }}
          />
          <h1
            className="mt-6 text-xl font-semibold sm:text-2xl"
            style={{ color: C.accentDark }}
          >
            Confirming your payment…
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed" style={{ color: C.textSecondary }}>
            This usually takes a few seconds. Please keep this page open.
          </p>
        </>
      ) : (
        <>
          <CheckCircle2 className="mx-auto h-10 w-10" style={{ color: C.accent }} />
          <h1
            className="mt-6 text-xl font-semibold sm:text-2xl"
            style={{ color: C.accentDark }}
          >
            Application submitted
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed" style={{ color: C.textSecondary }}>
            Thank you for submitting{" "}
            <span className="font-medium" style={{ color: C.textPrimary }}>
              {title}
            </span>
            . {schoolName} will be in touch about next steps.
          </p>
          {applyDashboardHref ? (
            <Link
              href={applyDashboardHref}
              className="mt-6 inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              style={getAdminButtonStyle(C, "primary")}
            >
              View your applications
            </Link>
          ) : null}
        </>
      )}
    </div>
  );
}
