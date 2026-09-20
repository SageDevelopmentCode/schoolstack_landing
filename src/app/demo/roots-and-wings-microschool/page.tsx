"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { rootsAndWingsMicroschoolConfig } from "@/data/school-demos/roots-and-wings-microschool";
import { rootsAndWingsMicroschoolWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function RootsAndWingsMicroschoolDemoPage() {
  return (
    <SchoolDemoShell
      config={rootsAndWingsMicroschoolConfig}
      schoolName="Roots and Wings"
      steps={rootsAndWingsMicroschoolWalkthroughPlaceholder}
    />
  );
}
