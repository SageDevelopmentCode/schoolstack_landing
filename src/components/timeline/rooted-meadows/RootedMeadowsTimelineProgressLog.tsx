"use client";

import { Check } from "lucide-react";
import { FadeInView } from "@/components/ui/FadeInView";
import { ROOTED_MEADOWS_TIMELINE_THEME } from "@/data/school-demos/rooted-meadows-timeline";
import {
  formatProgressEntryDate,
  type OrganizationProgressEntry,
} from "@/lib/organization-progress";

interface Props {
  entries: OrganizationProgressEntry[];
}

export default function RootedMeadowsTimelineProgressLog({ entries }: Props) {
  if (entries.length === 0) return null;

  const accent = {
    bg: ROOTED_MEADOWS_TIMELINE_THEME.purpleStepBg,
    title: ROOTED_MEADOWS_TIMELINE_THEME.purpleStepTitle,
    solid: ROOTED_MEADOWS_TIMELINE_THEME.accent,
  };

  return (
    <section className="px-6 py-10 lg:px-16 lg:py-14">
      <div className="mx-auto max-w-[1100px]">
        <FadeInView>
          <div className="mb-10 text-center lg:text-left">
            <p
              className="font-secondary text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textSecondary }}
            >
              Build progress
            </p>
            <h2
              className="font-heading mt-2 text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-tight"
              style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textPrimary }}
            >
              What we&apos;ve done so far
            </h2>
            <p
              className="font-secondary mx-auto mt-3 max-w-[640px] text-[15px] leading-relaxed lg:mx-0"
              style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textSecondary }}
            >
              A running log of the work we&apos;re doing for Rooted Meadows —
              updated as we go.
            </p>
          </div>
        </FadeInView>

        <div className="relative space-y-5">
          <div
            className="pointer-events-none absolute top-3 bottom-3 hidden sm:block"
            style={{
              left: "11px",
              borderLeft: `1px dashed ${ROOTED_MEADOWS_TIMELINE_THEME.borderStrong}`,
            }}
            aria-hidden
          />

          {entries.map((entry, index) => (
            <FadeInView key={entry.id} delay={index * 0.05}>
              <article
                className="relative rounded-2xl border p-6 sm:ml-8 sm:p-7"
                style={{
                  backgroundColor: "white",
                  borderColor: ROOTED_MEADOWS_TIMELINE_THEME.border,
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
                    style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textPrimary }}
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
                  style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textPrimary }}
                >
                  {entry.title}
                </h3>

                <p
                  className="font-secondary mt-3 text-[15px] leading-relaxed"
                  style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textSecondary }}
                >
                  {entry.summary}
                </p>

                {entry.highlights.length > 0 ? (
                  <ul className="mt-5 space-y-2.5">
                    {entry.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="flex items-start gap-3"
                      >
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
                          style={{
                            color: ROOTED_MEADOWS_TIMELINE_THEME.textPrimary,
                          }}
                        >
                          {highlight}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            </FadeInView>
          ))}
        </div>
      </div>
    </section>
  );
}
