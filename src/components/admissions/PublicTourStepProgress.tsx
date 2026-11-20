"use client";

import { Tick } from "@/components/garden/ui";

export type PublicTourStepId = "schedule" | "details" | "confirmed";

export const PUBLIC_TOUR_STEPS: ReadonlyArray<{ id: PublicTourStepId; label: string }> = [
  { id: "schedule", label: "Pick a time" },
  { id: "details", label: "Your details" },
  { id: "confirmed", label: "Confirmed" },
];

export function publicTourStepIndex(step: PublicTourStepId): number {
  return PUBLIC_TOUR_STEPS.findIndex((s) => s.id === step);
}

type PublicTourStepProgressProps = {
  step: PublicTourStepId;
  /** `row` for phones (under the header), `column` for the desktop rail. */
  orientation?: "row" | "column";
  className?: string;
};

function StepDot({ index, done, active }: { index: number; done: boolean; active: boolean }) {
  if (done) {
    return (
      <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-2 ring-[var(--sf-ink)]">
        <Tick className="h-7 w-7" color="#fff" fill="var(--sf-clay)" />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-extrabold ${
        active
          ? "bg-[var(--sf-clay)] text-white ring-2 ring-[var(--sf-ink)] shadow-[0_2px_0_0_var(--sf-ink)]"
          : "bg-white text-[var(--sf-ink)]/45 ring-[1.5px] ring-[var(--sf-ink)]/20"
      }`}
    >
      {index + 1}
    </span>
  );
}

/** Garden booking steps: Pick a time → Your details → Confirmed. */
export default function PublicTourStepProgress({
  step,
  orientation = "row",
  className = "",
}: PublicTourStepProgressProps) {
  const activeIndex = publicTourStepIndex(step);
  const column = orientation === "column";

  return (
    <nav aria-label="Booking progress" className={className}>
      <ol
        className={`m-0 list-none p-0 ${
          column ? "flex flex-col" : "mx-auto grid max-w-[420px] grid-cols-3"
        }`}
      >
        {PUBLIC_TOUR_STEPS.map((item, index) => {
          const active = index === activeIndex;
          const last = index === PUBLIC_TOUR_STEPS.length - 1;
          // Reaching the last step ("Confirmed") means the whole flow is done.
          const done = index < activeIndex || (active && last);

          return (
            <li
              key={item.id}
              aria-current={active ? "step" : undefined}
              className={
                column
                  ? "relative flex gap-3 pb-5 last:pb-0"
                  : "relative flex flex-col items-center gap-1.5 text-center"
              }
            >
              {column && !last ? (
                <span
                  aria-hidden="true"
                  className={`absolute left-[13px] top-8 bottom-1 w-[2px] rounded-full ${
                    done ? "bg-[var(--sf-clay)]/60" : "bg-[var(--sf-ink)]/12"
                  }`}
                />
              ) : null}
              {!column && !last ? (
                <span
                  aria-hidden="true"
                  className={`absolute left-[calc(50%+22px)] right-[calc(-50%+22px)] top-[13px] h-[2px] rounded-full ${
                    index < activeIndex ? "bg-[var(--sf-clay)]/60" : "bg-[var(--sf-ink)]/12"
                  }`}
                />
              ) : null}
              <StepDot index={index} done={done} active={active} />
              <span
                className={`${column ? "pt-[3px] text-[15px]" : "text-[12.5px] leading-tight"} font-extrabold ${
                  active ? "text-[var(--sf-ink)]" : done ? "text-[var(--sf-ink)]/70" : "text-[var(--sf-ink)]/45"
                }`}
              >
                {item.label}
                <span className="sr-only">{done ? " (done)" : active ? " (current)" : ""}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
