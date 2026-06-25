"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { naturesSchoolhouseConfig } from "@/data/school-demos/natures-schoolhouse";
import { naturesSchoolhouseWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function NaturesSchoolhouseDemoPage() {
  return (
    <SchoolDemoShell
      config={naturesSchoolhouseConfig}
      schoolName="Nature's Schoolhouse Microschool"
      steps={naturesSchoolhouseWalkthroughPlaceholder}
    />
  );
}
