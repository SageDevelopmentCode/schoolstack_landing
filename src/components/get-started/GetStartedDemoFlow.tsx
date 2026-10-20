"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  type RefObject,
} from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import {
  DemoScheduler,
  type DemoSchedulerBooking,
} from "@/components/scheduler/DemoScheduler";
import { detectBrowserTimezone } from "@/lib/marketing/demo-timezone-options";
import { SCHEDULER_TIMEZONE } from "@/lib/demo-scheduler";
import { DemoSchedulerSkeleton } from "@/components/scheduler/DemoSchedulerSkeleton";
import { PUBLIC_FORM_HONEYPOT_FIELD } from "@/lib/public-forms/honeypot";
import GetStartedConfirmation from "@/components/get-started/GetStartedConfirmation";
import GetStartedIntroductionForm, {
  type GetStartedIntroductionFormData,
} from "@/components/get-started/GetStartedIntroductionForm";
import GetStartedStepProgress from "@/components/get-started/GetStartedStepProgress";
import GetStartedStoryHeader from "@/components/get-started/GetStartedStoryHeader";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import { demoRequestRoleLabel } from "@/lib/demo-request-roles";
import { MUDKITCHEN_MARKETING_STORY_THEME } from "@/lib/marketing/mudkitchen-story-theme";

type FormData = GetStartedIntroductionFormData;

function buildPrepNotes(form: FormData): string {
  const parts: string[] = [];
  if (form.role === "other" && form.otherDescription.trim()) {
    parts.push(`About their work: ${form.otherDescription.trim()}`);
  }
  if (form.prepNotes.trim()) {
    parts.push(form.prepNotes.trim());
  }
  return parts.join("\n\n");
}

const ease = [0.16, 1, 0.3, 1] as const;
const exitEase = [0.4, 0, 1, 1] as const;

const slideIn = {
  initial: { opacity: 0, x: 48 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease },
  },
  exit: {
    opacity: 0,
    x: -48,
    transition: { duration: 0.28, ease: exitEase },
  },
};

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.22 },
  },
};

export type GetStartedDemoStep = 0 | 1 | 2;

type GetStartedDemoFlowProps = {
  scrollOnStepChange?: "window" | "section";
  sectionRef?: RefObject<HTMLElement | null>;
  onStepChange?: (step: GetStartedDemoStep) => void;
  showStepProgress?: boolean;
};

