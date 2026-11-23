"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { bmfMicroschoolsConfig } from "@/data/school-demos/bmf-microschools";
import { bmfMicroschoolsWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/bmf-microschools";

export default function BmfMicroschoolsDemoPage() {
  return (
    <SchoolDemoShell
      config={bmfMicroschoolsConfig}
      schoolName="School to Purpose Academies"
      steps={bmfMicroschoolsWalkthroughPlaceholder}
    />
  );
}
