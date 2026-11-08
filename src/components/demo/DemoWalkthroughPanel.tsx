"use client";

import { MousePointerClick } from "lucide-react";
import Image from "next/image";
import SchoolDemoWordmark, {
  type SchoolDemoLogo,
} from "@/components/demo/SchoolDemoWordmark";
import DemoWalkthroughStepList from "@/components/demo/DemoWalkthroughStepList";
import { BOLD_HEADING } from "@/components/home/bright-styles";
import type { DemoWalkthroughStep } from "@/data/school-demos/walkthrough-placeholder";

interface Props {
  schoolName: string;
  schoolLogo: SchoolDemoLogo;
  steps: DemoWalkthroughStep[];
  activeStep?: number;
  schoolPrimary: string;
  onStepSelect: (index: number) => void;
}

function DemoWalkthroughHeader({
  schoolName,
  schoolLogo,
  schoolPrimary,
}: {
  schoolName: string;
  schoolLogo: SchoolDemoLogo;
  schoolPrimary: string;
}) {
  return (
    <header className="mb-5">
      <p
        className="font-secondary text-[13px] font-semibold uppercase tracking-widest"
        style={{ color: schoolPrimary }}
      >
        Concept walkthrough
      </p>
      <h1
        className={`mt-1.5 text-[clamp(1.15rem,2.2vw,1.4rem)] ${BOLD_HEADING}`}
      >
        {schoolName}
      </h1>
      <div className="mt-4 flex items-center gap-3 rounded-pill bg-[#F4F1EC] px-4 py-2.5">
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5">
          <Image
            src="/images/Logo.png"
            alt="MudKitchen"
            width={24}
            height={24}
            className="h-6 w-auto shrink-0 object-contain"
          />
          <span className="font-secondary text-center text-[10px] font-bold leading-tight text-clay">
            MudKitchen
          </span>
        </div>
        <div
          className="w-px shrink-0 self-stretch bg-black/10"
          aria-hidden
        />
        <div className="flex min-w-0 flex-1 items-center justify-center">
          <SchoolDemoWordmark
            logo={schoolLogo}
            className="h-8 w-auto max-w-[140px] object-contain text-center"
          />
        </div>
      </div>
    </header>
  );
}

function DemoWalkthroughHint() {
  return (
    <div className="mb-5 flex items-start gap-2.5 rounded-[20px] bg-[#F4F1EC] p-3 ring-1 ring-black/[0.06]">
      <span className="grid h-[31px] w-[31px] shrink-0 place-items-center rounded-full bg-white">
        <MousePointerClick
          className="h-4 w-4 text-[#1d1a16]/70"
          aria-hidden
        />
      </span>
      <p className="font-secondary text-xs leading-relaxed text-[#1d1a16]/65">
        Click each step below to walk through the flow.
      </p>
    </div>
  );
}

export default function DemoWalkthroughPanel({
  schoolName,
  schoolLogo,
  steps,
  activeStep = 0,
  schoolPrimary,
  onStepSelect,
}: Props) {
  return (
    <aside className="hidden h-screen w-[20%] min-w-[280px] shrink-0 flex-col overflow-y-auto border-r border-black/10 bg-white lg:flex">
      <div className="flex flex-1 flex-col px-5 py-7">
        <DemoWalkthroughHeader
          schoolName={schoolName}
          schoolLogo={schoolLogo}
          schoolPrimary={schoolPrimary}
        />

        <DemoWalkthroughHint />

        <div className="flex-1">
          <DemoWalkthroughStepList
            steps={steps}
            activeStep={activeStep}
            accentColor={schoolPrimary}
            onStepSelect={onStepSelect}
          />
        </div>
      </div>
    </aside>
  );
}
