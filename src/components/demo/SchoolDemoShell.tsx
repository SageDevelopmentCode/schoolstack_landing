"use client";

import { useCallback, useState } from "react";
import DemoWalkthroughPanel from "@/components/demo/DemoWalkthroughPanel";
import ScaledWebsiteDemoPreview from "@/components/demo/ScaledWebsiteDemoPreview";
import type { DemoWalkthroughStep } from "@/data/school-demos/walkthrough-placeholder";
import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";

interface Props {
  config: SchoolWebsiteDemoConfig;
  schoolName: string;
  steps: DemoWalkthroughStep[];
}

export default function SchoolDemoShell({
  config,
  schoolName,
  steps,
}: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [scrollRequest, setScrollRequest] = useState<{
    target: "top" | "form";
    nonce: number;
  } | null>(null);

  const handleStepSelect = useCallback(
    (index: number) => {
      setActiveStep(index);
      const target = steps[index]?.scrollTarget ?? (index === 0 ? "top" : "form");
      setScrollRequest({ target, nonce: Date.now() });
    },
    [steps],
  );

  const handleDiscoveryCallClick = useCallback(() => {
    setActiveStep(1);
    setScrollRequest({ target: "form", nonce: Date.now() });
  }, []);

  return (
    <div className="h-screen flex overflow-hidden">
      <DemoWalkthroughPanel
        schoolName={schoolName}
        schoolLogo={config.logo}
        steps={steps}
        activeStep={activeStep}
        onStepSelect={handleStepSelect}
      />
      <div className="flex-1 h-screen min-w-0">
        <ScaledWebsiteDemoPreview
          config={config}
          scrollRequest={scrollRequest}
          onDiscoveryCallClick={handleDiscoveryCallClick}
        />
      </div>
    </div>
  );
}
