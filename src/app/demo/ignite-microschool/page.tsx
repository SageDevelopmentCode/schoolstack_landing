"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { igniteMicroschoolConfig } from "@/data/school-demos/ignite-microschool";
import { igniteMicroschoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/ignite-microschool";

export default function IgniteMicroschoolDemoPage() {
  return (
    <SchoolDemoShell
      config={igniteMicroschoolConfig}
      schoolName="Ignite Microschool"
      steps={igniteMicroschoolWalkthroughPlaceholder}
    />
  );
}
