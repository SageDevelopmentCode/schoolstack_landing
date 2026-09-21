"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { riverOakAcademyConfig } from "@/data/school-demos/river-oak-academy";
import { riverOakAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function RiverOakAcademyDemoPage() {
  return (
    <SchoolDemoShell
      config={riverOakAcademyConfig}
      schoolName="River Oak Academy"
      steps={riverOakAcademyWalkthroughPlaceholder}
    />
  );
}
