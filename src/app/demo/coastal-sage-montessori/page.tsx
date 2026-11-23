"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { coastalSageMontessoriConfig } from "@/data/school-demos/coastal-sage-montessori";
import { coastalSageMontessoriWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/coastal-sage-montessori";

export default function CoastalSageMontessoriDemoPage() {
  return (
    <SchoolDemoShell
      config={coastalSageMontessoriConfig}
      schoolName="Coastal Sage Montessori"
      steps={coastalSageMontessoriWalkthroughPlaceholder}
    />
  );
}
