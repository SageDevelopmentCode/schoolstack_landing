"use client";

import { useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { G_FOCUS } from "@/components/school-parent/garden/ui";

export type FlowStageStatus = "done" | "todo" | "warning" | "none";

export type FlowStageStepperItem<T extends string> = {
  id: T;
  label: string;
  status: FlowStageStatus;
};

/**
 * Numbered stage bar for the flow builders. Free navigation: every stage is a
 * button. The current stage is raised in the accent; done stages get a forest
 * check; stages with a publish problem get an amber dot ("Needs a fix").
 * Below `md` it scrolls inside its own container and only the current stage
 * keeps its label.
 */
export function FlowStageStepper<T extends string>({
  stages,
  current,
  onSelect,
  label = "Form builder stages",
}: {
  stages: readonly FlowStageStepperItem<T>[];
  current: T;
  onSelect: (stage: T) => void;
  label?: string;
}) {
  const listRef = useRef<HTMLOListElement>(null);

  // Keep the current stage visible when the bar scrolls (phones).
  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!list || !active) return;
    const left = active.offsetLeft - list.offsetLeft;
    if (left < list.scrollLeft || left + active.offsetWidth > list.scrollLeft + list.clientWidth) {
      list.scrollTo({ left: Math.max(0, left - 16), behavior: "smooth" });
    }
  }, [current]);

  return (
    <nav
      aria-label={label}
      className="shrink-0 border-b-[1.5px] border-dashed border-[var(--sf-ink)]/15 bg-white"
      data-testid="flow-stage-stepper"
    >
      <ol
        ref={listRef}
        className="m-0 flex list-none items-center gap-1 overflow-x-auto px-3 py-2.5 [scrollbar-width:none] sm:px-4 [&::-webkit-scrollbar]:hidden"
      >
        {stages.map((stage, index) => {
          const isCurrent = stage.id === current;
          const isDone = stage.status === "done";
          const needsFix = stage.status === "todo";
          const hasWarning = stage.status === "warning";
          return (
            <li key={stage.id} className="flex shrink-0 items-center gap-1">
              {index > 0 ? (
                <span
                  aria-hidden
                  className="hidden h-[2px] w-4 rounded-full bg-[var(--sf-ink)]/12 md:block lg:w-7"
                />
              ) : null}
              <button
                type="button"
                onClick={() => onSelect(stage.id)}
                aria-current={isCurrent ? "step" : undefined}
                data-testid={`flow-stage-${stage.id}`}
                className={`group inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-[13px] font-extrabold transition-colors ${
                  isCurrent
                    ? "bg-[var(--sf-accent-wash)] text-[var(--sf-ink)] ring-[1.5px] ring-[var(--sf-clay)]/35"
                    : "text-[var(--sf-ink)]/65 hover:bg-[var(--sf-ink)]/[0.04] hover:text-[var(--sf-ink)]"
                } ${G_FOCUS}`}
              >
                <span
                  aria-hidden
                  className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[12px] tabular-nums ${
                    isCurrent
                      ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white shadow-[0_2px_0_0_var(--sf-ink)]"
                      : isDone
                        ? "border-[var(--sf-forest)] bg-[var(--sf-forest)] text-white"
                        : "border-[var(--sf-ink)]/25 bg-white text-[var(--sf-ink)]/60"
                  }`}
                >
                  {isDone && !isCurrent ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : index + 1}
                  {needsFix || hasWarning ? (
                    <span
                      className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${
                        needsFix ? "bg-[#d9a400]" : "bg-[var(--sf-butter)]"
                      }`}
                    />
                  ) : null}
                </span>
                <span className={isCurrent ? "whitespace-nowrap" : "sr-only whitespace-nowrap md:not-sr-only"}>
                  {stage.label}
                </span>
                {needsFix ? <span className="sr-only">(needs a fix)</span> : null}
                {isDone ? <span className="sr-only">(done)</span> : null}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
