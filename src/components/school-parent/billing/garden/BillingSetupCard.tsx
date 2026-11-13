"use client";

import { ArrowRight, Clock3 } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import { GCard, GProgress, G_FOCUS } from "@/components/school-parent/garden/ui";
import type {
  ParentBillingSetupProgress,
  ParentBillingSetupStep,
  ParentBillingSetupStepKey,
} from "@/lib/tuition/parent-billing-setup-steps";

/*
 * "Tuition setup" tracker for the billing rail: a ticked notebook of the
 * steps a family goes through (plan → agreements → payment method → pay).
 * Each open step is a button that runs an existing page action.
 */

function StepMarker({ step, index }: { step: ParentBillingSetupStep; index: number }) {
  if (step.status === "done") {
    return <Tick className="h-7 w-7" color="var(--sf-forest)" fill="var(--sf-mint)" />;
  }
  if (step.status === "waiting") {
    return (
      <span
        aria-hidden="true"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-[var(--sf-ink)]/30 bg-white text-[var(--sf-ink)]/45"
      >
        <Clock3 className="h-3.5 w-3.5" />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[var(--sf-ink)] bg-white text-[13px] font-extrabold text-[var(--sf-ink)]"
    >
      {index + 1}
    </span>
  );
}

const STATUS_SR: Record<ParentBillingSetupStep["status"], string> = {
  done: "Done",
  todo: "To do",
  waiting: "Not ready yet",
};

export default function BillingSetupCard({
  progress,
  onStepAction,
  readOnly = false,
}: {
  progress: ParentBillingSetupProgress;
  onStepAction: (key: ParentBillingSetupStepKey) => void;
  readOnly?: boolean;
}) {
  const { steps, doneCount, totalCount, allDone, currentKey } = progress;

  if (allDone) {
    return (
      <GCard index={2} kicker="Tuition setup" data-testid="parent-billing-setup-card">
        <div className="flex items-center gap-4 rounded-[16px] bg-[var(--sf-mint)] p-4">
          <Tick className="h-11 w-11" color="var(--sf-forest)" />
          <div className="min-w-0">
            <p className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">
              You&apos;re all set for tuition
            </p>
            <p className="m-0 mt-0.5 text-[13px] font-semibold text-[var(--sf-ink)]/70">
              {totalCount} of {totalCount} steps done
            </p>
            <span aria-hidden="true" className="sf-hand mt-1 block text-lg text-[var(--sf-forest)]">
              all squared away ✿
            </span>
          </div>
        </div>
      </GCard>
    );
  }

  return (
    <GCard
      index={2}
      kicker="Tuition setup"
      title={`${doneCount} of ${totalCount} steps done`}
      data-testid="parent-billing-setup-card"
    >
      <GProgress value={doneCount} total={totalCount} label="Tuition setup progress" />
      <ol className="sf-paper -mx-1 mt-4 flex flex-col rounded-xl px-1">
        {steps.map((step, index) => {
          const actionable = step.status === "todo" && !readOnly;
          const current = step.key === currentKey;
          const body = (
            <>
              <StepMarker step={step} index={index} />
              <span className="min-w-0 flex-1">
                <span
                  className={`block text-[15px] font-extrabold leading-snug ${
                    step.status === "done" ? "text-[var(--sf-ink)]/60" : "text-[var(--sf-ink)]"
                  }`}
                >
                  {step.label}
                  <span className="sr-only"> · {STATUS_SR[step.status]}</span>
                </span>
                <span className="mt-0.5 block text-[13px] font-semibold leading-snug text-[var(--sf-soft)]">
                  {step.detail}
                </span>
              </span>
              {actionable ? (
                <span
                  aria-hidden="true"
                  className="inline-flex shrink-0 items-center gap-1 text-[13px] font-extrabold text-[var(--sf-clay-deep)]"
                >
                  Go <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              ) : null}
            </>
          );
          const rowClass = `flex min-h-[56px] w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left ${
            current ? "bg-[var(--sf-accent-wash)]" : ""
          }`;
          return (
            <li key={step.key} aria-current={current ? "step" : undefined}>
              {actionable ? (
                <button
                  type="button"
                  onClick={() => onStepAction(step.key)}
                  className={`group ${rowClass} hover:bg-white/80 ${G_FOCUS} focus-visible:ring-inset`}
                >
                  {body}
                </button>
              ) : (
                <div className={rowClass}>{body}</div>
              )}
            </li>
          );
        })}
      </ol>
    </GCard>
  );
}
