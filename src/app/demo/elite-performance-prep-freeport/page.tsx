"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { elitePerformancePrepFreeportConfig } from "@/data/school-demos/elite-performance-prep-freeport";
import { elitePerformancePrepFreeportWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/elite-performance-prep-freeport";

export default function ElitePerformancePrepFreeportDemoPage() {
  return (
    <SchoolDemoShell
      config={elitePerformancePrepFreeportConfig}
      schoolName="Elite Performance Prep Academy Freeport"
      steps={elitePerformancePrepFreeportWalkthroughPlaceholder}
    />
  );
}
