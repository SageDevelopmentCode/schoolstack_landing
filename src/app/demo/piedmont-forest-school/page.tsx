"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { piedmontForestSchoolConfig } from "@/data/school-demos/piedmont-forest-school";
import { piedmontForestSchoolWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function PiedmontForestSchoolDemoPage() {
  return (
    <SchoolDemoShell
      config={piedmontForestSchoolConfig}
      schoolName="Piedmont Forest School"
      steps={piedmontForestSchoolWalkthroughPlaceholder}
    />
  );
}
