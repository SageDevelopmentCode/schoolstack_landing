"use client";

import { Check, Mail, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import SchoolDemoWordmark, {
  type SchoolDemoLogo,
} from "@/components/demo/SchoolDemoWordmark";
import GetStartedStoryHeader from "@/components/get-started/GetStartedStoryHeader";
import GetStartedStoryTextField, {
  GetStartedIntroTextArea,
} from "@/components/get-started/GetStartedStoryTextField";
import {
  DemoScheduler,
  type DemoSchedulerBooking,
} from "@/components/scheduler/DemoScheduler";
import { DemoSchedulerSkeleton } from "@/components/scheduler/DemoSchedulerSkeleton";
import ButtonLoadingLabel, {
  BUTTON_LOADING_LAYOUT_CLASS,
} from "@/components/ui/ButtonLoadingLabel";
import PublicFormHoneypotField from "@/components/public-forms/PublicFormHoneypotField";
import { PUBLIC_FORM_HONEYPOT_FIELD } from "@/lib/public-forms/honeypot";
import { mudkitchenDemoContact } from "@/data/school-demos/mudkitchen-demo-contact";
import { formatSelectedDate } from "@/lib/demo-scheduler";
import { detectBrowserTimezone } from "@/lib/marketing/demo-timezone-options";
import { SCHEDULER_TIMEZONE } from "@/lib/demo-scheduler";
import { ACCENT_HIGHLIGHT, DARK_PILL } from "@/components/home/bright-styles";
import { MUDKITCHEN_MARKETING_BRIGHT_THEME } from "@/lib/marketing/mudkitchen-bright-marketing-theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  schoolSlug: string;
  schoolName: string;
  logo: SchoolDemoLogo;
  variant?: "schedule" | "feedback";
  theme?: ParentThemeTokens;
}

function ContactDetailsFooter() {
  const { contact } = mudkitchenDemoContact;
  const theme = MUDKITCHEN_MARKETING_BRIGHT_THEME;

  return (
    <div className="mt-8 rounded-[24px] bg-[#F4F1EC] px-5 py-5 ring-1 ring-black/[0.06]">
      <p
        className="font-secondary text-[11px] font-semibold uppercase tracking-widest text-[#1d1a16]/50"
        style={{ fontFamily: theme.fontBody }}
      >
        {contact.eyebrow}
      </p>
      <a
        href={`mailto:${contact.email}`}
        className="font-secondary mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#1d1a16] transition-colors hover:text-clay"
      >
        <Mail className="h-4 w-4 shrink-0" aria-hidden />
        {contact.email}
      </a>
      <a
        href={contact.phoneHref}
        className="font-secondary mt-2 flex items-center gap-2 text-sm font-semibold text-[#1d1a16] transition-colors hover:text-clay"
      >
        <Phone className="h-4 w-4 shrink-0" aria-hidden />
        {contact.phone}
        <span className="font-normal text-[#1d1a16]/60">· text or call</span>
      </a>
      <p className="font-secondary mt-2 text-xs text-[#1d1a16]/60">{contact.blurb}</p>
    </div>
  );
}

function DemoContactFeedbackPanel({
  schoolSlug,
  schoolName,
  logo,
  theme,
}: {
  schoolSlug: string;
  schoolName: string;
  logo: SchoolDemoLogo;
  theme: ParentThemeTokens;
}) {
  const { feedback } = mudkitchenDemoContact;
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [companyWebsite, setCompanyWebsite] = useState("");

  const canSubmit = comment.trim().length > 0 && !isSubmitting;

  async function handleSubmit() {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/demo-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolSlug,
          schoolName,
          message: comment.trim(),
          [PUBLIC_FORM_HONEYPOT_FIELD]: companyWebsite,
        }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
      setComment("");
      setCompanyWebsite("");
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="mx-auto flex max-w-[760px] flex-col px-5 py-10 sm:px-8 sm:py-12">
        <div className="mb-6 flex items-center gap-3">
          <SchoolDemoWordmark
            logo={logo}
            className="h-10 w-auto shrink-0 object-contain"
          />
        </div>

        <GetStartedStoryHeader
          kicker="MudKitchen concept demo"
          title={feedback.heading}
          subtitle={feedback.subheading}
        />

        {submitted ? (
          <div className="rounded-[28px] bg-white px-6 py-8 text-center ring-1 ring-black/10">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1d1a16] text-white">
              <Check className="h-6 w-6" aria-hidden />
            </div>
            <h3 className="font-secondary text-lg font-bold text-[#1d1a16]">
              {feedback.successTitle}
            </h3>
            <p className="font-secondary mt-2 text-sm text-[#1d1a16]/70">
              {feedback.successMessage}
            </p>
          </div>
        ) : (
          <div className="relative rounded-[28px] bg-white p-5 ring-1 ring-black/10 sm:p-6">
            <PublicFormHoneypotField
              value={companyWebsite}
              onChange={setCompanyWebsite}
            />
            <GetStartedIntroTextArea
              theme={theme}
              label="Questions or comments"
              value={comment}
              onChange={setComment}
              placeholder={feedback.inputPlaceholder}
            />
            <div className="mt-4 flex items-center justify-end gap-3">
              {submitError ? (
                <p className="font-secondary mr-auto text-sm text-clay">
                  {submitError}
                </p>
              ) : null}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`${DARK_PILL} disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_LOADING_LAYOUT_CLASS}`}
              >
                <ButtonLoadingLabel loading={isSubmitting} loadingLabel="Sending…">
                  {feedback.submitLabel}
                </ButtonLoadingLabel>
              </button>
            </div>
          </div>
        )}

        <ContactDetailsFooter />
      </div>
    </div>
  );
}

