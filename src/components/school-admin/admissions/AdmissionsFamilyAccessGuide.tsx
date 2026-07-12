"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CalendarClock,
  Check,
  CheckCircle2,
  CircleHelp,
  ClipboardList,
  CreditCard,
  FileText,
  Link2,
  ListChecks,
  LogIn,
  Mail,
  Send,
  X,
  type LucideIcon,
} from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";

type GuideVariant = "apply" | "checklist";

type ApplyStepId =
  | "share-link"
  | "open-form"
  | "complete-steps"
  | "fee-acknowledgments"
  | "after-submit";

type ChecklistStepId =
  | "start-enrollment"
  | "family-sign-in"
  | "complete-checklist"
  | "enrollment-complete";

type GuideStepId = ApplyStepId | ChecklistStepId;

type GuideStep = {
  id: GuideStepId;
  icon: LucideIcon;
  title: string;
  description: React.ReactNode;
  pathChip?: string;
};

type GuideSharedProps = {
  variant: GuideVariant;
  C: AdminThemeTokens;
  schoolSlug: string;
  publicPath?: string | null;
  isPublished?: boolean;
};

const VARIANT_META: Record<
  GuideVariant,
  { buttonLabel: string; modalTitle: string; modalSubtitle: string }
> = {
  apply: {
    buttonLabel: "How to share",
    modalTitle: "How families apply",
    modalSubtitle: "Share your link, then families complete the form on their own.",
  },
  checklist: {
    buttonLabel: "How parents access",
    modalTitle: "How families enroll",
    modalSubtitle:
      "Start enrollment from Submissions, then families finish this checklist in their portal.",
  },
};

function buildApplySteps(
  schoolSlug: string,
  publicPath: string | null | undefined,
  isPublished: boolean | undefined,
): GuideStep[] {
  const applyDashboardPath = `/school/${schoolSlug}/apply`;
  const displayPath = publicPath ?? `/school/${schoolSlug}/forms/apply`;

  return [
    {
      id: "share-link",
      icon: Link2,
      title: "Share the apply link",
      pathChip: displayPath,
      description: (
        <>
          Publish this form, then use <strong>Copy link</strong> to share it with
          families by email, your website, or social media.
          {!isPublished ? (
            <> The link won&apos;t work until this form is published.</>
          ) : null}
        </>
      ),
    },
    {
      id: "open-form",
      icon: FileText,
      title: "Family opens the form",
      description:
        "Families land on your public apply page and read your welcome message before starting.",
    },
    {
      id: "complete-steps",
      icon: ListChecks,
      title: "Complete your steps",
      description:
        "They work through each step you configured — student info, family info, and any custom questions.",
    },
    {
      id: "fee-acknowledgments",
      icon: CreditCard,
      title: "Fee and acknowledgments",
      description:
        "Before submitting, families pay any application fee and accept your terms.",
    },
    {
      id: "after-submit",
      icon: Send,
      title: "After they submit",
      pathChip: applyDashboardPath,
      description:
        "Families sign in to their apply dashboard to complete post-application steps like tours or interviews while you review in Submissions.",
    },
  ];
}

function buildChecklistSteps(schoolSlug: string): GuideStep[] {
  const applyDashboardPath = `/school/${schoolSlug}/apply`;

  return [
    {
      id: "start-enrollment",
      icon: ClipboardList,
      title: "You start enrollment",
      description:
        "From an accepted application in Submissions, click Start enrollment to send this checklist to the family.",
    },
    {
      id: "family-sign-in",
      icon: LogIn,
      title: "Family signs in",
      pathChip: applyDashboardPath,
      description:
        "Families log in to their parent apply dashboard. They receive access after you start enrollment.",
    },
    {
      id: "complete-checklist",
      icon: ListChecks,
      title: "Complete checklist items",
      description:
        "Families work through documents, forms, uploads, payments, and acknowledgments — one item at a time.",
    },
    {
      id: "enrollment-complete",
      icon: CheckCircle2,
      title: "Enrollment complete",
      description:
        "When all items are done, mark the student enrolled from Submissions. They can then access the full parent portal.",
    },
  ];
}

