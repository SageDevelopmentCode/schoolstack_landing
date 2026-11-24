"use client";

import type { OrganizationProgressEntry } from "@/lib/organization-progress";
import { ILLUSTRATIONS } from "@/components/home-garden/assets";
import PortalGardenHeader from "@/components/mudkitchen-portal/garden/PortalGardenHeader";
import PortalEmptyState from "@/components/mudkitchen-portal/garden/PortalEmptyState";
import PortalReveal from "@/components/mudkitchen-portal/garden/PortalReveal";
import ProgressEntryCard from "@/components/mudkitchen-portal/garden/ProgressEntryCard";
import { phaseTint } from "@/components/mudkitchen-portal/garden/phase-tints";
import { BUILD_LOG_COPY as COPY } from "@/components/mudkitchen-portal/garden/portal-copy";

function PhaseLabel({ entry }: { entry: OrganizationProgressEntry }) {
  return (
    <>
      Phase {entry.phase_number}
      {entry.phase_title ? ` · ${entry.phase_title}` : ""}
    </>
  );
}

export default function MudKitchenBuildLogPage({
  entries,
  schoolName,
}: {
  entries: OrganizationProgressEntry[];
  schoolName: string;
}) {
  const latest = entries[0] ?? null;

  return (
    <>
      <PortalGardenHeader
        width="narrow"
        pill={COPY.pill}
        tint="forest"
        title={COPY.title}
        subtitle={<p>{COPY.subtitle(schoolName)}</p>}
        actions={
          latest ? (
            <ul className="flex flex-wrap gap-2.5" aria-label="At a glance">
              <li className="rounded-full border-2 border-[var(--sf-ink)]/15 bg-[var(--sf-paper)] px-4 py-1.5 text-sm font-extrabold text-[var(--sf-ink)]">
                {COPY.updatesCount(entries.length)}
              </li>
              <li className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--sf-ink)]/15 bg-[var(--sf-paper)] px-4 py-1.5 text-sm font-extrabold text-[var(--sf-ink)]">
                <span className={`h-2.5 w-2.5 rounded-full ring-2 ring-[var(--sf-ink)] ${phaseTint(latest.phase_number).dot}`} aria-hidden="true" />
                <span className="text-[var(--sf-soft)]">{COPY.currentPhase}</span>
                <PhaseLabel entry={latest} />
              </li>
            </ul>
          ) : null
        }
      />

      <div className="mx-auto max-w-[880px] px-6 pb-20 pt-12 sm:px-10 lg:pb-28 lg:pt-14">
        {entries.length === 0 ? (
          <PortalReveal>
            <PortalEmptyState
              illustration={ILLUSTRATIONS.notebook}
              title={COPY.emptyTitle}
              body={<p>{COPY.emptyBody}</p>}
              hand={COPY.emptyHand}
            />
          </PortalReveal>
        ) : (
          <ol className="relative space-y-8">
            {/* The rail: a dashed moss line behind the dots (sm+). */}
            <span
              className="pointer-events-none absolute bottom-6 left-[11px] top-6 hidden border-l-2 border-dashed border-[var(--sf-moss)] sm:block"
              aria-hidden="true"
            />
            {entries.map((entry, index) => {
              const tint = phaseTint(entry.phase_number);
              const previous = entries[index - 1];
              const phaseChanged = !previous || previous.phase_number !== entry.phase_number;

              return (
                <PortalReveal as="li" key={entry.id} delay={Math.min(index, 6) * 0.05} className="relative sm:pl-12">
                  {phaseChanged ? (
                    <p className="mb-3 flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)] sm:-ml-12">
                      <span
                        className={`hidden h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[var(--sf-ink)] text-[11px] tracking-normal text-[var(--sf-ink)] sm:flex ${tint.dot}`}
                        aria-hidden="true"
                      >
                        {entry.phase_number}
                      </span>
                      <span>
                        <PhaseLabel entry={entry} />
                      </span>
                    </p>
                  ) : null}
                  <div className="relative">
                    {/* Dot centred on the rail (rail x = 12px; card starts at 48px). */}
                    <span
                      className={`absolute -left-[43px] top-8 hidden h-3.5 w-3.5 rounded-full border-2 border-[var(--sf-ink)] sm:block ${tint.dot}`}
                      aria-hidden="true"
                    />
                    <ProgressEntryCard entry={entry} headingAs="h2" />
                  </div>
                </PortalReveal>
              );
            })}
          </ol>
        )}
      </div>
    </>
  );
}
