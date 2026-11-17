import { Tick } from "@/components/garden/ui";
import { DEMO_INTRO_FORM_COPY } from "@/lib/marketing/demo-intro-form-copy";

type StepState = "done" | "current" | "upcoming";

const DOT: Record<StepState, string> = {
  done: "bg-[var(--sf-forest)] text-white",
  current:
    "border-2 border-[var(--sf-ink)] bg-[var(--sf-butter)] text-[var(--sf-ink)] shadow-[0_3px_0_0_var(--sf-ink)]",
  upcoming: "bg-[var(--sf-paper)] text-[var(--sf-ink)]/55 ring-2 ring-inset ring-[var(--sf-ink)]/15",
};

const LABEL: Record<StepState, string> = {
  done: "font-extrabold text-[var(--sf-forest)]",
  current: "font-extrabold text-[var(--sf-ink)]",
  upcoming: "font-bold text-[var(--sf-soft)]",
};

/**
 * Your school → Choose a time → All together, for the Garden book-a-demo flow.
 * Needs a `.sf-garden` ancestor.
 */
export default function GardenBookingSteps({
  activeStep,
  className = "mb-8",
}: {
  activeStep: 0 | 1 | 2;
  className?: string;
}) {
  const steps = DEMO_INTRO_FORM_COPY.steps;
  return (
    <nav aria-label="Booking progress" className={className}>
      <ol className="flex flex-wrap items-center gap-2.5">
        {steps.map((step, index) => {
          const state: StepState =
            step.id < activeStep ? "done" : step.id === activeStep ? "current" : "upcoming";
          return (
            <li key={step.id} className="flex items-center gap-2.5">
              {index > 0 ? (
                <span
                  className={
                    step.id <= activeStep
                      ? "h-0.5 w-6 rounded-full bg-[var(--sf-forest)] sm:w-10"
                      : "w-6 border-t-2 border-dashed border-[var(--sf-ink)]/20 sm:w-10"
                  }
                  aria-hidden
                />
              ) : null}
              <span
                className="flex items-center gap-2 text-[13px]"
                aria-current={state === "current" ? "step" : undefined}
              >
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-extrabold ${DOT[state]}`}
                >
                  {state === "done" ? (
                    <Tick className="h-5 w-5" color="#fff" fill="transparent" />
                  ) : (
                    step.id + 1
                  )}
                </span>
                <span className={`${LABEL[state]} ${state === "current" ? "" : "max-sm:sr-only"}`}>
                  {step.label}
                  {state === "done" ? <span className="sr-only"> (done)</span> : null}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
