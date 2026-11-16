"use client";

import { Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import { JOURNEY_STAGES, type ApplicationJourney } from "../useApplyDashboardModel";

/*
 * Five-stage application journey (Started → Submitted → In review →
 * Accepted → Enrolled). Reached stages are filled; the stage being worked on
 * next pulses softly; enrolled = all forest.
 */
export default function ApplyJourneySteps({ journey }: { journey: ApplicationJourney }) {
  const reduce = useReducedMotion() === true;
  if (journey.kind === "closed") return null;

  const { reached, complete, enrolling } = journey;
  const last = JOURNEY_STAGES.length - 1;
  const nextIndex = complete ? -1 : Math.min(reached + 1, last);
  const currentLabel = complete
    ? "Enrolled"
    : enrolling
      ? "Enrollment in progress"
      : JOURNEY_STAGES[reached];

  return (
    <div className="mt-3">
      <ol
        className="m-0 flex list-none items-center p-0"
        aria-label={`Application progress: step ${reached + 1} of ${JOURNEY_STAGES.length}, ${currentLabel}`}
      >
        {JOURNEY_STAGES.map((stage, i) => {
          const done = i <= reached;
          const next = i === nextIndex;
          const fill = complete
            ? "bg-[var(--sf-forest)] border-[var(--sf-forest)] text-white"
            : done
              ? "bg-[var(--sf-clay)] border-[var(--sf-ink)] text-white"
              : next
                ? "bg-[var(--sf-accent-wash)] border-[var(--sf-clay)] text-[var(--sf-clay-deep)]"
                : "bg-white border-[var(--sf-ink)]/20 text-[var(--sf-ink)]/40";
          return (
            <li key={stage} className="flex min-w-0 flex-1 items-center last:flex-none" aria-current={i === reached ? "step" : undefined}>
              <span className="relative flex shrink-0 items-center justify-center">
                {next && enrolling && !reduce ? (
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-[var(--sf-clay)]/25"
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 1.9, opacity: 0 }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: PORTAL_EASE }}
                  />
                ) : null}
                <span
                  aria-hidden="true"
                  className={`relative flex h-5 w-5 items-center justify-center rounded-full border-[1.5px] text-[10px] font-extrabold ${fill}`}
                >
                  {done ? <Check className="h-3 w-3" strokeWidth={3.2} /> : i + 1}
                </span>
                <span className="sr-only">
                  {stage}: {done ? "done" : next ? "up next" : "not yet"}
                </span>
              </span>
              {i < last ? (
                <span
                  aria-hidden="true"
                  className={`mx-1 h-[2px] flex-1 rounded-full ${
                    i < reached
                      ? complete
                        ? "bg-[var(--sf-forest)]"
                        : "bg-[var(--sf-clay)]"
                      : "bg-[var(--sf-ink)]/12"
                  }`}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
      <div aria-hidden="true" className="mt-1.5 hidden justify-between text-[11px] font-bold text-[var(--sf-soft)] sm:flex">
        {JOURNEY_STAGES.map((stage, i) => (
          <span
            key={stage}
            className={`${i === 0 ? "text-left" : i === last ? "text-right" : "text-center"} ${
              i === reached ? "font-extrabold text-[var(--sf-ink)]" : ""
            }`}
          >
            {stage}
          </span>
        ))}
      </div>
    </div>
  );
}
