"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { zoeLearningHouseConfig } from "@/data/school-demos/zoe-learning-house";
import { zoeLearningHouseWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function ZoeLearningHouseDemoPage() {
  return (
    <SchoolDemoShell
      config={zoeLearningHouseConfig}
      schoolName="Zoe Learning House"
      steps={zoeLearningHouseWalkthroughPlaceholder}
    />
  );
}
