"use client";

import { Tick } from "@/components/garden/ui";
import { JOIN_STEPS } from "./committee-garden-shared";

/**
 * Numbered "how joining works" steps (recipe: numbered steps with the current
 * step on the accent wash). Steps before `current` show a tick; `current` equal
 * to the step count means the whole journey is done.
 */
export default function GardenCommitteeSteps({
  current,
  compact = false,
  label = "How joining a committee works",
}: {
  current: number;
  compact?: boolean;
  label?: string;
}) {
  return (
    <ol className="m-0 list-none space-y-2 p-0" aria-label={label}>
      {JOIN_STEPS.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li
            key={step.title}
            aria-current={active ? "step" : undefined}
            className={`flex items-start gap-3 rounded-[16px] border-[1.5px] ${compact ? "p-3" : "p-3.5"} transition-colors duration-300 ${
              active
                ? "border-[var(--sf-clay)]/35 bg-[var(--sf-accent-wash)]"
                : done
                  ? "border-[var(--sf-ink)]/8 bg-[var(--sf-paper)]"
                  : "border-[var(--sf-ink)]/10 bg-white"
            }`}
          >
            {done ? (
              <Tick className="h-7 w-7" color="var(--sf-forest)" fill="var(--sf-mint)" />
            ) : (
              <span
                aria-hidden="true"
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[var(--sf-ink)] text-[13px] font-extrabold ${
                  active ? "bg-[var(--sf-clay)] text-white" : "bg-white text-[var(--sf-ink)]"
                }`}
              >
                {index + 1}
              </span>
            )}
            <span className="min-w-0">
              <span
                className={`block text-[14.5px] font-extrabold leading-snug ${
                  done ? "text-[var(--sf-ink)]/60" : "text-[var(--sf-ink)]"
                }`}
              >
                <span className="sr-only">
                  {done ? "Done: " : active ? "Current step: " : `Step ${index + 1}: `}
                </span>
                {step.title}
              </span>
              {!compact || active ? (
                <span className="mt-0.5 block text-[13px] font-semibold leading-snug text-[var(--sf-soft)]">
                  {step.body}
                </span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
