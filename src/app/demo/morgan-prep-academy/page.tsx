"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { morganPrepAcademyConfig } from "@/data/school-demos/morgan-prep-academy";
import { morganPrepAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/morgan-prep-academy";

export default function MorganPrepAcademyDemoPage() {
  return (
    <SchoolDemoShell
      config={morganPrepAcademyConfig}
      schoolName="Morgan Preparatory Academy for Boys"
      steps={morganPrepAcademyWalkthroughPlaceholder}
    />
  );
}
