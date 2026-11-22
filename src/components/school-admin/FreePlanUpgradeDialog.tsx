"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import {
  DemoScheduler,
  type DemoSchedulerBooking,
} from "@/components/scheduler/DemoScheduler";
import { DemoSchedulerSkeleton } from "@/components/scheduler/DemoSchedulerSkeleton";
import PublicFormHoneypotField from "@/components/public-forms/PublicFormHoneypotField";
import Image from "next/image";
import { Tick } from "@/components/garden/ui";
import { WORKFLOW_COPY } from "@/components/home/home-copy";
import { ParentGardenScope } from "@/components/school-parent/garden/ParentGardenFrame";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import {
  G_FOCUS,
  GIcon,
  gBtnPop,
} from "@/components/school-parent/garden/ui";
import { detectBrowserTimezone } from "@/lib/marketing/demo-timezone-options";
import { SCHEDULER_TIMEZONE } from "@/lib/demo-scheduler";
import { formatDemoWhenInTimezone } from "@/lib/demo-scheduler-timezone";
import { PUBLIC_FORM_HONEYPOT_FIELD } from "@/lib/public-forms/honeypot";
import { FREE_PLAN_FULL_PLAN_LABEL } from "@/lib/school-admin/free-plan-upgrade";
import {
  FREE_PLAN_REPLACED_TOOLS,
  FREE_PLAN_UPGRADE_THEME,
  type FreePlanPitch,
  type FreePlanPitchTint,
} from "@/lib/school-admin/free-plan-upgrade-pitches";

type FreePlanUpgradeDialogProps = {
  open: boolean;
  featureLabel: string;
  pitch: FreePlanPitch;
  schoolName: string;
  slug: string;
  userName: string;
  userEmail: string;
  previewMode?: boolean;
  onClose: () => void;
};

type Step = "explain" | "book" | "booked";

const HEADER_WASH: Record<FreePlanPitchTint, string> = {
  butter: "bg-[var(--sf-butter)]/45",
  sky: "bg-[var(--sf-sky)]/70",
  lav: "bg-[var(--sf-lav)]/70",
  mint: "bg-[var(--sf-mint)]/70",
  peach: "bg-[var(--sf-peach)]/60",
};

const CARD_TINT: Record<FreePlanPitchTint, string> = {
  butter: "bg-[var(--sf-butter)]",
  sky: "bg-[var(--sf-sky)]",
  lav: "bg-[var(--sf-lav)]",
  mint: "bg-[var(--sf-mint)]",
  peach: "bg-[var(--sf-peach)]",
};

const CONFETTI_COLORS = ["#A05C45", "#FFE58A", "#DDEBD5", "#E3EDFB", "#ECE2F3"];

const CLOSE_BTN = `inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[var(--sf-ink)]/15 bg-white text-[var(--sf-ink)]/70 transition-colors hover:border-[var(--sf-ink)]/40 hover:text-[var(--sf-ink)] ${G_FOCUS}`;

const HOW_BTN = `inline-flex items-center justify-center rounded-full border-[1.5px] border-[var(--sf-ink)]/25 bg-white px-5 py-3 text-[15px] font-extrabold text-[var(--sf-ink)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/50 aria-expanded:border-[var(--sf-ink)] aria-expanded:bg-[var(--sf-cream)] ${G_FOCUS}`;

const TEXT_BTN = `inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-extrabold text-[var(--sf-ink)]/65 transition-colors hover:text-[var(--sf-ink)] ${G_FOCUS}`;

