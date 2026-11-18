"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarCheck, CalendarDays, Loader2 } from "lucide-react";
import AdmissionsDateTimePicker from "@/components/admissions/AdmissionsDateTimePicker";
import PublicTourFormFields from "@/components/admissions/PublicTourFormFields";
import PublicTourGardenHeader from "@/components/admissions/PublicTourGardenHeader";
import PublicTourGardenShell from "@/components/admissions/PublicTourGardenShell";
import PublicTourStepProgress, {
  PUBLIC_TOUR_STEPS,
  publicTourStepIndex,
  type PublicTourStepId,
} from "@/components/admissions/PublicTourStepProgress";
import PublicFormHoneypotField from "@/components/public-forms/PublicFormHoneypotField";
import { PUBLIC_FORM_HONEYPOT_FIELD } from "@/lib/public-forms/honeypot";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import { PortalIsland } from "@/components/school-parent/garden/ParentGardenFrame";
import { PORTAL_EASE, useCelebrate } from "@/components/school-parent/garden/motion";
import { GIcon, GKicker, gBtnOutlineSm, gBtnPop } from "@/components/school-parent/garden/ui";
import { formatOrganizationTimezoneLabel } from "@/lib/admissions/admissions-availability";
import type { PublicTourFieldDefinition } from "@/lib/admissions/public-tour-settings";
import { formatSelectedDate } from "@/lib/demo-scheduler";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { reportApplyOperationalError } from "@/lib/operational-errors-client";

type PublicTourExperienceProps = {
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  organizationId: string;
  headline: string;
  intro: string;
  fields: PublicTourFieldDefinition[];
};

/** Portal step swap (fade/slide); no motion at all when reduced motion is on. */
function stepMotion(reduce: boolean) {
  // Keep `animate` so the hydrated style matches the server's final state.
  if (reduce) return { initial: false as const, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } };
  return {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.28, ease: PORTAL_EASE },
  };
}

const PANEL =
  "relative min-w-0 rounded-[28px] border-[1.5px] border-[var(--sf-ink)]/12 p-4 shadow-[0_6px_0_0_rgba(43,36,29,0.07)] sm:p-7";

function PanelHeading({ step, id }: { step: PublicTourStepId; id: string }) {
  const index = publicTourStepIndex(step);
  return (
    <div className="mb-5">
      <GKicker>
        Step {index + 1} of {PUBLIC_TOUR_STEPS.length}
      </GKicker>
      <h2 id={id} className="sf-display m-0 mt-1 text-[1.6rem] leading-[1.05] text-[var(--sf-ink)] sm:text-[1.9rem]">
        {PUBLIC_TOUR_STEPS[index].label}
      </h2>
    </div>
  );
}

/** "Your visit" ticket: the picked date and time on a notched butter stub. */
function VisitTicket({
  date,
  time,
  timezoneLabel,
  className = "",
}: {
  date: string;
  time: string;
  timezoneLabel: string;
  className?: string;
}) {
  return (
    <div className={`drop-shadow-[0_10px_14px_rgba(43,36,29,0.16)] ${className}`}>
      <div className="sf-ticket flex items-center gap-4 rounded-[18px] bg-[var(--sf-butter)] px-7 py-4">
        <GIcon size="sm">
          <CalendarDays />
        </GIcon>
        <div className="min-w-0 flex-1 border-l-2 border-dashed border-[var(--sf-ink)]/20 pl-4">
          <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-ink)]/70">
            Your visit
          </p>
          <p className="m-0 mt-0.5 break-words text-pretty text-[15px] font-extrabold text-[var(--sf-ink)]">
            {formatSelectedDate(date)} · {time}
          </p>
          <p className="m-0 text-[12px] font-bold text-[var(--sf-ink)]/65">{timezoneLabel}</p>
        </div>
      </div>
    </div>
  );
}

