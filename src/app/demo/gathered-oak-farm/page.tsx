"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { gatheredOakFarmConfig } from "@/data/school-demos/gathered-oak-farm";
import { gatheredOakFarmWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/gathered-oak-farm";

export default function GatheredOakFarmDemoPage() {
  return (
    <SchoolDemoShell
      config={gatheredOakFarmConfig}
      schoolName="Gathered Oak Farm"
      steps={gatheredOakFarmWalkthroughPlaceholder}
    />
  );
}
