"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { luffLearningConfig } from "@/data/school-demos/luff-learning";
import { luffLearningWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function LuffLearningDemoPage() {
  return (
    <SchoolDemoShell
      config={luffLearningConfig}
      schoolName="Luff Learning Fine Arts Academy"
      steps={luffLearningWalkthroughPlaceholder}
    />
  );
}
