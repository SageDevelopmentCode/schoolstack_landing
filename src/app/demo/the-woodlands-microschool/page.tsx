"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { theWoodlandsMicroschoolConfig } from "@/data/school-demos/the-woodlands-microschool";
import { theWoodlandsMicroschoolWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function TheWoodlandsMicroschoolDemoPage() {
  return (
    <SchoolDemoShell
      config={theWoodlandsMicroschoolConfig}
      schoolName="The Woodlands Microschool"
      steps={theWoodlandsMicroschoolWalkthroughPlaceholder}
    />
  );
}
