"use client";

import { Mail, Phone } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import SchoolDemoWordmark, {
  type SchoolDemoLogo,
} from "@/components/demo/SchoolDemoWordmark";
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
import {
  Arrow,
  Draw,
  Pill,
  Squiggle,
  Tape,
  Tick,
  btnPop,
} from "@/components/garden/ui";
import { PUBLIC_FORM_HONEYPOT_FIELD } from "@/lib/public-forms/honeypot";
import { mudkitchenDemoContact } from "@/data/school-demos/mudkitchen-demo-contact";
import { formatSelectedDate } from "@/lib/demo-scheduler";
import { detectBrowserTimezone } from "@/lib/marketing/demo-timezone-options";
import { SCHEDULER_TIMEZONE } from "@/lib/demo-scheduler";
import { MUDKITCHEN_MARKETING_GARDEN_THEME } from "@/lib/marketing/mudkitchen-garden-marketing-theme";

/** Booking UI on Garden tokens (cream, forest, clay), not the school's colour. */
const theme = MUDKITCHEN_MARKETING_GARDEN_THEME;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  schoolSlug: string;
  schoolName: string;
  logo: SchoolDemoLogo;
  variant?: "schedule" | "feedback";
}

/** Shared page frame: dotted cream, co-brand chip, pill, headline. */
function ContactPanelPage({
  schoolName,
  logo,
  lead,
  accent,
  subtitle,
  children,
}: {
  schoolName: string;
  logo: SchoolDemoLogo;
  lead: string;
  accent?: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="sf-grid h-full overflow-y-auto bg-[var(--sf-cream)] font-[family-name:var(--font-sf-body)] text-[var(--sf-ink)]">
      <div className="relative mx-auto flex max-w-[780px] flex-col px-5 pb-16 pt-10 sm:px-8 sm:pt-12">
        <div
          className="pointer-events-none absolute right-0 top-24 hidden -rotate-6 text-right xl:block"
          aria-hidden="true"
        >
          <p className="sf-hand text-2xl text-[var(--sf-forest)]">pull up a chair!</p>
          <Draw className="ml-auto mt-1 block w-20 -scale-x-100">
            <Arrow />
          </Draw>
        </div>

        <div className="inline-flex max-w-full items-center gap-3 self-start rounded-full border-2 border-[var(--sf-ink)]/10 bg-white py-1.5 pl-2 pr-4">
          <SchoolDemoWordmark
            logo={logo}
            className="h-8 w-auto max-w-[120px] shrink-0 object-contain"
          />
          <span className="truncate text-xs font-bold text-[var(--sf-soft)]">
            {schoolName}
          </span>
        </div>

        <div className="mt-6">
          <Pill tint="clay">
            <span aria-hidden="true">🌱</span> MudKitchen concept demo
          </Pill>
        </div>
        <h2 className="sf-display mt-4 max-w-[15ch] text-[2.75rem] leading-[0.95] text-[var(--sf-ink)] sm:text-6xl">
          {lead}
          {accent ? (
            <>
              {" "}
              <span className="relative isolate inline-block text-[var(--sf-clay)]">
                <Draw
                  className="pointer-events-none absolute -bottom-2 left-0 -z-10 w-full"
                  delay={0.2}
                >
                  <Squiggle className="h-4 w-full" color="var(--sf-butter)" />
                </Draw>
                {accent}
              </span>
            </>
          ) : null}
        </h2>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--sf-soft)]">
          {subtitle}
        </p>

        <div className="mt-10">{children}</div>

        <ContactDetailsFooter />
      </div>
    </div>
  );
}

/** Notebook-paper card, taped to the wall (mirrors GardenBookDemo). */
function NotebookCard({ children }: { children: ReactNode }) {
  return (
    <div className="sf-paper relative rounded-[32px] border-2 border-[var(--sf-ink)] p-4 shadow-[0_10px_0_0_var(--sf-ink)] sm:p-7">
      <Tape color="var(--sf-peach)" className="-top-3 left-10 w-24 -rotate-6" />
      <Tape color="var(--sf-butter)" className="-top-3 right-10 w-24 rotate-6" />
      {children}
    </div>
  );
}

function SuccessCard({ title, message }: { title: string; message: string }) {
  return (
    <div
      className="rounded-[28px] border-2 border-[var(--sf-ink)] bg-[var(--sf-mint)] px-6 py-9 text-center shadow-[0_8px_0_0_var(--sf-ink)]"
      role="status"
    >
      <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[var(--sf-forest)]">
        <Tick className="h-9 w-9" color="#fff" fill="transparent" />
      </span>
      <h3 className="sf-display text-3xl leading-[1.05] text-[var(--sf-ink)]">
        {title}
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-[var(--sf-ink)]/80">
        {message}
      </p>
    </div>
  );
}

