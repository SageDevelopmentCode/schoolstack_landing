import Link from "next/link";
import { Check } from "lucide-react";
import {
  formatProgressEntryDate,
  type OrganizationProgressEntry,
} from "@/lib/organization-progress";
import {
  MUDKITCHEN_PORTAL_THEME,
  phaseAccentByNumber,
} from "@/lib/mudkitchen-portal/theme";

type OrganizationProgressLogListProps = {
  entries: OrganizationProgressEntry[];
  schoolName: string;
  showHeader?: boolean;
  compact?: boolean;
};

export default function OrganizationProgressLogList({
  entries,
  schoolName,
  showHeader = true,
  compact = false,
}: OrganizationProgressLogListProps) {
  const T = MUDKITCHEN_PORTAL_THEME;

  if (entries.length === 0) {
    return (
      <div
        className="rounded-2xl border px-6 py-10 text-center"
        style={{
          backgroundColor: T.surface,
          borderColor: T.border,
        }}
      >
        <p className="font-secondary text-[15px]" style={{ color: T.textSecondary }}>
          No build updates yet. Check back soon — we&apos;ll post progress here as
          we work on your MudKitchen setup.
        </p>
      </div>
    );
  }

  return (
    <section className={compact ? "" : "pb-4"}>
      {showHeader ? (
        <div className="mb-8">
          <p
            className="font-secondary text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: T.textSecondary }}
          >
            Build progress
          </p>
          <h2
            className="font-heading mt-2 text-[clamp(1.75rem,3vw,2.25rem)] font-medium leading-tight"
            style={{ color: T.textPrimary }}
          >
            What we&apos;ve done so far
          </h2>
          <p
            className="font-secondary mt-3 max-w-[640px] text-[15px] leading-relaxed"
            style={{ color: T.textSecondary }}
          >
            A running log of the work we&apos;re doing for {schoolName} — updated as
            we go.
          </p>
        </div>
      ) : null}

      <div className="relative space-y-5">
        <div
          className="pointer-events-none absolute top-3 bottom-3 hidden sm:block"
          style={{
            left: "11px",
            borderLeft: `1px dashed ${T.borderStrong}`,
          }}
          aria-hidden
        />

        {entries.map((entry) => {
          const accent = phaseAccentByNumber(entry.phase_number);

          return (
            <article
              key={entry.id}
              className="relative rounded-2xl border p-6 sm:ml-8 sm:p-7"
              style={{
                backgroundColor: T.surface,
                borderColor: T.border,
              }}
            >
              <span
                className="absolute top-7 hidden h-3 w-3 -translate-x-[calc(2rem+5px)] rounded-full sm:block"
                style={{
                  left: 0,
                  backgroundColor: accent.solid,
                  boxShadow: `0 0 0 4px ${accent.bg}`,
                }}
                aria-hidden
              />

              <div className="mb-4 flex flex-wrap items-center gap-2.5">
                <time
                  className="font-secondary text-[13px] font-semibold"
                  style={{ color: T.textPrimary }}
                  dateTime={entry.entry_date}
                >
                  {formatProgressEntryDate(entry.entry_date)}
                </time>
                <span
                  className="font-secondary inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white"
                  style={{ backgroundColor: accent.solid }}
                >
                  Phase {entry.phase_number}
                </span>
                <span
                  className="font-secondary rounded-full px-3 py-1 text-[11px] font-medium"
                  style={{
                    color: accent.title,
                    backgroundColor: accent.bg,
                  }}
                >
                  {entry.phase_title}
                </span>
              </div>

              <h3
                className="font-heading text-[1.35rem] font-medium leading-snug sm:text-[1.5rem]"
                style={{ color: T.textPrimary }}
              >
                {entry.title}
              </h3>

              <p
                className="font-secondary mt-3 text-[15px] leading-relaxed"
                style={{ color: T.textSecondary }}
              >
                {entry.summary}
              </p>

              {entry.highlights.length > 0 ? (
                <ul className="mt-5 space-y-2.5">
                  {entry.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-3">
                      <div
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: accent.bg,
                          border: `1px solid ${accent.solid}33`,
                        }}
                      >
                        <Check
                          size={11}
                          strokeWidth={2.5}
                          style={{ color: accent.solid }}
                        />
                      </div>
                      <span
                        className="font-secondary text-[14px] leading-relaxed"
                        style={{ color: T.textPrimary }}
                      >
                        {highlight}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function OrganizationProgressLogPreview({
  entry,
  schoolName,
  viewAllHref,
}: {
  entry: OrganizationProgressEntry;
  schoolName: string;
  viewAllHref: string;
}) {
  const T = MUDKITCHEN_PORTAL_THEME;
  const accent = phaseAccentByNumber(entry.phase_number);

  return (
    <div
      className="rounded-2xl border p-6"
      style={{ backgroundColor: T.surface, borderColor: T.border }}
    >
      <p
        className="font-secondary text-[11px] font-semibold uppercase tracking-widest"
        style={{ color: T.textSecondary }}
      >
        Latest build update
      </p>
      <h3
        className="font-heading mt-2 text-xl font-medium"
        style={{ color: T.textPrimary }}
      >
        {entry.title}
      </h3>
      <p
        className="font-secondary mt-2 text-sm leading-relaxed"
        style={{ color: T.textSecondary }}
      >
        {formatProgressEntryDate(entry.entry_date)} · Phase {entry.phase_number}{" "}
        · {entry.phase_title}
      </p>
      <p
        className="font-secondary mt-3 line-clamp-3 text-[15px] leading-relaxed"
        style={{ color: T.textSecondary }}
      >
        {entry.summary}
      </p>
      <Link
        href={viewAllHref}
        className="mt-4 inline-flex text-sm font-semibold"
        style={{ color: accent.solid }}
      >
        View full build log →
      </Link>
    </div>
  );
}
