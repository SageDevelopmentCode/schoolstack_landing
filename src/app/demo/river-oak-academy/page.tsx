"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { riverOakAcademyConfig } from "@/data/school-demos/river-oak-academy";
import { riverOakAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/river-oak-academy";

export default function RiverOakAcademyDemoPage() {
  return (
    <SchoolDemoShell
      config={riverOakAcademyConfig}
      schoolName="River Oak Academy"
      steps={riverOakAcademyWalkthroughPlaceholder}
    />
  );
}
