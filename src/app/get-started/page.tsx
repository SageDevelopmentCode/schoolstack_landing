"use client";

import { useState, useEffect, useMemo } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/sections/Navbar";
import { DemoScheduler } from "@/components/scheduler/DemoScheduler";
import { DemoSchedulerSkeleton } from "@/components/scheduler/DemoSchedulerSkeleton";
import PublicFormHoneypotField from "@/components/public-forms/PublicFormHoneypotField";
import { PUBLIC_FORM_HONEYPOT_FIELD } from "@/lib/public-forms/honeypot";
import GetStartedConfirmation from "@/components/get-started/GetStartedConfirmation";
import GetStartedInfoCallout from "@/components/get-started/GetStartedInfoCallout";
import GetStartedRoleChoices from "@/components/get-started/GetStartedRoleChoices";
import GetStartedStepProgress from "@/components/get-started/GetStartedStepProgress";
import GetStartedStoryHeader from "@/components/get-started/GetStartedStoryHeader";
import GetStartedStoryShell from "@/components/get-started/GetStartedStoryShell";
import GetStartedStoryTextField from "@/components/get-started/GetStartedStoryTextField";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import {
  type DemoRequestRoleId,
  demoRequestRoleLabel,
} from "@/lib/demo-request-roles";
import { MUDKITCHEN_MARKETING_STORY_THEME } from "@/lib/marketing/mudkitchen-story-theme";

interface FormData {
  name: string;
  email: string;
  schoolName: string;
  role: DemoRequestRoleId | "";
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

export default function GetStartedPage() {
  const theme = useMemo(() => MUDKITCHEN_MARKETING_STORY_THEME, []);

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [booking, setBooking] = useState<{ date: string; time: string } | null>(null);
  const [availabilitySlots, setAvailabilitySlots] = useState<Record<string, string[]>>({});
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [companyWebsite, setCompanyWebsite] = useState("");

  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    schoolName: "",
    role: "",
  });

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

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
            err instanceof Error ? err.message : "Failed to load availability"
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
    if (!form.schoolName.trim()) errs.add("schoolName");
    if (!form.role) errs.add("role");
    setErrors(errs);
    return errs.size === 0;
  }

  function handleContinue() {
    if (validate()) {
      setSubmitError(null);
      setStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleScheduled(selected: { date: string; time: string }) {
    if (isSubmitting || !form.role) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/demo-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          schoolName: form.schoolName.trim(),
          role: form.role,
          scheduledDate: selected.date,
          scheduledTime: selected.time,
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
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const roleLabel = form.role ? demoRequestRoleLabel(form.role) : "";
  const hasErrors = errors.size > 0;

  return (
    <>
      <Navbar />
      <GetStartedStoryShell wide={step === 1}>
        <AnimatePresence>
          {step < 2 && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              <GetStartedStepProgress theme={theme} step={step as 0 | 1} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step-form" {...slideIn}>
              <GetStartedStoryHeader
                theme={theme}
                title={
                  <>
                    See how MudKitchen can simplify{" "}
                    <em style={{ color: theme.coral, fontStyle: "italic" }}>
                      your school.
                    </em>
                  </>
                }
                subtitle="Share a few details, then choose a time that works for you."
              />

              <ParentCard
                theme={theme}
                className="relative flex flex-col gap-7 md:gap-8 border-border bg-surface"
              >
                <PublicFormHoneypotField
                  value={companyWebsite}
                  onChange={setCompanyWebsite}
                />
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <GetStartedStoryTextField
                    theme={theme}
                    label="First name"
                    value={form.name}
                    onChange={(v) => {
                      set("name", v);
                      setErrors((e) => {
                        const n = new Set(e);
                        n.delete("name");
                        return n;
                      });
                    }}
                    placeholder="Jane"
                    hasError={errors.has("name")}
                  />
                  <GetStartedStoryTextField
                    theme={theme}
                    label="Work email"
                    type="email"
                    value={form.email}
                    onChange={(v) => {
                      set("email", v);
                      setErrors((e) => {
                        const n = new Set(e);
                        n.delete("email");
                        return n;
                      });
                    }}
                    placeholder="jane@yourschool.com"
                    hasError={errors.has("email")}
                  />
                </div>

                <GetStartedStoryTextField
                  theme={theme}
                  label="School / program name"
                  value={form.schoolName}
                  onChange={(v) => {
                    set("schoolName", v);
                    setErrors((e) => {
                      const n = new Set(e);
                      n.delete("schoolName");
                      return n;
                    });
                  }}
                  placeholder="Maple Ridge Microschool"
                  hasError={errors.has("schoolName")}
                />

                <GetStartedRoleChoices
                  theme={theme}
                  value={form.role}
                  onChange={(role) => {
                    set("role", role);
                    setErrors((e) => {
                      const n = new Set(e);
                      n.delete("role");
                      return n;
                    });
                  }}
                  hasError={errors.has("role")}
                />

                <AnimatePresence>
                  {hasErrors && (
                    <motion.p
                      key="error"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[13px] -mt-2"
                      style={{ color: theme.alert, fontFamily: theme.fontBody }}
                    >
                      Please fill in the highlighted fields above.
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="flex flex-col items-center gap-3 pt-1">
                  <ParentButton
                    theme={theme}
                    onClick={handleContinue}
                    className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap px-8 !text-sm"
                    style={{ backgroundColor: theme.coral }}
                  >
                    See Available Times
                    <ChevronRight size={15} className="shrink-0" />
                  </ParentButton>
                  <p
                    className="max-w-[28ch] text-center text-[12px] leading-snug"
                    style={{ color: theme.muted, fontFamily: theme.fontBody }}
                  >
                    No commitment. 20 minutes, tailored to your school.
                  </p>
                </div>
              </ParentCard>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step-scheduler" {...slideIn}>
              <button
                type="button"
                onClick={() => {
                  setSubmitError(null);
                  setStep(0);
                  window.scrollTo({ top: 0, behavior: "smooth" });
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

              <GetStartedInfoCallout theme={theme}>
                You&apos;ll see how this could work for your school, with time for
                questions. 20 minutes, no slides, just your workflows.
              </GetStartedInfoCallout>

              <ParentCard
                theme={theme}
                className="!p-0 overflow-hidden border-border bg-surface"
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
      </GetStartedStoryShell>
    </>
  );
}
