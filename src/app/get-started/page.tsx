"use client";

import { useState } from "react";
import HomeShell from "@/components/home/HomeShell";
import GetStartedDemoFlow, {
  type GetStartedDemoStep,
} from "@/components/get-started/GetStartedDemoFlow";
import GetStartedShowcaseCarousel from "@/components/get-started/GetStartedShowcaseCarousel";
import GetStartedFilmSection from "@/components/get-started/GetStartedFilmSection";
import GetStartedOurStorySection from "@/components/get-started/GetStartedOurStorySection";
import GetStartedStoryShell from "@/components/get-started/GetStartedStoryShell";
import { GET_STARTED_DEMO_SECTION_ID } from "@/components/about/AboutOurStorySection";

export default function GetStartedPage() {
  const [step, setStep] = useState<GetStartedDemoStep>(0);

  return (
    <HomeShell className="bg-white">
      <div className="min-h-screen bg-white">
        {step === 0 && <GetStartedShowcaseCarousel />}
        <GetStartedStoryShell
          id={GET_STARTED_DEMO_SECTION_ID}
          medium={step === 0}
          wide={step === 1}
          variant="nested"
        >
          <GetStartedDemoFlow
            scrollOnStepChange="window"
            onStepChange={setStep}
            showStepProgress={false}
          />
        </GetStartedStoryShell>
        <GetStartedFilmSection />
        <GetStartedOurStorySection />
      </div>
    </HomeShell>
  );
}
