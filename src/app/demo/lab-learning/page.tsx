"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { labLearningConfig } from "@/data/school-demos/lab-learning";
import { labLearningWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function LabLearningDemoPage() {
  return (
    <SchoolDemoShell
      config={labLearningConfig}
      schoolName="The Lab Learning Space"
      steps={labLearningWalkthroughPlaceholder}
    />
  );
}
