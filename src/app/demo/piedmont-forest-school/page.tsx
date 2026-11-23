"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { piedmontForestSchoolConfig } from "@/data/school-demos/piedmont-forest-school";
import { piedmontForestSchoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/piedmont-forest-school";

export default function PiedmontForestSchoolDemoPage() {
  return (
    <SchoolDemoShell
      config={piedmontForestSchoolConfig}
      schoolName="Piedmont Forest School"
      steps={piedmontForestSchoolWalkthroughPlaceholder}
    />
  );
}
