"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { praxisEliteSportsAcademyConfig } from "@/data/school-demos/praxis-elite-sports-academy";
import { praxisEliteSportsAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/praxis-elite-sports-academy";

export default function PraxisEliteSportsAcademyDemoPage() {
  return (
    <SchoolDemoShell
      config={praxisEliteSportsAcademyConfig}
      schoolName="Praxis Elite Sports Academy"
      steps={praxisEliteSportsAcademyWalkthroughPlaceholder}
    />
  );
}
