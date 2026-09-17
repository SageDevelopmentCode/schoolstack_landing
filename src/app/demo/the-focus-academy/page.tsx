"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { theFocusAcademyConfig } from "@/data/school-demos/the-focus-academy";
import { theFocusAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function TheFocusAcademyDemoPage() {
  return (
    <SchoolDemoShell
      config={theFocusAcademyConfig}
      schoolName="The FOCUS Academy"
      steps={theFocusAcademyWalkthroughPlaceholder}
    />
  );
}
