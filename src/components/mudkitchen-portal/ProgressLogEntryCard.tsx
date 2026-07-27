"use client";

import { Check } from "lucide-react";
import { FadeInView } from "@/components/ui/FadeInView";
import { usePortalTheme } from "@/components/mudkitchen-portal/PortalThemeProvider";
import {
  formatProgressEntryDate,
  type OrganizationProgressEntry,
} from "@/lib/organization-progress";
import { phaseAccentByNumber } from "@/lib/mudkitchen-portal/theme";

type ProgressLogEntryCardProps = {
  entry: OrganizationProgressEntry;
  delay?: number;
  showConnector?: boolean;
};

export default function ProgressLogEntryCard({
  entry,
  delay = 0,
  showConnector = true,
}: ProgressLogEntryCardProps) {
  const T = usePortalTheme();
  const accent = phaseAccentByNumber(entry.phase_number);

  return (
    <FadeInView delay={delay}>
      <article
        className={`relative rounded-2xl border p-6 sm:p-7 ${showConnector ? "sm:ml-8" : ""}`}
        style={{
          backgroundColor: T.surface,
          borderColor: T.border,
        }}
      >
        {showConnector ? (
          <span
            className="absolute top-7 hidden h-3 w-3 -translate-x-[calc(2rem+5px)] rounded-full sm:block"
            style={{
              left: 0,
              backgroundColor: accent.solid,
              boxShadow: `0 0 0 4px ${accent.bg}`,
            }}
            aria-hidden
          />
        ) : null}

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
    </FadeInView>
  );
}