export default function FreePlanUpgradeDialog({
  open,
  featureLabel,
  pitch,
  schoolName,
  slug,
  userName,
  userEmail,
  previewMode = false,
  onClose,
}: FreePlanUpgradeDialogProps) {
  const reduceMotion = useReducedMotion() === true;
  const [step, setStep] = useState<Step>("explain");
  const [howOpen, setHowOpen] = useState(false);
  const howRef = useRef<HTMLDivElement>(null);
  const [booking, setBooking] = useState<DemoSchedulerBooking | null>(null);
  const [availabilitySlots, setAvailabilitySlots] = useState<
    Record<string, string[]>
  >({});
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [displayTimezone, setDisplayTimezone] = useState(() =>
    detectBrowserTimezone(SCHEDULER_TIMEZONE),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [loadedKey, setLoadedKey] = useState("");
  const requestKey = open ? featureLabel : "";
  const dialogRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (requestKey !== loadedKey) {
    setLoadedKey(requestKey);
    setStep("explain");
    setHowOpen(false);
    setAvailabilityLoading(Boolean(requestKey));
    setAvailabilityError(null);
    setAvailabilitySlots({});
    setBooking(null);
    setSubmitError(null);
  }

  const isFullPlan = featureLabel === FREE_PLAN_FULL_PLAN_LABEL;
  const featureName = isFullPlan ? "MudKitchen" : featureLabel;
  const school = schoolName.trim() || "your school";

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Close the "How it works" popover first, then the dialog.
      if (howOpen) setHowOpen(false);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, howOpen]);

  // Click outside the "How it works" popover closes it.
  useEffect(() => {
    if (!howOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (howRef.current && !howRef.current.contains(event.target as Node)) setHowOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [howOpen]);

  // Move focus into the dialog on open and back to the opener on close.
  useEffect(() => {
    if (!open) return;
    const opener =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const timer = window.setTimeout(() => dialogRef.current?.focus(), 0);
    return () => {
      window.clearTimeout(timer);
      opener?.focus?.();
    };
  }, [open]);

  // Each step starts at the top of the scroll area.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [step]);

  // Load times while the admin reads the explainer, so "Book a call" is instant.
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

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
  }, [open, featureLabel]);

  useEffect(() => {
    if (step !== "booked" || reduceMotion) return;
    const burst = (origin: { x: number; y: number }, angle: number) =>
      confetti({
        particleCount: 50,
        spread: 70,
        angle,
        origin,
        colors: CONFETTI_COLORS,
        scalar: 1.05,
        gravity: 0.9,
        zIndex: 90,
        disableForReducedMotion: true,
      });
    const t1 = setTimeout(() => burst({ x: 0.25, y: 0.85 }, 65), 120);
    const t2 = setTimeout(() => burst({ x: 0.75, y: 0.85 }, 115), 220);
    return () => [t1, t2].forEach(clearTimeout);
  }, [step, reduceMotion]);

  const handleScheduled = async (selected: DemoSchedulerBooking) => {
    if (isSubmitting || previewMode || !userEmail.trim() || !userName.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/demo-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName.trim(),
          email: userEmail.trim(),
          schoolName,
          role: "running",
          priorities: ["full"],
          prepNotes: `Upgrade request for ${featureLabel} from free school ${slug}.`,
          scheduledDate: selected.date,
          scheduledTime: selected.time,
          timezone: selected.displayTimezone,
          [PUBLIC_FORM_HONEYPOT_FIELD]: companyWebsite,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong");
        return;
      }
      setBooking(selected);
      setStep("booked");
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (typeof document === "undefined") return null;

  const fade = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.28, ease: PORTAL_EASE };
  const stepMotion = {
    initial: reduceMotion ? false : { opacity: 0, x: 14 },
    animate: { opacity: 1, x: 0 },
    exit: reduceMotion ? { opacity: 0 } : { opacity: 0, x: -14 },
    transition: { duration: reduceMotion ? 0.01 : 0.24, ease: PORTAL_EASE },
  } as const;

  const titleId = `free-plan-upgrade-title-${step}`;
  const Icon = pitch.icon;
  const bookedWhen = booking
    ? formatDemoWhenInTimezone(booking.date, booking.time, booking.displayTimezone)
    : null;

  return createPortal(
    <ParentGardenScope theme={FREE_PLAN_UPGRADE_THEME} className="contents">
      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
          >
            <button
              type="button"
              tabIndex={-1}
              className="absolute inset-0 cursor-default bg-[var(--sf-ink)]/45"
              aria-label="Close"
              onClick={onClose}
            />
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              data-testid="free-plan-upgrade-dialog"
              className="relative z-[1] flex max-h-[min(880px,calc(100dvh-24px))] w-full max-w-[760px] flex-col overflow-hidden rounded-[28px] border-2 border-[var(--sf-ink)] bg-[var(--sf-paper)] text-[var(--sf-ink)] shadow-[0_8px_0_0_var(--sf-ink),0_40px_80px_-30px_rgba(43,36,29,0.55)] outline-none"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.99 }}
              transition={fade}
            >
              <PublicFormHoneypotField
                value={companyWebsite}
                onChange={setCompanyWebsite}
              />
              <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <AnimatePresence mode="wait" initial={false}>
                  {step === "explain" ? (
                    <motion.div key="explain" {...stepMotion}>
                      {/* Header on the feature's pastel wash */}
                      <div className={`relative px-6 pb-7 pt-7 sm:px-9 sm:pt-9 ${HEADER_WASH[pitch.tint]}`}>
                        <button
                          type="button"
                          onClick={onClose}
                          className={`${CLOSE_BTN} absolute right-4 top-4 z-10`}
                          aria-label="Close"
                        >
                          <X className="h-4 w-4" aria-hidden />
                        </button>
                        <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,1fr)_160px]">
                          <div className="min-w-0 pr-10 sm:pr-0">
                            <h2
                              id={titleId}
                              className="sf-display m-0 text-[2rem] leading-[0.98] text-[var(--sf-ink)] sm:text-[2.55rem]"
                            >
                              {pitch.headlineLead}{" "}
                              <span className="text-[var(--sf-clay)]">{pitch.headlineAccent}</span>
                            </h2>
                            <p className="m-0 mt-3 max-w-[46ch] text-[15.5px] leading-relaxed text-[var(--sf-soft)]">
                              {pitch.promise}
                            </p>
                          </div>
                          <div aria-hidden className="relative hidden justify-self-end sm:mr-7 sm:mt-3 sm:block">
                            <span className="absolute -top-2.5 left-1/2 z-10 h-5 w-16 -translate-x-1/2 rotate-3 rounded-sm bg-white/80 shadow-[0_2px_6px_rgba(0,0,0,0.06)]" />
                            <div
                              className={`flex h-[140px] w-[140px] flex-col items-center justify-center gap-3 rounded-[18px] border-2 border-[var(--sf-ink)] shadow-[0_5px_0_0_var(--sf-ink)] ${CARD_TINT[pitch.tint]}`}
                              style={{ rotate: "-3deg" }}
                            >
                              <GIcon size="lg">
                                <Icon />
                              </GIcon>
                              <span className="max-w-[118px] truncate text-center text-[13px] font-extrabold">
                                {isFullPlan ? "MudKitchen" : featureLabel}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-6 pb-6 pt-6 sm:px-9">
                        {/* Three quick wins */}
                        <ul className="m-0 grid list-none gap-2.5 p-0 sm:grid-cols-3" aria-label={`What ${featureName} does for ${school}`}>
                          {pitch.highlights.map(({ icon: HighlightIcon, text }) => (
                            <li
                              key={text}
                              className="flex items-center gap-3 rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white px-3.5 py-3 sm:flex-col sm:items-start sm:gap-2.5 sm:py-3.5"
                            >
                              <span
                                aria-hidden
                                className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--sf-ink)] ring-2 ring-[var(--sf-ink)] ${CARD_TINT[pitch.tint]}`}
                              >
                                <HighlightIcon className="h-[18px] w-[18px]" strokeWidth={2.4} />
                              </span>
                              <span className="text-[14.5px] font-extrabold leading-snug text-[var(--sf-ink)]">{text}</span>
                            </li>
                          ))}
                        </ul>

                        {/* A real-life moment: without it vs with MudKitchen */}
                        <section
                          aria-label={`Example: ${pitch.scenario.moment}`}
                          className="mt-4 overflow-hidden rounded-[20px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white"
                        >
                          <p className="m-0 flex items-center gap-2 border-b-[1.5px] border-dashed border-[var(--sf-ink)]/12 px-4 py-2.5 text-[14px] font-extrabold text-[var(--sf-ink)]">
                            <span aria-hidden>{pitch.emoji}</span>
                            {pitch.scenario.moment}
                          </p>
                          <div className="grid sm:grid-cols-2">
                            <div className="bg-[var(--sf-cream)] px-4 py-3.5">
                              <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">
                                Without it
                              </p>
                              <p className="m-0 mt-1.5 text-[14px] leading-snug text-[var(--sf-soft)]">
                                {pitch.scenario.before}
                              </p>
                            </div>
                            <div className="border-t-[1.5px] border-dashed border-[var(--sf-ink)]/12 bg-[var(--sf-mint)]/60 px-4 py-3.5 sm:border-l-[1.5px] sm:border-t-0">
                              <p className="m-0 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-forest)]">
                                <Tick className="h-4 w-4" />
                                With MudKitchen
                              </p>
                              <p className="m-0 mt-1.5 text-[14px] font-semibold leading-snug text-[var(--sf-ink)]">
                                {pitch.scenario.after}
                              </p>
                            </div>
                          </div>
                        </section>

                        {pitch.replaces?.length ? (
                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <span className="mr-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">
                              Replaces
                            </span>
                            {pitch.replaces.map((tool) => (
                              <span
                                key={tool}
                                className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-[var(--sf-ink)]/10 bg-white py-1 pl-1.5 pr-3 text-[13px] font-bold text-[var(--sf-ink)]/80"
                              >
                                <Image
                                  src={FREE_PLAN_REPLACED_TOOLS[tool]}
                                  alt=""
                                  width={18}
                                  height={18}
                                  className="h-[18px] w-[18px] object-contain"
                                />
                                {tool}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </motion.div>
                  ) : step === "book" ? (
                    <motion.div key="book" {...stepMotion} className="px-5 pb-5 pt-5 sm:px-8 sm:pt-6">
                      <div className="flex items-center justify-between gap-3">
                        <button type="button" onClick={() => setStep("explain")} className={`${TEXT_BTN} -ml-3`}>
                          <ArrowLeft className="h-4 w-4" aria-hidden />
                          Back
                        </button>
                        <button type="button" onClick={onClose} className={CLOSE_BTN} aria-label="Close">
                          <X className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                      <div className="mt-2">
                        <h2
                          id={titleId}
                          className="sf-display m-0 text-[1.9rem] leading-[1] text-[var(--sf-ink)] sm:text-[2.2rem]"
                        >
                          Pick a time <span className="text-[var(--sf-clay)]">that works.</span>
                        </h2>
                        <p className="m-0 mt-2 max-w-[52ch] text-[15px] leading-relaxed text-[var(--sf-soft)]">
                          We&rsquo;ll walk through {featureName} with you and set it up for {school}.
                        </p>
                      </div>

                      <div className="mt-5">
                        {availabilityLoading ? (
                          <DemoSchedulerSkeleton appearance="garden" />
                        ) : availabilityError ? (
                          <p className="m-0 rounded-[18px] bg-[var(--sf-peach)]/60 px-5 py-10 text-center text-sm font-semibold text-[var(--sf-clay-deep)]">
                            {availabilityError}
                          </p>
                        ) : Object.keys(availabilitySlots).length === 0 ? (
                          <p className="m-0 rounded-[18px] bg-[var(--sf-cream)] px-5 py-10 text-center text-sm font-semibold text-[var(--sf-soft)]">
                            No times are open right now. Use &ldquo;Need help?&rdquo; in the sidebar and we&rsquo;ll find one with you.
                          </p>
                        ) : (
                          <DemoScheduler
                            availabilitySlots={availabilitySlots}
                            onConfirm={handleScheduled}
                            isSubmitting={isSubmitting}
                            confirmDisabled={previewMode || !userEmail.trim() || !userName.trim()}
                            appearance="garden"
                            titleAs="h3"
                            calendarHint={`Pick a date, then a time. We'll book it for ${userEmail.trim() || "you"}.`}
                            displayTimezone={displayTimezone}
                            onDisplayTimezoneChange={setDisplayTimezone}
                          />
                        )}
                        {submitError ? (
                          <p role="alert" className="m-0 mt-3 text-sm font-semibold text-[var(--sf-clay-deep)]">
                            {submitError}
                          </p>
                        ) : null}
                        {!previewMode && !userName.trim() ? (
                          <p className="m-0 mt-3 text-sm font-semibold text-[var(--sf-soft)]">
                            Add your name on Home first so we know who we&rsquo;re meeting.
                          </p>
                        ) : null}
                        {previewMode ? (
                          <p className="m-0 mt-3 text-center text-xs font-semibold text-[var(--sf-soft)]">
                            Preview only. This does not book a call.
                          </p>
                        ) : null}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="booked"
                      {...stepMotion}
                      className="flex flex-col items-center px-6 pb-9 pt-10 text-center sm:px-10"
                    >
                      <motion.span
                        aria-hidden
                        className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--sf-ink)] bg-[var(--sf-forest)] text-white shadow-[0_4px_0_0_var(--sf-ink)]"
                        initial={reduceMotion ? false : { scale: 0.4, rotate: -12 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 380, damping: 18, delay: 0.05 }}
                      >
                        <Check className="h-8 w-8" strokeWidth={3} />
                      </motion.span>
                      <h2
                        id={titleId}
                        className="sf-display m-0 mt-5 text-[2.1rem] leading-[1] text-[var(--sf-ink)] sm:text-[2.4rem]"
                      >
                        You&rsquo;re <span className="text-[var(--sf-forest)]">booked.</span>
                      </h2>
                      {bookedWhen ? (
                        <p className="m-0 mt-4 inline-flex rounded-full bg-[var(--sf-mint)] px-4 py-1.5 text-[15px] font-extrabold text-[var(--sf-forest)]">
                          {bookedWhen}
                        </p>
                      ) : null}
                      <p className="m-0 mt-4 max-w-[44ch] text-[15px] leading-relaxed text-[var(--sf-soft)]">
                        We&rsquo;ll walk through {featureName} and set it up for {school}. A confirmation is on its way to{" "}
                        <span className="font-extrabold text-[var(--sf-ink)]">{userEmail}</span>, and we&rsquo;ll send your meeting link 24 hours before.
                      </p>
                      <button type="button" onClick={onClose} className={`${gBtnPop} mt-7`}>
                        Done
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {step === "explain" ? (
                <div className="relative z-10 flex shrink-0 flex-col-reverse gap-2 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/15 bg-[var(--sf-paper)] px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-9">
                  <button type="button" onClick={onClose} className={TEXT_BTN}>
                    Not now
                  </button>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <div ref={howRef} className="relative flex flex-col">
                      <AnimatePresence>
                        {howOpen ? (
                          <motion.div
                            id="free-plan-how-it-works"
                            role="region"
                            aria-label="How it works"
                            className="absolute bottom-full left-0 right-0 z-20 mb-3 sm:left-auto sm:w-[min(360px,calc(100vw-48px))] rounded-[20px] border-2 border-[var(--sf-ink)] bg-white p-4 text-left shadow-[0_5px_0_0_var(--sf-ink),0_24px_40px_-24px_rgba(43,36,29,0.45)]"
                            initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }}
                            transition={reduceMotion ? { duration: 0.01 } : { type: "spring", stiffness: 420, damping: 30 }}
                            style={{ transformOrigin: "bottom right" }}
                          >
                            <p className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">How it works</p>
                            <ol className="m-0 mt-3 flex list-none flex-col gap-3 p-0">
                              {WORKFLOW_COPY.steps.map((item, index) => (
                                <li key={item.number} className="flex items-start gap-3">
                                  <span className="mt-px inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--sf-ink)] text-[11px] font-extrabold text-white">
                                    {index + 1}
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block text-[14px] font-extrabold leading-snug text-[var(--sf-ink)]">
                                      {item.title}
                                    </span>
                                    <span className="mt-0.5 block text-[13px] leading-snug text-[var(--sf-soft)]">
                                      {item.body}
                                    </span>
                                  </span>
                                </li>
                              ))}
                            </ol>
                            <span
                              aria-hidden
                              className="absolute -bottom-[9px] right-10 h-4 w-4 rotate-45 border-b-2 border-r-2 border-[var(--sf-ink)] bg-white"
                            />
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                      <button
                        type="button"
                        aria-expanded={howOpen}
                        aria-controls="free-plan-how-it-works"
                        onClick={() => setHowOpen((value) => !value)}
                        className={HOW_BTN}
                        data-testid="free-plan-upgrade-how"
                      >
                        How it works
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setHowOpen(false);
                        setStep("book");
                      }}
                      className={`${gBtnPop} group`}
                      data-testid="free-plan-upgrade-book"
                    >
                      Book a call
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </ParentGardenScope>,
    document.body,
  );
}
