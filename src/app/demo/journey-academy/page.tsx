"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { journeyAcademyConfig } from "@/data/school-demos/journey-academy";
import { journeyAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/journey-academy";

export default function JourneyAcademyDemoPage() {
  return (
    <SchoolDemoShell
      config={journeyAcademyConfig}
      schoolName="Journey Academy"
      steps={journeyAcademyWalkthroughPlaceholder}
    />
  );
}
