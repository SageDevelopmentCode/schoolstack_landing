"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { CopyableApplication } from "@/lib/admissions/application-copy";
import PortalHelpFab from "@/components/school/shared/PortalHelpFab";
import ApplicationCheckboxInput from "@/components/admissions/ApplicationCheckboxInput";
import { ApplicationFieldAppearanceProvider } from "@/components/admissions/application-field-appearance";
import ApplicationGardenSection from "@/components/admissions/garden/ApplicationGardenSection";
import ApplyGardenShell, {
  ApplyBrandPill,
  ApplyGardenBackdrop,
} from "@/components/admissions/garden/ApplyGardenShell";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import {
  G_FOCUS,
  G_INPUT,
  gBtnOutlineSm,
  gBtnPop,
  gLinkSm,
} from "@/components/school-parent/garden/ui";
import { PORTAL_EASE, useCelebrate } from "@/components/school-parent/garden/motion";
import { Tick } from "@/components/garden/ui";
import ButtonLoadingLabel, {
  BUTTON_LOADING_LAYOUT_CLASS,
} from "@/components/ui/ButtonLoadingLabel";
import type { SaveApplicationDraftInput } from "@/lib/admissions/application-draft";
import type { ApplicationFileUploadContext } from "@/lib/admissions/application-file-storage";
import { validateApplicationSectionResponses, validateApplicationForSubmit } from "@/lib/admissions/application-form-validation";
import {
  formatFeeAmount,
  type ApplicationFormFeeConfig,
  type ApplicationFormSchema,
} from "@/lib/admissions/application-form-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  buildParentThemeTokens,
  parentThemeToGardenCompat,
  type ParentThemeTokens,
} from "@/lib/organization-settings/parent-theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { CheckoutPaymentMethod } from "@/lib/stripe/processing-fee";
import {
  parseOperationalError,
  reportPublicApplyOperationalError,
  shouldReportApplyClientError,
} from "@/lib/operational-errors-client";
import { createClient } from "@/utils/supabase/client";

const PaymentMethodSelectionModal = dynamic(
  () => import("@/components/admissions/PaymentMethodSelectionModal"),
);

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
  copyableApplications?: Pick<
    CopyableApplication,
    "id" | "submittedAt" | "label"
  >[];
  priorFieldValues?: Record<string, string>;
  onImportResponses?: (
    sourceApplicationId: string,
    fieldIds?: string[],
  ) => Promise<void>;
  onSaveDraft?: (input: SaveApplicationDraftInput) => Promise<void>;
  onSubmitted?: () => void;
  showExitToApplyDashboard?: boolean;
  onExitToApplyDashboard?: () => void | Promise<void>;
  helpButton?: {
    organizationId: string;
    userEmail?: string | null;
    currentPath?: string;
    submitEndpoint: string;
  };
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

const stepTransition = { duration: 0.24, ease: PORTAL_EASE };