function PublicTourExperienceInner({
  branding,
  schoolSlug,
  organizationId,
  headline,
  intro,
  fields,
}: Omit<PublicTourExperienceProps, "schoolName">) {
  const { theme } = useParentTheme();
  const reduce = useReducedMotion() === true;
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const [step, setStep] = useState<PublicTourStepId>("schedule");
  const [timezone, setTimezone] = useState("America/Chicago");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [whenLabel, setWhenLabel] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const prevStep = useRef(step);

  useCelebrate(step === "confirmed", theme, "public-tour-booked");

  useEffect(() => {
    let cancelled = false;
    async function loadConfig() {
      try {
        const response = await fetch(
          `/api/public/tours/config?slug=${encodeURIComponent(schoolSlug)}`,
        );
        if (!response.ok) return;
        const payload = (await response.json()) as { fields?: PublicTourFieldDefinition[] };
        if (!cancelled && payload.fields?.length) {
          // Fields are passed from server; keep client in sync if config endpoint adds timezone later.
        }
      } catch {
        // Non-fatal
      }
    }
    void loadConfig();
    return () => {
      cancelled = true;
    };
  }, [schoolSlug]);

  // On a step change, bring the panel into view on phones.
  useEffect(() => {
    if (prevStep.current === step) return;
    prevStep.current = step;
    if (window.matchMedia("(max-width: 1023px)").matches) {
      panelRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }, [step, reduce]);

  // Land focus on the confirmation heading as soon as it mounts (after the
  // previous step's exit animation), since the "Book tour" button is gone.
  const focusConfirmedHeading = useCallback((el: HTMLHeadingElement | null) => {
    el?.focus({ preventScroll: true });
  }, []);

  const timezoneLabel = formatOrganizationTimezoneLabel(timezone);

  const availabilityEndpointBuilder = useCallback(
    (start: string, end: string) =>
      `/api/public/tours/availability?slug=${encodeURIComponent(
        schoolSlug,
      )}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
    [schoolSlug],
  );

  const hasSlot = Boolean(selectedDate && selectedTime);

  async function handleSubmitBooking() {
    if (!selectedDate || !selectedTime) return;
    setSubmitting(true);
    setError(null);
    let responseStatus: number | undefined;

    try {
      const response = await fetch("/api/public/tours/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: schoolSlug,
          scheduledDate: selectedDate,
          startTimeSlot: selectedTime,
          answers,
          [PUBLIC_FORM_HONEYPOT_FIELD]: companyWebsite,
        }),
      });
      responseStatus = response.status;
      const payload = (await response.json()) as {
        error?: string;
        whenLabel?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to schedule tour.");
      }

      setWhenLabel(payload.whenLabel ?? null);
      setStep("confirmed");
    } catch (err) {
      reportApplyOperationalError(organizationId, "public_tour.schedule", err, {
        responseStatus,
      });
      setError(err instanceof Error ? err.message : "Failed to schedule tour.");
    } finally {
      setSubmitting(false);
    }
  }

  const ticket =
    selectedDate && selectedTime ? (
      <VisitTicket date={selectedDate} time={selectedTime} timezoneLabel={timezoneLabel} />
    ) : null;

  return (
    <div className="grid min-w-0 gap-7 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-14">
      {/* Left rail: header, steps and (desktop) the visit ticket. */}
      <aside className="min-w-0 lg:sticky lg:top-10 lg:self-start">
        <PublicTourGardenHeader headline={headline} intro={intro} />
        <PublicTourStepProgress step={step} orientation="row" className="mt-6 lg:hidden" />
        <PublicTourStepProgress step={step} orientation="column" className="mt-10 hidden lg:block" />
        <AnimatePresence initial={false}>
          {ticket && step !== "confirmed" ? (
            <motion.div
              key="rail-ticket"
              className="mt-8 hidden max-w-[400px] lg:block"
              initial={reduce ? false : { opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: 6 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 24 }}
            >
              {ticket}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </aside>

      {/* Right: the active step. */}
      <div ref={panelRef} className="min-w-0 scroll-mt-6">
        <AnimatePresence mode="wait" initial={false}>
          {step === "schedule" ? (
            <motion.section
              key="schedule"
              {...stepMotion(reduce)}
              aria-labelledby="public-tour-step-schedule"
              className={`${PANEL} bg-white`}
            >
              <PanelHeading step="schedule" id="public-tour-step-schedule" />
              <PortalIsland>
                <AdmissionsDateTimePicker
                  C={C}
                  availabilityEndpointBuilder={availabilityEndpointBuilder}
                  timezone={timezone}
                  timezoneLabel={timezoneLabel}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onDateChange={setSelectedDate}
                  onTimeChange={setSelectedTime}
                  onTimezoneLoaded={setTimezone}
                  showGroupTourBadges
                />
              </PortalIsland>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div
                  aria-live="polite"
                  className={`flex min-w-0 flex-1 items-center gap-3 rounded-[14px] border-[1.5px] px-3.5 py-3 transition-colors ${
                    hasSlot
                      ? "border-[var(--sf-forest)]/25 bg-[var(--sf-mint)]"
                      : "border-dashed border-[var(--sf-ink)]/15 bg-white"
                  }`}
                >
                  <CalendarCheck
                    className={`h-5 w-5 shrink-0 ${hasSlot ? "text-[var(--sf-forest)]" : "text-[var(--sf-ink)]/35"}`}
                    aria-hidden
                  />
                  <p className="m-0 min-w-0 text-[14px] font-bold text-[var(--sf-ink)]/80">
                    {selectedDate && selectedTime ? (
                      <>
                        <span className="sr-only">Selected: </span>
                        {formatSelectedDate(selectedDate)} · {selectedTime}
                      </>
                    ) : (
                      <span className="font-semibold text-[var(--sf-soft)]">Nothing selected yet</span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!hasSlot}
                  onClick={() => setStep("details")}
                  className={`${gBtnPop} w-full shrink-0 sm:w-auto`}
                >
                  Continue
                  <ArrowRight className="h-4 w-4" strokeWidth={2.6} aria-hidden />
                </button>
              </div>
            </motion.section>
          ) : null}

          {step === "details" ? (
            <motion.div key="details" {...stepMotion(reduce)} className="space-y-5">
              {ticket ? <div className="lg:hidden">{ticket}</div> : null}

              <section aria-labelledby="public-tour-step-details" className={`${PANEL} sf-paper`}>
                <PanelHeading step="details" id="public-tour-step-details" />
                <PublicFormHoneypotField value={companyWebsite} onChange={setCompanyWebsite} />
                <PublicTourFormFields
                  fields={fields}
                  values={answers}
                  onChange={setAnswers}
                  disabled={submitting}
                />
                {error ? (
                  <p
                    role="alert"
                    className="m-0 mt-5 rounded-[14px] border-[1.5px] border-[#b42318]/25 bg-[#fdecea] px-3.5 py-2.5 text-[13px] font-bold text-[#8a1c12]"
                  >
                    {error}
                  </p>
                ) : null}
                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setStep("schedule")}
                    className={`${gBtnOutlineSm} w-full sm:w-auto`}
                  >
                    <ArrowLeft className="h-4 w-4" strokeWidth={2.6} aria-hidden />
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    aria-busy={submitting || undefined}
                    onClick={() => void handleSubmitBooking()}
                    className={`${gBtnPop} w-full sm:w-auto`}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <CalendarCheck className="h-4 w-4" strokeWidth={2.6} aria-hidden />
                    )}
                    {submitting ? "Scheduling…" : "Book tour"}
                  </button>
                </div>
              </section>
            </motion.div>
          ) : null}

          {step === "confirmed" ? (
            <motion.section
              key="confirmed"
              aria-labelledby="public-tour-step-confirmed"
              initial={reduce ? false : { opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 22 }}
              className={`${PANEL} overflow-hidden bg-white text-center`}
            >
              <div
                className="sf-grid pointer-events-none absolute inset-x-0 top-0 h-40 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]"
                aria-hidden
              />
              <div className="relative flex flex-col items-center px-1 py-4 sm:px-6 sm:py-8">
                <GIcon size="lg">
                  <CalendarCheck />
                </GIcon>
                <h2
                  id="public-tour-step-confirmed"
                  ref={focusConfirmedHeading}
                  tabIndex={-1}
                  className="sf-display m-0 mt-5 text-[2.1rem] leading-[1] text-[var(--sf-ink)] outline-none sm:text-[2.6rem]"
                >
                  You&apos;re <span className="text-[var(--sf-clay)]">scheduled!</span>
                </h2>
                {whenLabel ? (
                  <div className="mt-6 w-full max-w-[420px] drop-shadow-[0_10px_14px_rgba(43,36,29,0.16)]">
                    <p className="sf-ticket m-0 rounded-[18px] bg-[var(--sf-butter)] px-8 py-4 text-[16px] font-extrabold text-[var(--sf-ink)]">
                      {whenLabel}
                    </p>
                  </div>
                ) : null}
                <p className="m-0 mt-6 max-w-[440px] text-pretty text-[15px] leading-relaxed text-[var(--sf-soft)]">
                  We sent a confirmation to the email you provided. If you need to change your visit,
                  contact the school directly.
                </p>
                <p className="sf-hand m-0 mt-5 text-2xl text-[var(--sf-forest)]" aria-hidden>
                  see you soon ✿
                </p>
              </div>
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function PublicTourExperience({
  branding,
  schoolName,
  schoolSlug,
  organizationId,
  headline,
  intro,
  fields,
}: PublicTourExperienceProps) {
  return (
    <PublicTourGardenShell branding={branding} schoolName={schoolName}>
      <PublicTourExperienceInner
        branding={branding}
        schoolSlug={schoolSlug}
        organizationId={organizationId}
        headline={headline}
        intro={intro}
        fields={fields}
      />
    </PublicTourGardenShell>
  );
}
