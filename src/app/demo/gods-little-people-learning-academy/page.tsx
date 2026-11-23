"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { godsLittlePeopleLearningAcademyConfig } from "@/data/school-demos/gods-little-people-learning-academy";
import { godsLittlePeopleLearningAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/gods-little-people-learning-academy";

export default function GodsLittlePeopleLearningAcademyDemoPage() {
  return (
    <SchoolDemoShell
      config={godsLittlePeopleLearningAcademyConfig}
      schoolName="God's Little People Learning Academy"
      steps={godsLittlePeopleLearningAcademyWalkthroughPlaceholder}
    />
  );
}