function reportApplyOperationalError(
  organizationId: string | undefined,
  applicationId: string | undefined,
  operation: string,
  err: unknown,
  responseStatus?: number,
) {
  if (!organizationId || !shouldReportApplyClientError(err, responseStatus)) {
    return;
  }

  const parsed = parseOperationalError(err);
  void reportPublicApplyOperationalError({
    organizationId,
    operation,
    error: parsed.message,
    code: parsed.code,
    details: parsed.details,
    entityType: applicationId ? "application" : undefined,
    entityId: applicationId,
    notify: true,
  });
}

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
  helpButton,
}: ApplicationFormExperienceProps) {
  const isLive = mode === "live";
  const canPersist = isLive && Boolean(applicationId && onSaveDraft);
  const gardenTheme = useMemo(() => buildParentThemeTokens(branding), [branding]);
  // Garden ink/paper with the school accent; inputs and portalled popups read these.
  const C = useMemo(() => parentThemeToGardenCompat(gardenTheme), [gardenTheme]);
  const reduceMotion = useReducedMotion() === true;
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState(false);
  const [feeStatus, setFeeStatus] = useState(initialFeeStatus);
  const [applicationStatus, setApplicationStatus] = useState(initialStatus);
  const [awaitingPaymentConfirmation, setAwaitingPaymentConfirmation] =
    useState(paymentReturnPending);
  const [bulkCopySourceId, setBulkCopySourceId] = useState(
    () => copyableApplications[0]?.id ?? "",
  );
  const [importing, setImporting] = useState(false);
  const [bulkCopyExpanded, setBulkCopyExpanded] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const currentStep = steps[stepIndex];
  const totalSteps = steps.length;
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === totalSteps - 1;
  const showBulkCopyPanel =
    isFirstStep && copyableApplications.length > 0 && !!onImportResponses;

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
    setFieldErrors((prev) => {
      if (!prev[fieldId]) return prev;
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  };

  const scrollToFirstFieldError = (errors: Record<string, string>) => {
    const firstFieldId = Object.keys(errors)[0];
    if (!firstFieldId) return;

    requestAnimationFrame(() => {
      const element = document.querySelector(`[data-field-id="${firstFieldId}"]`);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      const focusable = element?.querySelector<HTMLElement>(
        "input, textarea, button, select, [tabindex]:not([tabindex='-1'])",
      );
      focusable?.focus({ preventScroll: true });
    });
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
      reportApplyOperationalError(
        organizationId,
        applicationId,
        "application_form.save_and_exit",
        error,
      );
      setSaveError(
        error instanceof Error ? error.message : "Failed to save your progress.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = async () => {
    if (stepIndex >= totalSteps - 1) return;

    if (currentStep?.kind === "section" && section) {
      const errors = validateApplicationSectionResponses(section, values);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setSaveError(null);
        scrollToFirstFieldError(errors);
        return;
      }
      setFieldErrors({});
    }

    const nextStepIndex = stepIndex + 1;

    if (canPersist) {
      setSaving(true);
      setSaveError(null);
      try {
        await persistDraft(nextStepIndex);
        setDirection(1);
        setStepIndex(nextStepIndex);
        setFieldErrors({});
        scrollToTop();
      } catch (error) {
        reportApplyOperationalError(
          organizationId,
          applicationId,
          "application_form.continue_save",
          error,
        );
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
    setFieldErrors({});
    scrollToTop();
  };

  const handleBack = () => goToEarlierStep(stepIndex - 1);

  /** Back, or a jump back from the steps rail: saves like Back always has. */
  const goToEarlierStep = async (previousStepIndex: number) => {
    if (previousStepIndex < 0 || previousStepIndex >= stepIndex) return;

    if (canPersist) {
      setSaving(true);
      setSaveError(null);
      try {
        await persistDraft(previousStepIndex);
        setDirection(-1);
        setStepIndex(previousStepIndex);
        setFieldErrors({});
        scrollToTop();
      } catch (error) {
        reportApplyOperationalError(
          organizationId,
          applicationId,
          "application_form.back_save",
          error,
        );
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
    setFieldErrors({});
    scrollToTop();
  };

  const allAcknowledged =
    schema.acknowledgments.length === 0 ||
    schema.acknowledgments.every((item) => acknowledgments[item.id]);

  const handlePayFee = async () => {
    if (!applicationId || !isLive) return;

    setSaveError(null);

    const validationError = validateApplicationForSubmit(schema, {
      responses: values,
      acknowledgments,
    });
    if (validationError) {
      setSaveError(validationError.error);
      return;
    }

    try {
      if (canPersist) {
        setSaving(true);
        await persistDraft(stepIndex);
        setSaving(false);
      }
      setPaymentModalOpen(true);
    } catch (error) {
      reportApplyOperationalError(
        organizationId,
        applicationId,
        "application_form.pay_fee_save",
        error,
      );
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

    const validationError = validateApplicationForSubmit(schema, {
      responses: values,
      acknowledgments,
    });
    if (validationError) {
      setSaveError(validationError.error);
      setActionLoading(false);
      return;
    }

    let responseStatus: number | undefined;
    try {
      const response = await fetch(
        `/api/admissions/applications/${applicationId}/checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentMethod }),
        },
      );
      responseStatus = response.status;
      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Failed to start checkout.");
      }

      window.location.href = payload.url;
    } catch (error) {
      reportApplyOperationalError(
        organizationId,
        applicationId,
        "application_form.checkout",
        error,
        responseStatus,
      );
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

    let responseStatus: number | undefined;
    try {
      if (canPersist) {
        await persistDraft(stepIndex);
      }

      const response = await fetch(
        `/api/admissions/applications/${applicationId}/submit`,
        { method: "POST" },
      );
      responseStatus = response.status;
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to submit application.");
      }

      setApplicationStatus("submitted");
      onSubmitted?.();
    } catch (error) {
      reportApplyOperationalError(
        organizationId,
        applicationId,
        "application_form.submit",
        error,
        responseStatus,
      );
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
      setBulkCopyExpanded(false);
    } catch (error) {
      reportApplyOperationalError(
        organizationId,
        applicationId,
        "application_form.import_responses",
        error,
      );
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
        reportApplyOperationalError(
          organizationId,
          applicationId,
          "application_form.reuse_field_save",
          error,
        );
        setSaveError(
          error instanceof Error ? error.message : "Failed to save your progress.",
        );
      } finally {
        setSaving(false);
      }
    }
  };

  if (applicationStatus !== "draft") {
    return (
      <SubmittedConfirmation
        branding={branding}
        theme={gardenTheme}
        schoolName={schoolName}
        schoolSlug={schoolSlug}
        title={title}
        awaitingPaymentConfirmation={awaitingPaymentConfirmation}
      />
    );
  }

  if (schema.sections.length === 0) {
    return (
      <ParentGardenFrame
        theme={gardenTheme}
        className="flex h-full flex-col items-center justify-center bg-[var(--sf-cream)] px-6 py-12 text-center"
      >
        <p className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">
          Add at least one step to preview the form.
        </p>
        <p className="m-0 mt-2 text-sm font-semibold text-[var(--sf-soft)]">
          Families will see your application questions here once steps are added.
        </p>
      </ParentGardenFrame>
    );
  }

  const canSaveAndExit = showExitToApplyDashboard && canPersist && Boolean(onExitToApplyDashboard);
  const motionProps = reduceMotion
    ? {}
    : {
        custom: direction,
        variants: stepVariants,
        initial: "enter" as const,
        animate: "center" as const,
        exit: "exit" as const,
        transition: stepTransition,
      };

  return (
    <ParentGardenFrame
      theme={gardenTheme}
      className="relative flex min-h-0 flex-1 flex-col bg-[var(--sf-cream)] text-[var(--sf-ink)]"
    >
      <div ref={scrollContainerRef} className="relative min-h-0 flex-1 overflow-y-auto">
        <ApplyGardenBackdrop />
        <div className="relative mx-auto w-full min-w-0 max-w-[1120px] px-4 pb-10 pt-5 sm:px-8 sm:pt-6 lg:px-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
            <ApplyBrandPill branding={branding} schoolName={schoolName} />
            {canSaveAndExit || helpButton ? (
              <div className="flex items-center gap-3">
                {canSaveAndExit ? (
                  <button
                    type="button"
                    onClick={() => void handleSaveAndContinueLater()}
                    disabled={saving}
                    className={`${gLinkSm} !text-[13px] disabled:opacity-50 lg:hidden`}
                  >
                    <ButtonLoadingLabel loading={saving} loadingLabel="Saving…">
                      Save & Continue later
                    </ButtonLoadingLabel>
                  </button>
                ) : null}
                {helpButton ? (
                  <PortalHelpFab
                    C={C}
                    theme={gardenTheme}
                    organizationId={helpButton.organizationId}
                    userEmail={helpButton.userEmail}
                    currentPath={helpButton.currentPath}
                    submitEndpoint={helpButton.submitEndpoint}
                    variant="inline"
                    className="shrink-0"
                  />
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-8">
            {/* Rail: what this is, and where you are. */}
            <aside className="min-w-0 lg:sticky lg:top-6">
              <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]">
                Application · {schoolName}
              </p>
              {title ? (
                <h1 className="sf-display m-0 mt-2 text-[1.85rem] leading-[1.05] text-[var(--sf-ink)] sm:text-[2.3rem] lg:text-[2.5rem]">
                  {title}
                </h1>
              ) : null}
              {intro ? (
                <p
                  className={`m-0 mt-3 whitespace-pre-line text-[15px] font-semibold leading-relaxed text-[var(--sf-soft)] ${
                    isFirstStep ? "" : "hidden lg:line-clamp-4 lg:block"
                  }`}
                >
                  {intro}
                </p>
              ) : null}

              <nav
                aria-label="Application steps"
                className="mt-6 hidden rounded-[22px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-3 shadow-[0_3px_0_0_rgba(43,36,29,0.06)] lg:block"
              >
                <ol className="m-0 flex list-none flex-col gap-0.5 p-0">
                  {steps.map((step, index) => {
                    const done = index < stepIndex;
                    const current = index === stepIndex;
                    const name = stepName(step, schema, index);
                    const dot = done ? (
                      <Tick className="h-6 w-6" />
                    ) : (
                      <span
                        aria-hidden
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[11.5px] font-extrabold tabular-nums ${
                          current
                            ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white shadow-[0_2px_0_0_var(--sf-ink)]"
                            : "border-[var(--sf-ink)]/25 bg-white text-[var(--sf-ink)]/55"
                        }`}
                      >
                        {index + 1}
                      </span>
                    );
                    const body = (
                      <>
                        {dot}
                        <span
                          className={`min-w-0 flex-1 truncate text-[14px] ${
                            current
                              ? "font-extrabold text-[var(--sf-ink)]"
                              : done
                                ? "font-bold text-[var(--sf-ink)]/70"
                                : "font-semibold text-[var(--sf-ink)]/50"
                          }`}
                        >
                          {name}
                        </span>
                        {done ? <span className="sr-only">(done)</span> : null}
                      </>
                    );
                    return (
                      <li key={`${step.kind}-${index}`}>
                        {done ? (
                          <button
                            type="button"
                            onClick={() => void goToEarlierStep(index)}
                            disabled={saving}
                            className={`flex w-full items-center gap-2.5 rounded-[12px] px-2.5 py-2 text-left transition-colors hover:bg-[var(--sf-accent-wash)] disabled:cursor-wait ${G_FOCUS} focus-visible:ring-inset`}
                          >
                            {body}
                          </button>
                        ) : (
                          <div
                            aria-current={current ? "step" : undefined}
                            className={`flex items-center gap-2.5 rounded-[12px] px-2.5 py-2 ${
                              current ? "bg-[var(--sf-accent-wash)] ring-[1.5px] ring-[var(--sf-clay)]/30" : ""
                            }`}
                          >
                            {body}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
                {canSaveAndExit ? (
                  <div className="mt-2 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/12 px-2.5 pt-3">
                    <button
                      type="button"
                      onClick={() => void handleSaveAndContinueLater()}
                      disabled={saving}
                      className={`${gLinkSm} !text-[13px] disabled:opacity-50`}
                    >
                      <ButtonLoadingLabel loading={saving} loadingLabel="Saving…">
                        Save & Continue later
                      </ButtonLoadingLabel>
                    </button>
                  </div>
                ) : null}
              </nav>
            </aside>

            <div className="flex min-w-0 flex-col gap-5">
              {showBulkCopyPanel ? (
                <div className="rounded-[20px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-sky)] px-4 py-3.5 sm:px-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="m-0 text-[14.5px] font-extrabold text-[var(--sf-ink)]">
                      Applying for another child?
                    </p>
                    <button
                      type="button"
                      onClick={() => setBulkCopyExpanded((open) => !open)}
                      aria-expanded={bulkCopyExpanded}
                      aria-controls="bulk-copy-panel"
                      className={`${gLinkSm} shrink-0 !text-[13.5px]`}
                    >
                      {bulkCopyExpanded ? "Cancel" : "Copy answers"}
                    </button>
                  </div>
                  <AnimatePresence initial={false}>
                    {bulkCopyExpanded ? (
                      <motion.div
                        id="bulk-copy-panel"
                        initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: PORTAL_EASE }}
                        className="overflow-hidden"
                      >
                        <p className="m-0 mt-2 text-[13.5px] font-semibold text-[var(--sf-ink)]/75">
                          Copy answers from a previous application, then update
                          student-specific details.
                        </p>
                        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                          <select
                            value={bulkCopySourceId}
                            onChange={(event) => setBulkCopySourceId(event.target.value)}
                            aria-label="Previous application to copy from"
                            className={`${G_INPUT} sm:max-w-xs`}
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
                            className={`${gBtnOutlineSm} ${BUTTON_LOADING_LAYOUT_CLASS}`}
                          >
                            <ButtonLoadingLabel loading={importing} loadingLabel="Copying…">
                              Copy answers
                            </ButtonLoadingLabel>
                          </button>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              ) : null}

              <section
                aria-label={stepLabel}
                className="min-w-0 rounded-[28px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white px-5 py-6 shadow-[0_6px_0_0_rgba(43,36,29,0.07)] sm:px-8 sm:py-8"
              >
                <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]">
                  {stepLabel}
                </p>
                <div aria-hidden className="mb-6 mt-2.5 flex items-center gap-1.5 lg:hidden">
                  {steps.map((step, index) => (
                    <span
                      key={`${step.kind}-${index}`}
                      className={`h-1.5 flex-1 rounded-full ${
                        index <= stepIndex ? "bg-[var(--sf-clay)]" : "bg-[var(--sf-ink)]/12"
                      }`}
                    />
                  ))}
                </div>
                <div className="hidden h-4 lg:block" aria-hidden />

                <AnimatePresence mode="wait" initial={false} custom={direction}>
                  <motion.div key={stepContentKey} {...motionProps}>
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
                      <FeeStep feeConfig={feeConfig} feeStatus={feeStatus} />
                    ) : section ? (
                      <ApplicationGardenSection
                        C={C}
                        section={section}
                        values={values}
                        onChange={updateValue}
                        fieldErrors={fieldErrors}
                        priorFieldValues={priorFieldValues}
                        onReuseField={(fieldId) => void handleReuseField(fieldId)}
                        supabase={supabase ?? undefined}
                        uploadContext={uploadContext}
                        hideTopNotice={showBulkCopyPanel}
                      />
                    ) : null}
                  </motion.div>
                </AnimatePresence>
              </section>
            </div>
          </div>
        </div>
      </div>

      <footer className="relative shrink-0 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/15 bg-[var(--sf-paper)]/95 px-4 py-3 pb-safe backdrop-blur-sm sm:px-8 sm:py-4 lg:px-10">
        <div className="mx-auto grid w-full max-w-[1120px] lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-8">
          <div aria-hidden className="hidden lg:block" />
          <div className="min-w-0">
            <p className="m-0 mb-3 text-center text-[12.5px] font-bold text-[var(--sf-soft)] sm:hidden">
              {stepLabel}
            </p>
            {saveError ? (
              <p
                className="m-0 mb-3 rounded-[14px] border-[1.5px] border-[#b4412f]/30 bg-[#fdf0ec] px-3.5 py-2.5 text-[13.5px] font-bold text-[#9a3422]"
                role="alert"
              >
                {saveError}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
              {!isFirstStep ? (
                <button
                  type="button"
                  onClick={() => void handleBack()}
                  disabled={saving}
                  className={`${gBtnOutlineSm} w-full sm:w-auto`}
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
                    className={`${gBtnPop} w-full sm:w-auto`}
                  >
                    {actionLoading || saving
                      ? "Preparing checkout…"
                      : `Pay ${formatFeeAmount(feeConfig.amount_cents ?? 0)}`}
                    {!isLive ? " (preview)" : ""}
                  </button>
                ) : (currentStep?.kind === "acknowledgments" && !feeConfig.enabled) || isLastStep ? (
                  <button
                    type="button"
                    onClick={isLive ? handleSubmit : undefined}
                    disabled={
                      (currentStep?.kind === "acknowledgments" && !allAcknowledged) ||
                      (isLive && (actionLoading || saving))
                    }
                    className={`${gBtnPop} w-full sm:w-auto ${BUTTON_LOADING_LAYOUT_CLASS}`}
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
                    aria-busy={saving || undefined}
                    className={`${gBtnPop} w-full sm:w-auto ${BUTTON_LOADING_LAYOUT_CLASS}`}
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
        </div>
      </footer>

      {feeConfig.enabled && (feeConfig.amount_cents ?? 0) > 0 ? (
        <PaymentMethodSelectionModal
          C={C}
          appearance="parent-garden"
          theme={gardenTheme}
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
    </ParentGardenFrame>
  );
}

/** Short name for a step in the rail. */
function stepName(step: ExperienceStep, schema: ApplicationFormSchema, index: number): string {
  if (step.kind === "section") {
    return schema.sections[step.sectionIndex]?.title.trim() || `Step ${index + 1}`;
  }
  return step.kind === "acknowledgments" ? "Acknowledgments" : "Application fee";
}

function AcknowledgmentsStep({
  C,
  schema,
  acknowledgments,
  onAckChange,
}: {
  C: AdminThemeTokens;
  schema: ApplicationFormSchema;
  acknowledgments: Record<string, boolean>;
  onAckChange: (id: string, checked: boolean) => void;
}) {
  return (
    <ApplicationFieldAppearanceProvider value="garden">
      <h2 className="sf-display m-0 text-[1.5rem] leading-[1.1] text-[var(--sf-ink)] sm:text-[1.75rem]">
        Parent acknowledgments
      </h2>
      <p className="m-0 mt-2 text-[15px] font-semibold leading-relaxed text-[var(--sf-soft)]">
        Please confirm the following before submitting your application.
      </p>
      <div className="mt-6 space-y-3">
        {schema.acknowledgments.map((item) => (
          <ApplicationCheckboxInput
            key={item.id}
            id={item.id}
            checked={Boolean(acknowledgments[item.id])}
            onChange={(checked) => onAckChange(item.id, checked)}
            label={item.label}
            C={C}
          />
        ))}
      </div>
    </ApplicationFieldAppearanceProvider>
  );
}

function FeeStep({
  feeConfig,
  feeStatus,
}: {
  feeConfig: ApplicationFormFeeConfig;
  feeStatus?: string;
}) {
  const amount = formatFeeAmount(feeConfig.amount_cents ?? 0);
  const paid = feeStatus === "paid";

  return (
    <div>
      <h2 className="sf-display m-0 text-[1.5rem] leading-[1.1] text-[var(--sf-ink)] sm:text-[1.75rem]">
        Application fee
      </h2>
      <p className="m-0 mt-2 text-[15px] font-semibold leading-relaxed text-[var(--sf-soft)]">
        {paid
          ? "Your application fee has been paid."
          : "Review the application fee before submitting."}
      </p>
      <div className="sf-ticket mt-6 flex items-center justify-between gap-4 rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/12 bg-[var(--sf-butter)] px-5 py-4 shadow-[0_3px_0_0_rgba(43,36,29,0.08)]">
        <div className="min-w-0">
          <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-ink)]/60">
            {paid ? "Paid" : "Due before you submit"}
          </p>
          <p className="m-0 mt-1 truncate text-[15px] font-extrabold text-[var(--sf-ink)]">
            {feeConfig.label ?? "Application fee"}
          </p>
        </div>
        <p className="sf-display m-0 shrink-0 text-[2rem] leading-none tabular-nums text-[var(--sf-ink)]">
          {amount}
        </p>
      </div>
    </div>
  );
}

function SubmittedConfirmation({
  branding,
  theme,
  schoolName,
  schoolSlug,
  title,
  awaitingPaymentConfirmation,
}: {
  branding: OrganizationBranding;
  theme: ParentThemeTokens;
  schoolName: string;
  schoolSlug?: string;
  title: string;
  awaitingPaymentConfirmation: boolean;
}) {
  const router = useRouter();
  const applyDashboardHref = schoolSlug ? `/school/${schoolSlug}/apply` : null;
  useCelebrate(!awaitingPaymentConfirmation, theme, "apply-submitted");

  useEffect(() => {
    if (awaitingPaymentConfirmation || !applyDashboardHref) return;

    const timer = window.setTimeout(() => {
      router.push(applyDashboardHref);
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [applyDashboardHref, awaitingPaymentConfirmation, router]);

  return (
    <ApplyGardenShell branding={branding} schoolName={schoolName} centered>
      <div className="w-full max-w-[560px] rounded-[28px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white px-6 py-10 text-center shadow-[0_6px_0_0_rgba(43,36,29,0.07)] sm:px-10">
        {awaitingPaymentConfirmation ? (
          <>
            <Loader2 className="mx-auto h-9 w-9 animate-spin text-[var(--sf-clay)]" aria-hidden />
            <h1 className="sf-display m-0 mt-5 text-[1.9rem] leading-[1.05] text-[var(--sf-ink)]">
              Confirming your payment…
            </h1>
            <p className="m-0 mx-auto mt-3 max-w-md text-[15px] font-semibold leading-relaxed text-[var(--sf-soft)]">
              This usually takes a few seconds. Please keep this page open.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--sf-mint)]">
              <Tick className="h-11 w-11" tick />
            </div>
            <h1 className="sf-display m-0 mt-5 text-[1.9rem] leading-[1.05] text-[var(--sf-ink)] sm:text-[2.2rem]">
              Application submitted
            </h1>
            <p className="m-0 mx-auto mt-3 max-w-md text-[15px] font-semibold leading-relaxed text-[var(--sf-soft)]">
              Thank you for submitting{" "}
              <span className="font-extrabold text-[var(--sf-ink)]">{title}</span>. {schoolName} will be
              in touch about next steps.
            </p>
            <p aria-hidden className="sf-hand m-0 mt-4 text-[1.35rem] text-[var(--sf-clay-deep)]">
              one step closer ✿
            </p>
            {applyDashboardHref ? (
              <Link href={applyDashboardHref} className={`${gBtnPop} mt-6`}>
                View your applications
              </Link>
            ) : null}
          </>
        )}
      </div>
    </ApplyGardenShell>
  );
}
