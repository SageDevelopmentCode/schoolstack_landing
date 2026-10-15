"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { inspiredLearningConfig } from "@/data/school-demos/inspired-learning-academy";
import { inspiredLearningWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function InspiredLearningAcademyDemoPage() {
  return (
    <SchoolDemoShell
      config={inspiredLearningConfig}
      schoolName="Inspired Learning Academy"
      steps={inspiredLearningWalkthroughPlaceholder}
    />
  );
}
