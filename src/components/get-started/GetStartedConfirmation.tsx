import Link from "next/link";
import { ArrowLeft, Check, Video } from "lucide-react";
import { Tick, btnOutline } from "@/components/garden/ui";
import GardenBookingSteps from "@/components/get-started/garden/GardenBookingSteps";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import type { DemoSchedulerBooking } from "@/components/scheduler/DemoScheduler";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { formatSelectedDate, SCHEDULER_TIMEZONE } from "@/lib/demo-scheduler";
import { formatDemoWhenInTimezone } from "@/lib/demo-scheduler-timezone";

const PREP_ITEMS = [
  "Your current enrollment process",
  "How you handle tuition and billing today",
  "How you communicate with families",
] as const;

type GetStartedConfirmationProps = {
  theme: ParentThemeTokens;
  schoolName: string;
  roleLabel: string;
  booking: DemoSchedulerBooking | null;
  headingAs?: "h1" | "h2";
  /** "garden" needs a `.sf-garden` ancestor. */
  appearance?: "story" | "garden";
};

export default function GetStartedConfirmation({
  theme,
  schoolName,
  roleLabel,
  booking,
  headingAs = "h1",
  appearance = "story",
}: GetStartedConfirmationProps) {
  const school = schoolName.trim() || "your school";

  const visitorWhen =
    booking &&
    formatDemoWhenInTimezone(
      booking.date,
      booking.time,
      booking.displayTimezone,
    );
  const canonicalWhen = booking
    ? `${formatSelectedDate(booking.date)} at ${booking.time}`
    : null;
  const showCanonicalSecondary =
    booking && booking.displayTimezone !== SCHEDULER_TIMEZONE;

  if (appearance === "garden") {
    const Heading = headingAs;
    return (
      <div className="text-[var(--sf-ink)]">
        <GardenBookingSteps activeStep={2} />
        <div className="text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border-2 border-[var(--sf-ink)] bg-[var(--sf-forest)] shadow-[0_4px_0_0_var(--sf-ink)]">
            <Tick className="h-11 w-11" color="#fff" fill="transparent" />
          </span>
          <Heading className="sf-display mt-6 text-5xl leading-[0.95] text-[var(--sf-ink)]">
            You&apos;re <span className="text-[var(--sf-clay)]">booked.</span>
          </Heading>
          <p className="sf-hand mt-2 rotate-[-2deg] text-2xl text-[var(--sf-forest)]" aria-hidden="true">
            see you soon!
          </p>
          <p className="mx-auto mt-4 max-w-[44ch] text-lg leading-relaxed text-[var(--sf-soft)]">
            We&apos;ll tailor the session around {school}
            {roleLabel ? ` — ${roleLabel}.` : "."}
          </p>
          <p className="mx-auto mt-2 max-w-[44ch] text-[15px] leading-relaxed text-[var(--sf-soft)]">
            We sent a confirmation to the email you provided.
          </p>
        </div>

        {booking && visitorWhen ? (
          <div className="mx-auto mt-8 max-w-[480px] rounded-[26px] border-2 border-[var(--sf-ink)] bg-[var(--sf-mint)] shadow-[0_6px_0_0_var(--sf-ink)]">
            <div className="px-6 pb-4 pt-5 text-center">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-forest)]">
                Your demo
              </p>
              <p className="sf-display mt-1.5 text-2xl leading-tight">{visitorWhen}</p>
              {showCanonicalSecondary && canonicalWhen ? (
                <p className="mt-1 text-[13px] text-[var(--sf-ink)]/70">
                  {canonicalWhen} <span>Central Time (our scheduling time)</span>
                </p>
              ) : null}
            </div>
            <p className="flex items-center justify-center gap-2 border-t-2 border-dashed border-[var(--sf-ink)]/20 px-6 py-3 text-[13px] font-bold text-[var(--sf-forest)]">
              <Video size={15} aria-hidden />
              20-minute video call
            </p>
          </div>
        ) : null}

        <div className="sf-paper mx-auto mt-8 max-w-[480px] rounded-[24px] border-2 border-[var(--sf-ink)]/15 px-6 py-5">
          <h3 className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]">
            Helpful before the call
          </h3>
          <ul className="mt-3 flex flex-col gap-3">
            {PREP_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[15px] leading-snug">
                <Tick className="h-6 w-6" />
                <span className="pt-0.5">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className={`${btnOutline} !px-6 !py-3 !text-[15px]`}>
            <ArrowLeft size={16} strokeWidth={2.6} aria-hidden />
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="flex justify-center mb-7">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: theme.successBg }}
        >
          <Check size={26} style={{ color: theme.success }} strokeWidth={2.5} />
        </div>
      </div>

      <ParentDisplayHeading
        theme={theme}
        as={headingAs}
        size="display"
        className="mb-4 font-display"
      >
        You&apos;re booked.
      </ParentDisplayHeading>

      <p
        className="mx-auto mb-4 max-w-[44ch] text-[16px] leading-relaxed"
        style={{ color: theme.muted, fontFamily: theme.fontBody }}
      >
        We&apos;ll tailor the session around {school}
        {roleLabel ? ` — ${roleLabel}.` : "."}
      </p>

      <p
        className="mx-auto mb-4 max-w-[44ch] text-[14px] leading-relaxed"
        style={{ color: theme.muted, fontFamily: theme.fontBody }}
      >
        We sent a confirmation to the email you provided.
      </p>

      {booking && visitorWhen ? (
        <div
          className="mb-10 text-[15px] font-semibold"
          style={{ color: theme.ink, fontFamily: theme.fontBody }}
        >
          <p>{visitorWhen}</p>
          {showCanonicalSecondary && canonicalWhen ? (
            <p
              className="mt-1 text-[13px] font-normal"
              style={{ color: theme.muted, fontFamily: theme.fontBody }}
            >
              {canonicalWhen}{" "}
              <span>Central Time (our scheduling time)</span>
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mb-10" />
      )}

      <ParentCard
        theme={theme}
        className="mb-8 text-left !p-7 border-border bg-surface"
      >
        <p
          className="mb-4 text-[11px] font-bold uppercase tracking-[0.12em] text-text-faint"
          style={{ fontFamily: theme.fontBody }}
        >
          Helpful before the call
        </p>
        <ul className="flex flex-col gap-3.5">
          {PREP_ITEMS.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: theme.successBg }}
              >
                <Check size={9} style={{ color: theme.success }} strokeWidth={2.5} />
              </div>
              <span
                className="text-[14px] leading-snug"
                style={{ color: theme.muted, fontFamily: theme.fontBody }}
              >
                {item}
              </span>
            </li>
          ))}
        </ul>
      </ParentCard>

      <Link
        href="/"
        className="text-[13px] font-semibold transition-opacity hover:opacity-80"
        style={{ color: theme.muted, fontFamily: theme.fontBody }}
      >
        ← Back to home
      </Link>
    </div>
  );
}
