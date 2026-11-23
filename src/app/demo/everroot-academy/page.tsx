"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { everrootAcademyConfig } from "@/data/school-demos/everroot-academy";
import { everrootAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/everroot-academy";

export default function EverrootAcademyDemoPage() {
  return (
    <SchoolDemoShell
      config={everrootAcademyConfig}
      schoolName="EverRoot Academy"
      steps={everrootAcademyWalkthroughPlaceholder}
    />
  );
}