function DemoContactSchedulePanel({
  schoolSlug,
  schoolName,
  logo,
  theme,
}: {
  schoolSlug: string;
  schoolName: string;
  logo: SchoolDemoLogo;
  theme: ParentThemeTokens;
}) {
  const { subheading, scheduler, form } = mudkitchenDemoContact;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [booking, setBooking] = useState<DemoSchedulerBooking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [availabilitySlots, setAvailabilitySlots] = useState<Record<string, string[]>>({});
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [displayTimezone, setDisplayTimezone] = useState(() =>
    detectBrowserTimezone(SCHEDULER_TIMEZONE),
  );

  const canBook =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    EMAIL_RE.test(email.trim());

  useEffect(() => {
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
  }, []);

  const handleScheduled = async (selected: DemoSchedulerBooking) => {
    if (isSubmitting || !canBook) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/demo-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          schoolName,
          conceptDemoSlug: schoolSlug,
          role: "other",
          priorities: ["full"],
          prepNotes: `Booked from school concept demo walkthrough (${schoolSlug}).`,
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
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const successMessage = booking
    ? form.successMessage
        .replace("{date}", formatSelectedDate(booking.date))
        .replace("{time}", booking.time)
    : form.successMessage;

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="mx-auto flex max-w-[760px] flex-col px-5 py-10 sm:px-8 sm:py-12">
        <div className="mb-2 flex items-center gap-3">
          <SchoolDemoWordmark
            logo={logo}
            className="h-10 w-auto shrink-0 object-contain"
          />
          <p className="font-secondary text-xs text-[#1d1a16]/50">{schoolName}</p>
        </div>

        <GetStartedStoryHeader
          kicker="MudKitchen concept demo"
          title={
            <>
              Ready for <span className={ACCENT_HIGHLIGHT}>next steps?</span>
            </>
          }
          subtitle={subheading}
        />

        {booking ? (
          <div className="rounded-[28px] bg-white px-6 py-8 text-center ring-1 ring-black/10">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1d1a16] text-white">
              <Check className="h-6 w-6" aria-hidden />
            </div>
            <h3 className="font-secondary text-lg font-bold text-[#1d1a16]">
              {form.successTitle}
            </h3>
            <p className="font-secondary mt-2 text-sm text-[#1d1a16]/70">
              {successMessage}
            </p>
          </div>
        ) : (
          <>
            <div className="relative mb-6 rounded-[28px] bg-white p-5 ring-1 ring-black/10 sm:p-6">
              <PublicFormHoneypotField
                value={companyWebsite}
                onChange={setCompanyWebsite}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <GetStartedStoryTextField
                  theme={theme}
                  variant="intro"
                  id="concept-demo-name"
                  label={form.nameLabel}
                  value={name}
                  onChange={setName}
                  placeholder={form.namePlaceholder}
                  autoComplete="name"
                />
                <GetStartedStoryTextField
                  theme={theme}
                  variant="intro"
                  id="concept-demo-email"
                  label={form.emailLabel}
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder={form.emailPlaceholder}
                  autoComplete="email"
                />
              </div>
              {!canBook ? (
                <p className="font-secondary mt-3 text-xs text-[#1d1a16]/55">
                  {form.contactHint}
                </p>
              ) : null}
            </div>

            <div className="mb-4">
              <h3 className="font-secondary text-base font-bold text-[#1d1a16]">
                {scheduler.heading}
              </h3>
              <p className="font-secondary mt-1 text-xs text-[#1d1a16]/60">
                {scheduler.subheading}
              </p>
            </div>

            <div className="overflow-hidden rounded-[28px] ring-1 ring-black/10">
              {availabilityLoading ? (
                <DemoSchedulerSkeleton storyTheme={theme} />
              ) : availabilityError ? (
                <div className="font-secondary flex items-center justify-center py-24 text-sm text-clay">
                  {availabilityError}
                </div>
              ) : Object.keys(availabilitySlots).length === 0 ? (
                <div className="font-secondary flex items-center justify-center py-24 text-sm text-[#1d1a16]/70">
                  No demo times are available right now. Please reach out by email
                  or phone below.
                </div>
              ) : (
                <DemoScheduler
                  availabilitySlots={availabilitySlots}
                  onConfirm={handleScheduled}
                  isSubmitting={isSubmitting}
                  confirmDisabled={!canBook}
                  storyTheme={theme}
                  displayTimezone={displayTimezone}
                  onDisplayTimezoneChange={setDisplayTimezone}
                />
              )}
            </div>

            {submitError ? (
              <p className="font-secondary mt-3 text-sm text-clay">{submitError}</p>
            ) : null}
          </>
        )}

        <ContactDetailsFooter />
      </div>
    </div>
  );
}

export default function DemoContactPanel({
  schoolSlug,
  schoolName,
  logo,
  variant = "schedule",
  theme: themeProp,
}: Props) {
  const theme = themeProp ?? MUDKITCHEN_MARKETING_BRIGHT_THEME;

  if (variant === "feedback") {
    return (
      <DemoContactFeedbackPanel
        schoolSlug={schoolSlug}
        schoolName={schoolName}
        logo={logo}
        theme={theme}
      />
    );
  }

  return (
    <DemoContactSchedulePanel
      schoolSlug={schoolSlug}
      schoolName={schoolName}
      logo={logo}
      theme={theme}
    />
  );
}
