"use client";

import { Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import { G_FOCUS } from "@/components/school-parent/garden/ui";

export type GardenFormStep = {
  key: string;
  label: string;
  /** Short live detail, e.g. "2 of 5 answered". */
  detail?: string;
  done: boolean;
  onSelect?: () => void;
};

/**
 * Signing steps for one form (Journey-stepper style): ticked dots joined by a
 * line, the current step on the accent wash. Steps tick off live and jump to
 * their section when pressed.
 */
export default function GardenFormSteps({ steps, allDone = false }: { steps: GardenFormStep[]; allDone?: boolean }) {
  const reduce = useReducedMotion() === true;
  const currentIndex = steps.findIndex((step) => !step.done);
  const reached = currentIndex === -1 ? steps.length - 1 : currentIndex;
  const pct = steps.length > 1 ? (reached / (steps.length - 1)) * 100 : 0;
  const edge = `${50 / Math.max(1, steps.length)}%`;

  return (
    <nav aria-label="Signing steps" className="relative">
      <div
        aria-hidden="true"
        style={{ "--edge": edge } as React.CSSProperties}
        className="absolute left-[20px] right-[20px] top-[15px] h-[3px] rounded-full bg-[var(--sf-ink)]/10 sm:left-[var(--edge)] sm:right-[var(--edge)]"
      >
        <motion.div
          className={`h-full rounded-full ${allDone ? "bg-[var(--sf-forest)]" : "bg-[var(--sf-clay)]"}`}
          initial={false}
          animate={{ width: `${Math.min(100, pct)}%` }}
          transition={{ duration: reduce ? 0 : 0.45, ease: PORTAL_EASE }}
        />
      </div>
      <ol className="relative m-0 grid list-none p-0" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {steps.map((step, index) => {
          const current = index === currentIndex;
          const state = step.done ? "done" : current ? "current" : "todo";
          const dot = (
            <span
              aria-hidden="true"
              className={`relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-[13px] font-extrabold transition-colors duration-300 ${
                state === "done"
                  ? allDone
                    ? "border-[var(--sf-ink)] bg-[var(--sf-forest)] text-white"
                    : "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white"
                  : state === "current"
                    ? "border-[var(--sf-clay)] bg-white text-[var(--sf-clay-deep)] ring-4 ring-[var(--sf-clay)]/20"
                    : "border-[var(--sf-ink)]/20 bg-white text-[var(--sf-ink)]/45"
              }`}
            >
              {state === "done" ? <Check className="h-4 w-4" strokeWidth={3} /> : index + 1}
            </span>
          );
          const text = (
            <span className="mt-1.5 flex min-w-0 flex-col items-start sm:items-center">
              <span
                className={`max-w-full truncate text-[12px] font-extrabold sm:text-[13px] ${
                  state === "todo" ? "text-[var(--sf-ink)]/50" : "text-[var(--sf-ink)]"
                }`}
              >
                {step.label}
              </span>
              {step.detail ? (
                <span className="hidden max-w-full truncate text-[11px] font-bold text-[var(--sf-soft)] sm:block">{step.detail}</span>
              ) : null}
            </span>
          );
          const srState = state === "done" ? "done" : state === "current" ? "current step" : "not started";
          const align = index === 0 ? "items-start sm:items-center" : index === steps.length - 1 ? "items-end sm:items-center" : "items-center";
          return (
            <li key={step.key} className={`flex min-w-0 flex-col ${align}`} aria-current={current ? "step" : undefined}>
              {step.onSelect ? (
                <button
                  type="button"
                  onClick={step.onSelect}
                  className={`flex min-w-0 max-w-full flex-col rounded-xl px-1 pb-1 ${align} ${G_FOCUS}`}
                >
                  {dot}
                  {text}
                  <span className="sr-only">({srState})</span>
                </button>
              ) : (
                <div className={`flex min-w-0 max-w-full flex-col px-1 pb-1 ${align}`}>
                  {dot}
                  {text}
                  <span className="sr-only">({srState})</span>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
