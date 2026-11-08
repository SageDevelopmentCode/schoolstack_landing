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
  schoolPrimary: string;
  onStepSelect: (index: number) => void;
}

export default function DemoWalkthroughMobileBar({
  schoolName,
  schoolLogo,
  steps,
  activeStep,
  schoolPrimary,
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
        className="sticky top-0 z-[90] flex shrink-0 items-center gap-2 border-b border-black/10 bg-white px-3 py-2.5 lg:hidden"
        data-testid="demo-walkthrough-mobile-bar"
      >
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => onStepSelect(activeStep - 1)}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#F4F1EC] text-[#1d1a16] transition enabled:hover:bg-black/5 disabled:opacity-35"
          aria-label="Previous step"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>

        <div className="min-w-0 flex-1">
          <p className="font-secondary text-[10px] font-bold uppercase tracking-[0.12em] text-[#1d1a16]/50">
            Step {activeStep + 1} of {total}
          </p>
          <p
            className="truncate font-secondary text-sm font-semibold text-[#1d1a16]"
            style={{ color: step ? undefined : schoolPrimary }}
          >
            {step?.title ?? schoolName}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="font-secondary inline-flex h-9 shrink-0 items-center gap-1 rounded-pill bg-[#F4F1EC] px-3 text-[12px] font-semibold text-[#1d1a16] transition hover:bg-black/5"
        >
          <List className="h-4 w-4" aria-hidden />
          Steps
        </button>

        <button
          type="button"
          disabled={!canNext}
          onClick={() => onStepSelect(activeStep + 1)}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white transition enabled:hover:opacity-90 disabled:opacity-35"
          style={{ backgroundColor: schoolPrimary }}
          aria-label="Next step"
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <DemoWalkthroughMobileSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        schoolName={schoolName}
        schoolLogo={schoolLogo}
        steps={steps}
        activeStep={activeStep}
        schoolPrimary={schoolPrimary}
        onStepSelect={onStepSelect}
      />
    </>
  );
}
