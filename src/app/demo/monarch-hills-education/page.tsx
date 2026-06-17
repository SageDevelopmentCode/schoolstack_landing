"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { monarchHillsEducationConfig } from "@/data/school-demos/monarch-hills-education";
import { monarchHillsWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function MonarchHillsEducationDemoPage() {
  return (
    <SchoolDemoShell
      config={monarchHillsEducationConfig}
      schoolName="Monarch Hills Education"
      steps={monarchHillsWalkthroughPlaceholder}
    />
  );
}