function MockCard({
  C,
  children,
  className = "",
}: {
  C: AdminThemeTokens;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${className}`}
      style={{
        borderColor: C.border,
        backgroundColor: C.surface,
        boxShadow: C.shadowMedium,
      }}
    >
      {children}
    </div>
  );
}

function GuideStepIllustration({
  C,
  stepId,
  schoolSlug,
  displayPath,
  onCopyLink,
  copiedLink,
  copyDisabled,
}: {
  C: AdminThemeTokens;
  stepId: GuideStepId;
  schoolSlug: string;
  displayPath: string;
  onCopyLink?: () => void;
  copiedLink?: boolean;
  copyDisabled?: boolean;
}) {
  const applyDashboardPath = `/school/${schoolSlug}/apply`;

  switch (stepId) {
    case "share-link":
      return (
        <MockCard C={C} className="space-y-3">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-md"
              style={{ backgroundColor: C.accentLight, color: C.accent }}
            >
              <Link2 className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div
                className="h-2 w-24 rounded-full"
                style={{ backgroundColor: C.elevated }}
              />
              <div
                className="mt-1.5 h-2 w-16 rounded-full"
                style={{ backgroundColor: C.elevated }}
              />
            </div>
            <button
              type="button"
              onClick={onCopyLink}
              disabled={copyDisabled}
              className="rounded px-2 py-1 text-[10px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              style={
                copiedLink
                  ? getAdminButtonStyle(C, "success")
                  : getAdminButtonStyle(C, "secondary")
              }
            >
              {copiedLink ? "Copied" : "Copy link"}
            </button>
          </div>
          <div
            className="rounded-md px-3 py-2 font-mono text-[11px] truncate"
            style={{
              backgroundColor: C.elevated,
              color: C.textSecondary,
              border: `1px dashed ${C.borderStrong}`,
            }}
          >
            {displayPath}
          </div>
        </MockCard>
      );

    case "open-form":
      return (
        <MockCard C={C} className="overflow-hidden p-0">
          <div
            className="flex items-center gap-2 border-b px-3 py-2"
            style={{ borderColor: C.border, backgroundColor: C.elevated }}
          >
            <div className="flex gap-1">
              {["#FCA5A5", "#FCD34D", "#86EFAC"].map((color) => (
                <span
                  key={color}
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div
              className="mx-auto h-2 w-32 rounded-full"
              style={{ backgroundColor: C.border }}
            />
          </div>
          <div className="space-y-3 p-4">
            <div
              className="h-3 w-2/3 rounded-full"
              style={{ backgroundColor: C.accent, opacity: 0.35 }}
            />
            <div
              className="h-2 w-full rounded-full"
              style={{ backgroundColor: C.elevated }}
            />
            <div
              className="h-2 w-5/6 rounded-full"
              style={{ backgroundColor: C.elevated }}
            />
            <div
              className="mt-2 h-8 w-28 rounded-md"
              style={{ backgroundColor: C.accent, opacity: 0.85 }}
            />
          </div>
        </MockCard>
      );

    case "complete-steps":
      return (
        <MockCard C={C} className="space-y-2">
          {["Student information", "Family info", "Additional questions"].map(
            (label, index) => {
              const done = index < 2;
              const active = index === 2;
              return (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5"
                  style={{
                    backgroundColor: active ? C.accentLight : C.elevated,
                    border: `1px solid ${active ? C.secondaryBtnBorder : C.border}`,
                  }}
                >
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold"
                    style={{
                      backgroundColor: done ? C.successBg : C.surface,
                      color: done ? C.success : active ? C.accent : C.textTertiary,
                      border: `1px solid ${done ? C.successBorder : C.border}`,
                    }}
                  >
                    {done ? <Check className="h-3 w-3" /> : index + 1}
                  </div>
                  <span
                    className="text-xs font-medium"
                    style={{ color: active ? C.textPrimary : C.textSecondary }}
                  >
                    {label}
                  </span>
                </div>
              );
            },
          )}
        </MockCard>
      );

    case "fee-acknowledgments":
      return (
        <MockCard C={C} className="space-y-3">
          <div
            className="rounded-md border px-4 py-3"
            style={{ borderColor: C.border, backgroundColor: C.elevated }}
          >
            <p className="text-[10px] uppercase tracking-wide" style={{ color: C.textTertiary }}>
              Application fee
            </p>
            <p className="mt-1 text-lg font-semibold" style={{ color: C.textPrimary }}>
              $50.00
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div
              className="mt-0.5 flex h-4 w-4 items-center justify-center rounded border"
              style={{
                borderColor: C.accent,
                backgroundColor: C.accentLight,
                color: C.accent,
              }}
            >
              <Check className="h-2.5 w-2.5" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div
                className="h-2 w-full rounded-full"
                style={{ backgroundColor: C.elevated }}
              />
              <div
                className="h-2 w-4/5 rounded-full"
                style={{ backgroundColor: C.elevated }}
              />
            </div>
          </div>
        </MockCard>
      );

    case "after-submit":
      return (
        <MockCard C={C} className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>
              Your applications
            </p>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: C.warningBg, color: C.warning }}
            >
              Under review
            </span>
          </div>
          <div
            className="flex items-center gap-3 rounded-md border px-3 py-2.5"
            style={{ borderColor: C.secondaryBtnBorder, backgroundColor: C.accentLight }}
          >
            <CalendarClock className="h-4 w-4 shrink-0" style={{ color: C.accent }} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium" style={{ color: C.textPrimary }}>
                Schedule campus tour
              </p>
              <p className="text-[10px]" style={{ color: C.textTertiary }}>
                Required before enrollment
              </p>
            </div>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" style={{ color: C.accent }} />
          </div>
          <p className="text-[10px]" style={{ color: C.textTertiary }}>
            {applyDashboardPath}
          </p>
        </MockCard>
      );

    case "start-enrollment":
      return (
        <MockCard C={C} className="space-y-2">
          <div
            className="flex items-center gap-3 rounded-md border px-3 py-2.5"
            style={{ borderColor: C.border, backgroundColor: C.elevated }}
          >
            <div
              className="h-8 w-8 rounded-full"
              style={{ backgroundColor: C.border }}
            />
            <div className="min-w-0 flex-1">
              <div
                className="h-2 w-24 rounded-full"
                style={{ backgroundColor: C.borderStrong }}
              />
              <div
                className="mt-1.5 h-2 w-16 rounded-full"
                style={{ backgroundColor: C.border }}
              />
            </div>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: C.successBg, color: C.success }}
            >
              Accepted
            </span>
          </div>
          <div className="flex justify-end">
            <div
              className="rounded-md px-3 py-1.5 text-[10px] font-semibold text-white"
              style={{ backgroundColor: C.accent }}
            >
              Start enrollment
            </div>
          </div>
        </MockCard>
      );

    case "family-sign-in":
      return (
        <MockCard C={C} className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" style={{ color: C.accent }} />
            <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>
              Sign in to your applications
            </p>
          </div>
          <div
            className="rounded-md border px-3 py-2 text-xs"
            style={{
              borderColor: C.inputBorder,
              backgroundColor: C.input,
              color: C.textTertiary,
            }}
          >
            parent@email.com
          </div>
          <div
            className="w-full rounded-md py-2 text-center text-xs font-semibold text-white"
            style={{ backgroundColor: C.accent }}
          >
            Send code
          </div>
        </MockCard>
      );

    case "complete-checklist":
      return (
        <MockCard C={C} className="space-y-2">
          {[
            { label: "Enrollment agreement", done: true },
            { label: "Emergency contacts", done: true },
            { label: "Health form", done: false, active: true },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-md px-3 py-2"
              style={{
                backgroundColor: item.active ? C.accentLight : C.elevated,
                border: `1px solid ${item.active ? C.secondaryBtnBorder : C.border}`,
              }}
            >
              <div
                className="flex h-5 w-5 items-center justify-center rounded-full"
                style={{
                  backgroundColor: item.done ? C.successBg : C.surface,
                  color: item.done ? C.success : C.accent,
                  border: `1px solid ${item.done ? C.successBorder : C.secondaryBtnBorder}`,
                }}
              >
                {item.done ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                )}
              </div>
              <span
                className="text-xs font-medium"
                style={{ color: item.active ? C.textPrimary : C.textSecondary }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </MockCard>
      );

    case "enrollment-complete":
      return (
        <MockCard C={C} className="flex flex-col items-center gap-3 py-6 text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: C.successBg, color: C.success }}
          >
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
              Enrolled
            </p>
            <p className="mt-1 text-xs" style={{ color: C.textSecondary }}>
              Full parent portal access unlocked
            </p>
          </div>
        </MockCard>
      );

    default:
      return null;
  }
}

const stepTransition = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.22, ease: "easeOut" as const },
};

export function AdmissionsFamilyAccessGuideModal({
  open,
  onClose,
  variant,
  C,
  schoolSlug,
  publicPath,
  isPublished,
}: GuideSharedProps & { open: boolean; onClose: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const meta = VARIANT_META[variant];
  const displayPath = publicPath ?? `/school/${schoolSlug}/forms/apply`;

  const steps = useMemo(
    () =>
      variant === "apply"
        ? buildApplySteps(schoolSlug, publicPath, isPublished)
        : buildChecklistSteps(schoolSlug),
    [variant, schoolSlug, publicPath, isPublished],
  );

  const currentStep = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const resetModal = useCallback(() => {
    setStepIndex(0);
    setCopiedLink(false);
  }, []);

  useEffect(() => {
    if (open) {
      resetModal();
    }
  }, [open, resetModal]);

  const handleCopyLink = useCallback(async () => {
    if (!isPublished) return;
    const absoluteUrl = `${window.location.origin}${displayPath}`;
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 1500);
    } catch {
      // Clipboard unavailable — no-op
    }
  }, [displayPath, isPublished]);

  const goNext = () => {
    if (isLast) {
      onClose();
      return;
    }
    setStepIndex((prev) => prev + 1);
  };

  const goBack = () => {
    setStepIndex((prev) => Math.max(0, prev - 1));
  };

  const goToStep = (index: number) => {
    setStepIndex(index);
  };

  return (
    <AnimatePresence>
      {open && currentStep ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-lg"
            style={{
              backgroundColor: C.surface,
              border: `1px solid ${C.border}`,
              boxShadow: C.shadowMedium,
            }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="family-access-guide-title"
          >
            <div
              className="border-b px-5 py-4"
              style={{ borderColor: C.border }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3
                    id="family-access-guide-title"
                    className="text-base font-semibold"
                    style={{ color: C.textPrimary }}
                  >
                    {meta.modalTitle}
                  </h3>
                  <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
                    {meta.modalSubtitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded p-1"
                  style={{ color: C.textTertiary }}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4">
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full"
                  style={{ backgroundColor: C.elevated }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: C.accent }}
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  {steps.map((step, index) => {
                    const done = index < stepIndex;
                    const active = index === stepIndex;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => goToStep(index)}
                        className="flex flex-1 flex-col items-center gap-1"
                        aria-label={`Go to step ${index + 1}: ${step.title}`}
                        aria-current={active ? "step" : undefined}
                      >
                        <motion.span
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold"
                          animate={{
                            scale: active ? 1.08 : 1,
                            backgroundColor: done
                              ? C.successBg
                              : active
                                ? C.accentLight
                                : C.elevated,
                          }}
                          style={{
                            color: done ? C.success : active ? C.accent : C.textTertiary,
                            border: `1px solid ${
                              done
                                ? C.successBorder
                                : active
                                  ? C.secondaryBtnBorder
                                  : C.border
                            }`,
                          }}
                        >
                          {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                        </motion.span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <AnimatePresence mode="wait">
                <motion.div key={currentStep.id} {...stepTransition}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: 0.05 }}
                  >
                    <GuideStepIllustration
                      C={C}
                      stepId={currentStep.id}
                      schoolSlug={schoolSlug}
                      displayPath={displayPath}
                      onCopyLink={
                        currentStep.id === "share-link" ? handleCopyLink : undefined
                      }
                      copiedLink={copiedLink}
                      copyDisabled={!isPublished}
                    />
                  </motion.div>

                  <div className="mt-5 flex items-center gap-2">
                    <currentStep.icon
                      className="h-4 w-4 shrink-0"
                      style={{ color: C.accent }}
                      aria-hidden
                    />
                    <h4 className="text-base font-semibold" style={{ color: C.textPrimary }}>
                      {currentStep.title}
                    </h4>
                  </div>

                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: C.textSecondary }}
                  >
                    {currentStep.description}
                  </p>

                  {currentStep.pathChip ? (
                    <div
                      className="mt-3 inline-block max-w-full truncate rounded-md px-2.5 py-1.5 font-mono text-[11px]"
                      style={{
                        backgroundColor: C.elevated,
                        color: C.textSecondary,
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      {currentStep.pathChip}
                    </div>
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>

            <div
              className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4"
              style={{ borderColor: C.border }}
            >
              <div className="flex items-center gap-2">
                {!isFirst ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="rounded-sm px-3 py-2 text-xs font-semibold"
                    style={getAdminButtonStyle(C, "neutral")}
                  >
                    Back
                  </button>
                ) : null}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: C.textTertiary }}>
                  Step {stepIndex + 1} of {steps.length}
                </span>
                <button
                  type="button"
                  onClick={goNext}
                  className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-xs font-semibold"
                  style={getAdminButtonStyle(C, "primary")}
                >
                  {isLast ? "Done" : "Next"}
                  {!isLast ? <ArrowRight className="h-3.5 w-3.5" /> : null}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function AdmissionsFamilyAccessGuideButton({
  variant,
  C,
  schoolSlug,
  publicPath,
  isPublished,
}: GuideSharedProps) {
  const [open, setOpen] = useState(false);
  const meta = VARIANT_META[variant];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-xs font-semibold"
        style={getAdminButtonStyle(C, "info")}
      >
        <CircleHelp className="h-3.5 w-3.5" />
        {meta.buttonLabel}
      </button>

      <AdmissionsFamilyAccessGuideModal
        open={open}
        onClose={() => setOpen(false)}
        variant={variant}
        C={C}
        schoolSlug={schoolSlug}
        publicPath={publicPath}
        isPublished={isPublished}
      />
    </>
  );
}

// Kept for backwards compatibility if imported elsewhere.
export default AdmissionsFamilyAccessGuideButton;
