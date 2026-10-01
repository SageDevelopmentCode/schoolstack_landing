import Link from "next/link";
import { Check } from "lucide-react";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { formatSelectedDate } from "@/lib/demo-scheduler";

const PREP_ITEMS = [
  "Your current enrollment process",
  "How you handle tuition and billing today",
  "How you communicate with families",
] as const;

type GetStartedConfirmationProps = {
  theme: ParentThemeTokens;
  schoolName: string;
  roleLabel: string;
  booking: { date: string; time: string } | null;
};

export default function GetStartedConfirmation({
  theme,
  schoolName,
  roleLabel,
  booking,
}: GetStartedConfirmationProps) {
  const school = schoolName.trim() || "your school";

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
        as="h1"
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

      {booking ? (
        <p
          className="mb-10 text-[15px] font-semibold"
          style={{ color: theme.ink, fontFamily: theme.fontBody }}
        >
          {formatSelectedDate(booking.date)} at {booking.time}{" "}
          <span style={{ color: theme.muted, fontWeight: 400 }}>Central (CT)</span>
        </p>
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
