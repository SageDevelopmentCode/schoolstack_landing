"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { innerFireAcademyConfig } from "@/data/school-demos/inner-fire-academy";
import { innerFireAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/inner-fire-academy";

export default function InnerFireAcademyDemoPage() {
  return (
    <SchoolDemoShell
      config={innerFireAcademyConfig}
      schoolName="Inner Fire Academy"
      steps={innerFireAcademyWalkthroughPlaceholder}
    />
  );
}
