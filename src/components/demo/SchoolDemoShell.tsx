"use client";

import DemoWalkthroughPanel from "@/components/demo/DemoWalkthroughPanel";
import ScaledWebsiteDemoPreview from "@/components/demo/ScaledWebsiteDemoPreview";
import type { DemoWalkthroughStep } from "@/data/school-demos/walkthrough-placeholder";
import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";

interface Props {
  config: SchoolWebsiteDemoConfig;
  schoolName: string;
  steps: DemoWalkthroughStep[];
  activeStep?: number;
}

export default function SchoolDemoShell({
  config,
  schoolName,
  steps,
  activeStep = 0,
}: Props) {
  return (
    <div className="h-screen flex overflow-hidden">
      <DemoWalkthroughPanel
        schoolName={schoolName}
        steps={steps}
        activeStep={activeStep}
      />
      <div className="flex-1 h-screen min-w-0">
        <ScaledWebsiteDemoPreview config={config} />
      </div>
    </div>
  );
}
