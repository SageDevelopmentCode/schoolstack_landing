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
import { ACCENT_HIGHLIGHT } from "@/components/home/bright-styles";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import { Draw, Squiggle } from "@/components/garden/ui";
import GardenBookingSteps from "@/components/get-started/garden/GardenBookingSteps";
import { demoRequestRoleLabel } from "@/lib/demo-request-roles";
import { MUDKITCHEN_MARKETING_BRIGHT_THEME } from "@/lib/marketing/mudkitchen-bright-marketing-theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { DemoPromoId } from "@/lib/marketing/gift-card-offer";
import { readFirstTouch } from "@/lib/marketing/attribution";
import {
  BOOKING_STEP_EVENT,
  clearPartialBookingDraft,
  markLeadCaptured,
  submitLead,
} from "@/lib/marketing/submit-lead";

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
  theme?: ParentThemeTokens;
  /** Heading level for the introduction form title ("h2" when the page has its own h1). */
  introHeadingAs?: "h1" | "h2";
  /** MudKitchen Garden scheduler step; needs a `.sf-garden` ancestor. */
  garden?: boolean;
  /** Promo id from a landing page (e.g. the /gift-card offer). The API adds its note to the request's prep notes. */
  promo?: DemoPromoId;
  /** Where this booking form is shown, stored as `demo_requests.source` (e.g. "home"). */
  source?: string;
};

const SCHEDULER_STEP_COPY = {
  lead: "Pick a time",
  accent: "that works.",
  subtitle: "We'll walk through the workflows that matter most to your school.",
} as const;

function GardenSchedulerHeader({ headingAs: Heading }: { headingAs: "h1" | "h2" }) {
  return (
    <div className="mb-8">
      <Heading className="sf-display text-4xl leading-[0.95] text-[var(--sf-ink)] sm:text-5xl">
        {SCHEDULER_STEP_COPY.lead}{" "}
        <span className="relative isolate inline-block text-[var(--sf-clay)]">
          <Draw className="pointer-events-none absolute -bottom-2 left-0 -z-10 w-full" delay={0.2}>
            <Squiggle className="h-4 w-full" color="var(--sf-butter)" />
          </Draw>
          {SCHEDULER_STEP_COPY.accent}
        </span>
      </Heading>
      <p className="mt-4 text-lg leading-relaxed text-[var(--sf-soft)]">
        {SCHEDULER_STEP_COPY.subtitle}
      </p>
    </div>
  );
}

export default function GetStartedDemoFlow({
  scrollOnStepChange = "window",
  sectionRef,
  onStepChange,
  showStepProgress = true,
  theme: themeProp,
  introHeadingAs = "h1",
  garden = false,
  promo,
  source,
}: GetStartedDemoFlowProps) {
  const theme = useMemo(
    () => themeProp ?? MUDKITCHEN_MARKETING_BRIGHT_THEME,
    [themeProp],
  );

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
      window.dispatchEvent(new CustomEvent(BOOKING_STEP_EVENT, { detail: next }));
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

    const colors = [theme.coral, theme.primary, "#F8DDCF", "#E9F2E4", theme.paper];

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
        disableForReducedMotion: true,
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
      // Save the contact details now, so we can follow up if they never pick a time.
      // Fire-and-forget: a failure here must never block booking.
      void submitLead({
        magnet: "partial_booking",
        email: form.email.trim(),
        name: form.name.trim(),
        schoolName: form.schoolName.trim(),
        role: form.role,
        message: buildPrepNotes(form),
        placement: source,
        companyWebsite,
      });
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
          ...(promo ? { promo } : {}),
          ...(source ? { source } : {}),
          attribution: readFirstTouch(),
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

      clearPartialBookingDraft();
      markLeadCaptured();
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
              headingAs={introHeadingAs}
              appearance={garden ? "garden" : "story"}
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
              className={
                garden
                  ? "mb-6 inline-flex cursor-pointer items-center gap-1.5 rounded-full text-sm font-extrabold text-[var(--sf-clay-deep)] transition-transform hover:-translate-x-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
                  : "mb-6 inline-flex items-center gap-1.5 font-secondary text-[13px] font-semibold text-clay transition-opacity hover:opacity-80"
              }
            >
              <ArrowLeft size={14} />
              Back
            </button>

            {garden ? <GardenBookingSteps activeStep={1} /> : null}
            {garden ? (
              <GardenSchedulerHeader headingAs={introHeadingAs} />
            ) : (
              <GetStartedStoryHeader
                title={
                  <>
                    {SCHEDULER_STEP_COPY.lead}{" "}
                    <span className={ACCENT_HIGHLIGHT}>{SCHEDULER_STEP_COPY.accent}</span>
                  </>
                }
                subtitle={SCHEDULER_STEP_COPY.subtitle}
                headingAs={introHeadingAs}
              />
            )}

            <ParentCard
              theme={theme}
              className="!p-0 overflow-hidden !border-0 !shadow-none bg-transparent"
            >
              {availabilityLoading ? (
                garden ? (
                  <DemoSchedulerSkeleton appearance="garden" />
                ) : (
                  <DemoSchedulerSkeleton storyTheme={theme} />
                )
              ) : availabilityError ? (
                <div
                  className={`flex items-center justify-center py-24 text-sm ${garden ? "font-bold text-[var(--sf-clay-deep)]" : ""}`}
                  style={garden ? undefined : { color: theme.alert, fontFamily: theme.fontBody }}
                  role="alert"
                >
                  {availabilityError}
                </div>
              ) : Object.keys(availabilitySlots).length === 0 ? (
                <div
                  className={`flex items-center justify-center py-24 text-sm ${garden ? "text-[var(--sf-soft)]" : ""}`}
                  style={garden ? undefined : { color: theme.muted, fontFamily: theme.fontBody }}
                >
                  No demo times are available right now. Please check back soon.
                </div>
              ) : (
                <DemoScheduler
                  availabilitySlots={availabilitySlots}
                  onConfirm={handleScheduled}
                  isSubmitting={isSubmitting}
                  storyTheme={theme}
                  appearance={garden ? "garden" : "story"}
                  displayTimezone={displayTimezone}
                  onDisplayTimezoneChange={setDisplayTimezone}
                />
              )}
            </ParentCard>

            {submitError && (
              <p
                className={`mt-4 text-center text-[13px] ${garden ? "font-bold text-[var(--sf-clay-deep)]" : ""}`}
                style={garden ? undefined : { color: theme.alert, fontFamily: theme.fontBody }}
                role="alert"
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
              headingAs={introHeadingAs}
              appearance={garden ? "garden" : "story"}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