export default function GetStartedDemoFlow({
  scrollOnStepChange = "window",
  sectionRef,
  onStepChange,
  showStepProgress = true,
}: GetStartedDemoFlowProps) {
  const theme = useMemo(() => MUDKITCHEN_MARKETING_STORY_THEME, []);

  const [step, setStep] = useState<GetStartedDemoStep>(0);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [displayTimezone, setDisplayTimezone] = useState(() =>
    detectBrowserTimezone(SCHEDULER_TIMEZONE),
  );
  const [booking, setBooking] = useState<DemoSchedulerBooking | null>(null);
  const [availabilitySlots, setAvailabilitySlots] = useState<
    Record<string, string[]>
  >({});
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [companyWebsite, setCompanyWebsite] = useState("");

  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    schoolName: "",
    role: "",
    otherDescription: "",
    prepNotes: "",
  });

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const clearError = useCallback((key: string) => {
    setErrors((e) => {
      const n = new Set(e);
      n.delete(key);
      return n;
    });
  }, []);

  const scrollAfterStepChange = useCallback(() => {
    if (scrollOnStepChange === "section" && sectionRef?.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [scrollOnStepChange, sectionRef]);

  const goToStep = useCallback(
    (next: GetStartedDemoStep) => {
      setStep(next);
      onStepChange?.(next);
    },
    [onStepChange],
  );

  useEffect(() => {
    if (step !== 1) return;

    let cancelled = false;
    queueMicrotask(() => {
      setAvailabilityLoading(true);
      setAvailabilityError(null);
    });

    fetch("/api/availability")
      .then(async (res) => {
        const data = (await res.json()) as {
          slots?: Record<string, string[]>;
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Failed to load availability");
        if (!cancelled) setAvailabilitySlots(data.slots ?? {});
      })
      .catch((err) => {
        if (!cancelled) {
          setAvailabilityError(
            err instanceof Error ? err.message : "Failed to load availability",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setAvailabilityLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [step]);

  useEffect(() => {
    if (step !== 2) return;

    const colors = [theme.coral, theme.primary, theme.sage, "#E8D5C8", theme.paper];

    const burst = (origin: { x: number; y: number }, angle: number) =>
      confetti({
        particleCount: 60,
        spread: 70,
        angle,
        origin,
        colors,
        scalar: 1.1,
        gravity: 0.9,
        drift: 0,
      });

    const t1 = setTimeout(() => burst({ x: 0.2, y: 0.9 }, 65), 0);
    const t2 = setTimeout(() => burst({ x: 0.8, y: 0.9 }, 115), 80);
    const t3 = setTimeout(() => burst({ x: 0.15, y: 0.85 }, 75), 300);
    const t4 = setTimeout(() => burst({ x: 0.85, y: 0.85 }, 105), 380);

    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [step, theme]);

  function validate(): boolean {
    const errs = new Set<string>();
    if (!form.name.trim()) errs.add("name");
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.add("email");
    if (!form.role) errs.add("role");
    setErrors(errs);
    return errs.size === 0;
  }

  function handleContinue() {
    if (validate()) {
      setSubmitError(null);
      goToStep(1);
      scrollAfterStepChange();
    }
  }

  async function handleScheduled(selected: DemoSchedulerBooking) {
    if (isSubmitting || !form.role) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const prepNotes = buildPrepNotes(form);

    try {
      const res = await fetch("/api/demo-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          schoolName: form.schoolName.trim() || "Not provided",
          role: form.role,
          scheduledDate: selected.date,
          scheduledTime: selected.time,
          timezone: selected.displayTimezone,
          prepNotes,
          [PUBLIC_FORM_HONEYPOT_FIELD]: companyWebsite,
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        code?: string;
      };

      if (!res.ok) {
        if (res.status >= 500) {
          setSubmitError(
            data.error ??
              "Something went wrong on our end. Please try again in a moment.",
          );
        } else {
          setSubmitError(data.error ?? "Something went wrong");
        }
        return;
      }

      setBooking(selected);
      goToStep(2);
      scrollAfterStepChange();
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const roleLabel = form.role ? demoRequestRoleLabel(form.role) : "";

  return (
    <>
      <AnimatePresence>
        {showStepProgress && step === 1 && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <GetStartedStepProgress theme={theme} step={1} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step-form" {...slideIn}>
            <GetStartedIntroductionForm
              theme={theme}
              form={form}
              onFieldChange={set}
              errors={errors}
              onClearError={clearError}
              onSubmit={handleContinue}
              companyWebsite={companyWebsite}
              onCompanyWebsiteChange={setCompanyWebsite}
            />
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step-scheduler" {...slideIn}>
            <button
              type="button"
              onClick={() => {
                setSubmitError(null);
                goToStep(0);
                scrollAfterStepChange();
              }}
              className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-bold transition-opacity hover:opacity-80"
              style={{ color: theme.primary, fontFamily: theme.fontBody }}
            >
              <ArrowLeft size={14} />
              Back
            </button>

            <GetStartedStoryHeader
              theme={theme}
              title={
                <>
                  Pick a time{" "}
                  <em style={{ color: theme.coral, fontStyle: "italic" }}>
                    that works.
                  </em>
                </>
              }
              subtitle="We'll walk through the workflows that matter most to your school."
            />

            <ParentCard
              theme={theme}
              className="!p-0 overflow-hidden !border-0 !shadow-none bg-transparent"
            >
              {availabilityLoading ? (
                <DemoSchedulerSkeleton storyTheme={theme} />
              ) : availabilityError ? (
                <div
                  className="flex items-center justify-center py-24 text-sm"
                  style={{ color: theme.alert, fontFamily: theme.fontBody }}
                >
                  {availabilityError}
                </div>
              ) : Object.keys(availabilitySlots).length === 0 ? (
                <div
                  className="flex items-center justify-center py-24 text-sm"
                  style={{ color: theme.muted, fontFamily: theme.fontBody }}
                >
                  No demo times are available right now. Please check back soon.
                </div>
              ) : (
                <DemoScheduler
                  availabilitySlots={availabilitySlots}
                  onConfirm={handleScheduled}
                  isSubmitting={isSubmitting}
                  storyTheme={theme}
                  displayTimezone={displayTimezone}
                  onDisplayTimezoneChange={setDisplayTimezone}
                />
              )}
            </ParentCard>

            {submitError && (
              <p
                className="mt-4 text-center text-[13px]"
                style={{ color: theme.alert, fontFamily: theme.fontBody }}
              >
                {submitError} Please try again or contact us directly.
              </p>
            )}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step-confirm" {...fadeUp}>
            <GetStartedConfirmation
              theme={theme}
              schoolName={form.schoolName}
              roleLabel={roleLabel}
              booking={booking}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
