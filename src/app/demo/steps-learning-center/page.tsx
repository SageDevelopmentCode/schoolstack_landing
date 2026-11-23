"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { stepsLearningCenterConfig } from "@/data/school-demos/steps-learning-center";
import { stepsLearningCenterWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/steps-learning-center";

export default function StepsLearningCenterDemoPage() {
  return (
    <SchoolDemoShell
      config={stepsLearningCenterConfig}
      schoolName="Steps Learning Center"
      steps={stepsLearningCenterWalkthroughPlaceholder}
    />
  );
}
