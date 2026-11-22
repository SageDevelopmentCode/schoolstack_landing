import { Tick } from "@/components/garden/ui";
import {
  formatProgressEntryDate,
  type OrganizationProgressEntry,
} from "@/lib/organization-progress";
import { phaseTint } from "./phase-tints";

/** One build-log entry as a paper card. Data, so no tilt. */
export default function ProgressEntryCard({
  entry,
  headingAs: Heading = "h2",
}: {
  entry: OrganizationProgressEntry;
  headingAs?: "h2" | "h3";
}) {
  const tint = phaseTint(entry.phase_number);

  return (
    <article className="rounded-[26px] border-2 border-[var(--sf-ink)] bg-[var(--sf-paper)] p-6 shadow-[0_5px_0_0_var(--sf-ink)] sm:p-8">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <time
          className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]"
          dateTime={entry.entry_date}
        >
          {formatProgressEntryDate(entry.entry_date)}
        </time>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${tint.pill}`}>
          <span>Phase {entry.phase_number}</span>
          {entry.phase_title ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{entry.phase_title}</span>
            </>
          ) : null}
        </span>
      </div>

      <Heading className="sf-display mt-4 text-[1.75rem] leading-[1.05] text-[var(--sf-ink)] sm:text-3xl">
        {entry.title}
      </Heading>

      {entry.summary ? (
        <p className="mt-3 text-[16px] leading-relaxed text-[var(--sf-ink)]/80">{entry.summary}</p>
      ) : null}

      {entry.highlights.length > 0 ? (
        <ul className="mt-5 space-y-2.5">
          {entry.highlights.map((highlight) => (
            <li key={highlight} className="flex items-start gap-3">
              <Tick className="mt-0.5 h-6 w-6" color={tint.tickStroke} fill={tint.tickFill} />
              <span className="text-[15px] leading-relaxed text-[var(--sf-ink)]/85">{highlight}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
