"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ApplicationFieldInput from "@/components/admissions/ApplicationFieldInput";
import ApplicationStepNotice from "@/components/admissions/ApplicationStepNotice";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import {
  formatFeeAmount,
  type ApplicationFormFeeConfig,
  type ApplicationFormSchema,
  type ApplicationSection,
} from "@/lib/admissions/application-form-schema";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

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

export default function ApplicationFormExperience({
  branding,
  schoolName,
  title,
  intro,
  schema,
  feeConfig,
  mode = "preview",
}: ApplicationFormExperienceProps) {
  const isLive = mode === "live";
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const steps = useMemo(
    () => buildSteps(schema, feeConfig),
    [schema, feeConfig],
  );

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [values, setValues] = useState<Record<string, string>>({});
  const [acknowledgments, setAcknowledgments] = useState<Record<string, boolean>>(
    {},
  );

  const currentStep = steps[stepIndex];
  const totalSteps = steps.length;
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === totalSteps - 1;

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
  };

  const handleContinue = () => {
    if (stepIndex < totalSteps - 1) {
      setDirection(1);
      setStepIndex((current) => current + 1);
      scrollToTop();
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setDirection(-1);
      setStepIndex((current) => current - 1);
      scrollToTop();
    }
  };

  const allAcknowledged =
    schema.acknowledgments.length === 0 ||
    schema.acknowledgments.every((item) => acknowledgments[item.id]);

  const pageBg = branding.colors.bg;

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
      className="flex h-full min-h-0 flex-col"
      style={{ backgroundColor: pageBg, color: C.textPrimary }}
    >
      <div
        ref={scrollContainerRef}
        className="min-h-0 flex-1 overflow-y-auto px-6 py-6"
      >
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex items-center gap-4">
            <SchoolDemoWordmark
              logo={{
                src: branding.logo.src,
                alt: branding.logo.alt || schoolName,
                width: branding.logo.width,
                height: branding.logo.height,
                text: branding.logo.src ? undefined : schoolName,
              }}
              className="h-8 w-auto max-w-[200px] object-contain"
            />
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
                    className="text-3xl font-semibold leading-tight"
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
                <FeeStep C={C} feeConfig={feeConfig} />
              ) : section ? (
                <SectionStep C={C} section={section} values={values} onChange={updateValue} />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <footer
        className="shrink-0 border-t px-6 py-4"
        style={{ borderColor: C.border, backgroundColor: pageBg }}
      >
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          {!isFirstStep ? (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-md border px-4 py-2.5 text-sm font-medium transition hover:opacity-90"
              style={{
                borderColor: C.secondaryBtnBorder,
                color: C.textPrimary,
                backgroundColor: pageBg,
              }}
            >
              Back
            </button>
          ) : null}

          <div className="ml-auto flex shrink-0 gap-3">
            {currentStep?.kind === "fee" ? (
              <button
                type="button"
                disabled={isLive}
                title={isLive ? "Online payment is coming soon." : undefined}
                className="rounded-md px-5 py-2.5 text-sm font-semibold text-white transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: C.accent }}
              >
                {feeConfig.label ?? "Pay application fee"}
                {!isLive ? " (preview)" : ""}
              </button>
            ) : currentStep?.kind === "acknowledgments" && !feeConfig.enabled ? (
              <button
                type="button"
                disabled={!allAcknowledged || isLive}
                title={isLive ? "Online submission is coming soon." : undefined}
                className="rounded-md px-5 py-2.5 text-sm font-semibold text-white transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: C.accent }}
              >
                Submit application{!isLive ? " (preview)" : ""}
              </button>
            ) : isLastStep ? (
              <button
                type="button"
                disabled={isLive}
                title={isLive ? "Online submission is coming soon." : undefined}
                className="rounded-md px-5 py-2.5 text-sm font-semibold text-white transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: C.accent }}
              >
                Submit application{!isLive ? " (preview)" : ""}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleContinue}
                disabled={
                  currentStep?.kind === "acknowledgments" && !allAcknowledged
                }
                className="rounded-md px-5 py-2.5 text-sm font-semibold text-white transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: C.accent }}
              >
                {currentStep?.kind === "acknowledgments" ? "Continue" : "Save and continue"}
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionStep({
  C,
  section,
  values,
  onChange,
}: {
  C: ReturnType<typeof buildAdminThemeTokens>;
  section: ApplicationSection;
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
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
      <h2 className="text-xl font-semibold" style={{ color: C.accentDark }}>
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
        {section.fields.map((field) => (
          <label
            key={field.id}
            className={
              field.width === "half"
                ? "block min-w-0"
                : "block min-w-0 sm:col-span-2"
            }
          >
            {field.type !== "checkbox" && (
              <span
                className="mb-1.5 block text-sm font-medium"
                style={{ color: C.textPrimary }}
              >
                {field.label}
                {field.required ? (
                  <span style={{ color: C.accent }}> *</span>
                ) : null}
              </span>
            )}
            <ApplicationFieldInput
              field={field}
              value={values[field.id] ?? ""}
              onChange={(value) => onChange(field.id, value)}
              C={C}
            />
          </label>
        ))}
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
      <h2 className="text-xl font-semibold" style={{ color: C.accentDark }}>
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
}: {
  C: ReturnType<typeof buildAdminThemeTokens>;
  feeConfig: ApplicationFormFeeConfig;
}) {
  const amount = formatFeeAmount(feeConfig.amount_cents ?? 0);

  return (
    <div>
      <h2 className="text-xl font-semibold" style={{ color: C.accentDark }}>
        Application fee
      </h2>
      <p className="mt-2 text-sm" style={{ color: C.textSecondary }}>
        Review the application fee before submitting.
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
