"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AdmissionsDateTimePicker from "@/components/admissions/AdmissionsDateTimePicker";
import PublicTourFormFields from "@/components/admissions/PublicTourFormFields";
import PublicTourStoryHeader from "@/components/admissions/PublicTourStoryHeader";
import PublicTourStoryShell from "@/components/admissions/PublicTourStoryShell";
import PublicTourStepProgress, {
  type PublicTourStepId,
} from "@/components/admissions/PublicTourStepProgress";
import TurnstileField, {
  isTurnstileClientConfigured,
} from "@/components/public-forms/TurnstileField";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import { formatOrganizationTimezoneLabel } from "@/lib/admissions/admissions-availability";
import type { PublicTourFieldDefinition } from "@/lib/admissions/public-tour-settings";
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

const STEP_TRANSITION = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const },
};

function PublicTourExperienceInner({
  branding,
  schoolSlug,
  organizationId,
  headline,
  intro,
  fields,
}: Omit<PublicTourExperienceProps, "schoolName">) {
  const { theme } = useParentTheme();
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const [step, setStep] = useState<PublicTourStepId>("schedule");
  const [timezone, setTimezone] = useState("America/Chicago");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [whenLabel, setWhenLabel] = useState<string | null>(null);
  const turnstileRequired = isTurnstileClientConfigured();

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

  const timezoneLabel = formatOrganizationTimezoneLabel(timezone);

  const slotSummary =
    selectedDate && selectedTime
      ? `${selectedDate} at ${selectedTime} (${timezoneLabel})`
      : null;

  async function handleSubmitBooking() {
    if (!selectedDate || !selectedTime) return;
    if (turnstileRequired && !turnstileToken) {
      setError("Please complete the security check.");
      return;
    }

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
          turnstileToken,
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

  return (
    <>
      <PublicTourStoryHeader headline={headline} intro={intro} />
      <PublicTourStepProgress step={step} />

      <AnimatePresence mode="wait">
        {step === "confirmed" ? (
          <motion.div key="confirmed" {...STEP_TRANSITION}>
            <ParentCard theme={theme} variant="today" className="text-center sm:text-left">
              <p
                className="font-heading text-xl font-semibold sm:text-2xl"
                style={{ color: theme.primaryDark }}
              >
                You&apos;re scheduled!
              </p>
              {whenLabel ? (
                <p className="mt-3 text-[15px] font-medium" style={{ color: theme.ink }}>
                  {whenLabel}
                </p>
              ) : null}
              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: theme.muted }}>
                We sent a confirmation to the email you provided. If you need to change your visit,
                contact the school directly.
              </p>
            </ParentCard>
          </motion.div>
        ) : null}

        {step === "schedule" ? (
          <motion.div key="schedule" {...STEP_TRANSITION}>
            <ParentCard theme={theme}>
              <AdmissionsDateTimePicker
                C={C}
                availabilityEndpointBuilder={(start, end) =>
                  `/api/public/tours/availability?slug=${encodeURIComponent(
                    schoolSlug,
                  )}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
                }
                timezone={timezone}
                timezoneLabel={timezoneLabel}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onDateChange={setSelectedDate}
                onTimeChange={setSelectedTime}
                onTimezoneLoaded={setTimezone}
                showGroupTourBadges
              />
              <div className="mt-6 flex justify-end">
                <ParentButton
                  theme={theme}
                  type="button"
                  disabled={!selectedDate || !selectedTime}
                  onClick={() => setStep("details")}
                >
                  Continue
                </ParentButton>
              </div>
            </ParentCard>
          </motion.div>
        ) : null}

        {step === "details" ? (
          <motion.div key="details" {...STEP_TRANSITION} className="space-y-4">
            {slotSummary ? (
              <ParentCard theme={theme} variant="announcement" className="!py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: theme.muted }}>
                  Your visit
                </p>
                <p className="mt-1 text-[15px] font-semibold" style={{ color: theme.ink }}>
                  {slotSummary}
                </p>
              </ParentCard>
            ) : null}

            <ParentCard theme={theme}>
              <PublicTourFormFields
                fields={fields}
                values={answers}
                onChange={setAnswers}
                disabled={submitting}
              />
              <div className="mt-4">
                <TurnstileField onTokenChange={setTurnstileToken} />
              </div>
              {error ? (
                <p
                  className="mt-4 rounded-[10px] border px-3 py-2.5 text-sm"
                  style={{
                    borderColor: theme.alert,
                    backgroundColor: theme.alertBg,
                    color: theme.alert,
                  }}
                  role="alert"
                >
                  {error}
                </p>
              ) : null}
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                <ParentButton
                  theme={theme}
                  type="button"
                  variant="outline"
                  disabled={submitting}
                  onClick={() => setStep("schedule")}
                  className="w-full sm:w-auto"
                >
                  Back
                </ParentButton>
                <ParentButton
                  theme={theme}
                  type="button"
                  disabled={submitting || (turnstileRequired && !turnstileToken)}
                  onClick={() => void handleSubmitBooking()}
                  className="w-full sm:w-auto"
                >
                  {submitting ? "Scheduling…" : "Book tour"}
                </ParentButton>
              </div>
            </ParentCard>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
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
    <PublicTourStoryShell branding={branding} schoolName={schoolName}>
      <PublicTourExperienceInner
        branding={branding}
        schoolSlug={schoolSlug}
        organizationId={organizationId}
        headline={headline}
        intro={intro}
        fields={fields}
      />
    </PublicTourStoryShell>
  );
}
