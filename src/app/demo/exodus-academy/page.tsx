"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { exodusAcademyConfig } from "@/data/school-demos/exodus-academy";
import { exodusAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/exodus-academy";

export default function ExodusAcademyDemoPage() {
  return (
    <SchoolDemoShell
      config={exodusAcademyConfig}
      schoolName="Exodus Academy"
      steps={exodusAcademyWalkthroughPlaceholder}
    />
  );
}
