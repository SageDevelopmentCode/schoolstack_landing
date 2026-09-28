"use client";

import { useParentTheme } from "@/components/school-parent/ParentThemeContext";

export type PublicTourStepId = "schedule" | "details" | "confirmed";

const STEPS: ReadonlyArray<{ id: PublicTourStepId; label: string }> = [
  { id: "schedule", label: "Pick a time" },
  { id: "details", label: "Your details" },
  { id: "confirmed", label: "Confirmed" },
];

type PublicTourStepProgressProps = {
  step: PublicTourStepId;
};

function stepIndex(step: PublicTourStepId): number {
  return STEPS.findIndex((s) => s.id === step);
}

export default function PublicTourStepProgress({ step }: PublicTourStepProgressProps) {
  const { theme } = useParentTheme();
  const activeIndex = stepIndex(step);

  return (
    <nav
      className="mb-6 sm:mb-8"
      aria-label="Booking progress"
    >
      <ol className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {STEPS.map((item, index) => {
          const isActive = index === activeIndex;
          const isComplete = index < activeIndex;

          return (
            <li key={item.id} className="flex items-center gap-2 sm:gap-3">
              {index > 0 ? (
                <span
                  className="hidden h-px w-4 sm:block sm:w-6"
                  style={{
                    backgroundColor: isComplete ? theme.primaryLight : theme.line,
                  }}
                  aria-hidden
                />
              ) : null}
              <span
                className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-bold sm:px-3 sm:py-1.5 sm:text-xs"
                style={{
                  borderColor: isActive ? theme.primary : theme.line,
                  backgroundColor: isActive
                    ? theme.primarySoft
                    : isComplete
                      ? theme.white
                      : theme.white,
                  color: isActive || isComplete ? theme.primaryDark : theme.muted,
                }}
                aria-current={isActive ? "step" : undefined}
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold"
                  style={{
                    backgroundColor: isActive
                      ? theme.primary
                      : isComplete
                        ? theme.primaryLight
                        : theme.line,
                    color: isActive || isComplete ? theme.white : theme.muted,
                  }}
                >
                  {index + 1}
                </span>
                <span className="whitespace-nowrap">{item.label}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
