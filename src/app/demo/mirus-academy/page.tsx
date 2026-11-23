"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { mirusAcademyConfig } from "@/data/school-demos/mirus-academy";
import { mirusAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/mirus-academy";

export default function MirusAcademyDemoPage() {
  return (
    <SchoolDemoShell
      config={mirusAcademyConfig}
      schoolName="Mirus Academy"
      steps={mirusAcademyWalkthroughPlaceholder}
    />
  );
}
