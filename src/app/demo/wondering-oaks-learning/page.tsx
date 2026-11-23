"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { wonderingOaksLearningConfig } from "@/data/school-demos/wondering-oaks-learning";
import { wonderingOaksWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/wondering-oaks";

export default function WonderingOaksLearningDemoPage() {
  return (
    <SchoolDemoShell
      config={wonderingOaksLearningConfig}
      schoolName="Wondering Oaks Learning"
      steps={wonderingOaksWalkthroughPlaceholder}
    />
  );
}
