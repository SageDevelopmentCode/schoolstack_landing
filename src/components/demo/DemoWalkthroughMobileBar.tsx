"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import DemoWalkthroughMobileSheet from "@/components/demo/DemoWalkthroughMobileSheet";
import type { DemoWalkthroughStep } from "@/data/school-demos/walkthrough-placeholder";
import type { SchoolDemoLogo } from "@/components/demo/SchoolDemoWordmark";

interface Props {
  schoolName: string;
  schoolLogo: SchoolDemoLogo;
  steps: DemoWalkthroughStep[];
  activeStep: number;
  onStepSelect: (index: number) => void;
}

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30";

export default function DemoWalkthroughMobileBar({
  schoolName,
  schoolLogo,
  steps,
  activeStep,
  onStepSelect,
}: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const step = steps[activeStep];
  const total = steps.length;
  const canPrev = activeStep > 0;
  const canNext = activeStep < total - 1;

  return (
    <>
      <div
        className="sticky top-0 z-[90] flex shrink-0 items-center gap-2 border-b-2 border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] px-3 py-2.5 lg:hidden"
        data-testid="demo-walkthrough-mobile-bar"
      >
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => onStepSelect(activeStep - 1)}
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[var(--sf-ink)] ring-2 ring-inset ring-[var(--sf-ink)]/20 transition enabled:hover:ring-[var(--sf-ink)] disabled:opacity-35 ${FOCUS}`}
          aria-label="Previous step"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.4} aria-hidden />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-forest)]">
            Step {activeStep + 1} of {total}
          </p>
          <p className="truncate text-sm font-extrabold text-[var(--sf-ink)]">
            {step?.title ?? schoolName}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className={`inline-flex h-9 shrink-0 items-center gap-1 rounded-full border-2 border-[var(--sf-ink)] bg-white px-3 text-[12px] font-extrabold text-[var(--sf-ink)] shadow-[0_2px_0_0_var(--sf-ink)] transition active:translate-y-0.5 active:shadow-none ${FOCUS}`}
        >
          <List className="h-4 w-4" strokeWidth={2.4} aria-hidden />
          Steps
        </button>

        <button
          type="button"
          disabled={!canNext}
          onClick={() => onStepSelect(activeStep + 1)}
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--sf-forest)] text-white shadow-[0_3px_0_0_var(--sf-forest-deep)] transition enabled:active:translate-y-0.5 enabled:active:shadow-none disabled:opacity-35 ${FOCUS}`}
          aria-label="Next step"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={2.4} aria-hidden />
        </button>
      </div>

      <DemoWalkthroughMobileSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        schoolName={schoolName}
        schoolLogo={schoolLogo}
        steps={steps}
        activeStep={activeStep}
        onStepSelect={onStepSelect}
      />
    </>
  );
}
