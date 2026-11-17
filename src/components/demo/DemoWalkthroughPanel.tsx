"use client";

import { MousePointerClick } from "lucide-react";
import Image from "next/image";
import SchoolDemoWordmark, {
  type SchoolDemoLogo,
} from "@/components/demo/SchoolDemoWordmark";
import DemoWalkthroughStepList from "@/components/demo/DemoWalkthroughStepList";
import { Pill, Tape } from "@/components/garden/ui";
import type { DemoWalkthroughStep } from "@/data/school-demos/walkthrough-placeholder";

interface Props {
  schoolName: string;
  schoolLogo: SchoolDemoLogo;
  steps: DemoWalkthroughStep[];
  activeStep?: number;
  onStepSelect: (index: number) => void;
}

/** MudKitchen × school co-brand, pinned to the wall as an index card. */
export function DemoCoBrandCard({
  schoolLogo,
  className = "",
}: {
  schoolLogo: SchoolDemoLogo;
  className?: string;
}) {
  return (
    <div
      className={`relative flex items-center gap-3 rounded-[22px] border-2 border-[var(--sf-ink)] bg-white px-4 py-3 shadow-[0_4px_0_0_var(--sf-ink)] ${className}`}
    >
      <Tape color="var(--sf-mint)" className="-top-2.5 left-1/2 h-5 w-14 -translate-x-1/2 -rotate-3" />
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5">
        <Image
          src="/images/Logo.png"
          alt="MudKitchen"
          width={24}
          height={24}
          className="h-6 w-auto shrink-0 object-contain"
        />
        <span className="text-center text-[10px] font-extrabold leading-tight text-[var(--sf-clay-deep)]">
          MudKitchen
        </span>
      </div>
      <span
        className="self-stretch border-l-2 border-dashed border-[var(--sf-ink)]/20"
        aria-hidden="true"
      />
      <div className="flex min-w-0 flex-1 items-center justify-center">
        <SchoolDemoWordmark
          logo={schoolLogo}
          className="h-8 w-auto max-w-[140px] object-contain text-center"
        />
      </div>
    </div>
  );
}

/** "Step N of M" with a butter fill on an ink track. */
export function DemoStepProgress({
  activeStep,
  total,
}: {
  activeStep: number;
  total: number;
}) {
  const pct = total > 1 ? (activeStep / (total - 1)) * 100 : 100;

  return (
    <div>
      <div className="flex items-baseline justify-between text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]">
        <span>Progress</span>
        <span className="text-[var(--sf-ink)]">
          Step {activeStep + 1} of {total}
        </span>
      </div>
      <div
        className="mt-2 h-2.5 overflow-hidden rounded-full border-2 border-[var(--sf-ink)] bg-white"
        role="progressbar"
        aria-label="Walkthrough progress"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={activeStep + 1}
      >
        <div
          className="h-full rounded-full bg-[var(--sf-butter)] transition-[width] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{ width: `${Math.max(pct, 6)}%` }}
        />
      </div>
    </div>
  );
}

function DemoWalkthroughHint() {
  return (
    <div className="relative mb-6 mt-1 px-1">
      <div
        className="flex items-start gap-2.5 rounded-md bg-[var(--sf-butter)] p-3 shadow-[0_14px_30px_-16px_rgba(43,36,29,0.5)]"
        style={{ rotate: "-1deg" }}
      >
        <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full bg-white ring-2 ring-[var(--sf-ink)]">
          <MousePointerClick
            className="h-4 w-4 text-[var(--sf-ink)]"
            strokeWidth={2.4}
            aria-hidden
          />
        </span>
        <p className="pt-1 text-[13px] font-bold leading-snug text-[var(--sf-ink)]">
          Click each step below to walk through the flow.
        </p>
      </div>
      <p
        className="sf-hand mt-2 rotate-[-2deg] text-right text-lg leading-none text-[var(--sf-forest)]"
        aria-hidden="true"
      >
        psst — it&apos;s interactive. click around!
      </p>
    </div>
  );
}

export default function DemoWalkthroughPanel({
  schoolName,
  schoolLogo,
  steps,
  activeStep = 0,
  onStepSelect,
}: Props) {
  return (
    <aside className="hidden h-screen w-[20%] min-w-[290px] shrink-0 flex-col overflow-y-auto border-r-2 border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] lg:flex">
      <div className="flex flex-1 flex-col px-5 pb-8 pt-7">
        <header className="mb-6">
          <Pill tint="forest" className="!px-3 !py-1 !text-xs">
            <span aria-hidden="true">🧺</span> Concept walkthrough
          </Pill>
          <h1 className="sf-display mt-3 text-[1.75rem] leading-[1] text-[var(--sf-ink)]">
            {schoolName}
          </h1>
          <DemoCoBrandCard schoolLogo={schoolLogo} className="mt-5" />
          <div className="mt-5">
            <DemoStepProgress activeStep={activeStep} total={steps.length} />
          </div>
        </header>

        <DemoWalkthroughHint />

        <div className="flex-1">
          <DemoWalkthroughStepList
            steps={steps}
            activeStep={activeStep}
            onStepSelect={onStepSelect}
          />
        </div>
      </div>
    </aside>
  );
}