function ContactDetailsFooter() {
  const { contact } = mudkitchenDemoContact;
  const link =
    "group inline-flex items-center gap-3 rounded-full text-[15px] font-extrabold text-[var(--sf-cream)] transition-colors hover:text-[var(--sf-butter)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-butter)]/50";
  const icon =
    "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[var(--sf-forest)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-6 group-focus-visible:-rotate-6";

  return (
    <div className="mt-12 rounded-[28px] bg-[var(--sf-forest)] px-6 py-6 sm:px-7">
      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--sf-butter)]">
        {contact.eyebrow}
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8">
        <a href={`mailto:${contact.email}`} className={link}>
          <span className={icon}>
            <Mail className="h-4 w-4" strokeWidth={2.4} aria-hidden />
          </span>
          {contact.email}
        </a>
        <a href={contact.phoneHref} className={link}>
          <span className={icon}>
            <Phone className="h-4 w-4" strokeWidth={2.4} aria-hidden />
          </span>
          {contact.phone}
          <span className="font-semibold text-[var(--sf-cream)]/75">· text or call</span>
        </a>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-[var(--sf-cream)]/80">
        {contact.blurb}
      </p>
    </div>
  );
}

function DemoContactFeedbackPanel({
  schoolSlug,
  schoolName,
  logo,
}: {
  schoolSlug: string;
  schoolName: string;
  logo: SchoolDemoLogo;
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
    <ContactPanelPage
      schoolName={schoolName}
      logo={logo}
      lead={feedback.heading}
      subtitle={feedback.subheading}
    >
      {submitted ? (
        <SuccessCard title={feedback.successTitle} message={feedback.successMessage} />
      ) : (
        <NotebookCard>
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
          <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
            {submitError ? (
              <p className="mr-auto text-sm font-bold text-[var(--sf-clay-deep)]" role="alert">
                {submitError}
              </p>
            ) : null}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`${btnPop} !px-6 !py-3 disabled:pointer-events-none disabled:opacity-50 ${BUTTON_LOADING_LAYOUT_CLASS}`}
            >
              <ButtonLoadingLabel loading={isSubmitting} loadingLabel="Sending…">
                {feedback.submitLabel}
              </ButtonLoadingLabel>
            </button>
          </div>
        </NotebookCard>
      )}
    </ContactPanelPage>
  );
}

function DemoContactSchedulePanel({
  schoolSlug,
  schoolName,
  logo,
}: {
  schoolSlug: string;
  schoolName: string;
  logo: SchoolDemoLogo;
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
    <ContactPanelPage
      schoolName={schoolName}
      logo={logo}
      lead="Ready for"
      accent="next steps?"
      subtitle={subheading}
    >
      {booking ? (
        <SuccessCard title={form.successTitle} message={successMessage} />
      ) : (
        <NotebookCard>
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
            <p className="mt-3 text-[13px] font-semibold text-[var(--sf-soft)]">
              {form.contactHint}
            </p>
          ) : null}

          <div className="mb-4 mt-8 border-t-2 border-dashed border-[var(--sf-ink)]/15 pt-7">
            <h3 className="sf-display text-[1.75rem] leading-[1.05] text-[var(--sf-ink)]">
              {scheduler.heading}
            </h3>
            <p className="mt-1.5 text-sm font-semibold text-[var(--sf-soft)]">
              {scheduler.subheading}
            </p>
          </div>

          <div>
            {availabilityLoading ? (
              <DemoSchedulerSkeleton appearance="garden" />
            ) : availabilityError ? (
              <div className="flex items-center justify-center px-6 py-24 text-center text-sm font-bold text-[var(--sf-clay-deep)]">
                {availabilityError}
              </div>
            ) : Object.keys(availabilitySlots).length === 0 ? (
              <div className="flex items-center justify-center px-6 py-24 text-center text-sm text-[var(--sf-soft)]">
                No demo times are available right now. Please reach out by email
                or phone below.
              </div>
            ) : (
              <DemoScheduler
                availabilitySlots={availabilitySlots}
                onConfirm={handleScheduled}
                isSubmitting={isSubmitting}
                confirmDisabled={!canBook}
                appearance="garden"
                titleAs="h3"
                displayTimezone={displayTimezone}
                onDisplayTimezoneChange={setDisplayTimezone}
              />
            )}
          </div>

          {submitError ? (
            <p className="mt-3 text-sm font-bold text-[var(--sf-clay-deep)]" role="alert">
              {submitError}
            </p>
          ) : null}
        </NotebookCard>
      )}
    </ContactPanelPage>
  );
}

export default function DemoContactPanel({
  schoolSlug,
  schoolName,
  logo,
  variant = "schedule",
}: Props) {
  if (variant === "feedback") {
    return (
      <DemoContactFeedbackPanel
        schoolSlug={schoolSlug}
        schoolName={schoolName}
        logo={logo}
      />
    );
  }

  return (
    <DemoContactSchedulePanel
      schoolSlug={schoolSlug}
      schoolName={schoolName}
      logo={logo}
    />
  );
}
