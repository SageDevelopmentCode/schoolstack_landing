"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { blueHorizonStudioConfig } from "@/data/school-demos/blue-horizon-studio";
import { blueHorizonStudioWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/blue-horizon-studio";

export default function BlueHorizonStudioDemoPage() {
  return (
    <SchoolDemoShell
      config={blueHorizonStudioConfig}
      schoolName="Blue Horizon Studio"
      steps={blueHorizonStudioWalkthroughPlaceholder}
    />
  );
}
