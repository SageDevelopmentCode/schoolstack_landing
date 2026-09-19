"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { tapestryAcademyConfig } from "@/data/school-demos/tapestry-academy";
import { tapestryAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function TapestryAcademyDemoPage() {
  return (
    <SchoolDemoShell
      config={tapestryAcademyConfig}
      schoolName="Tapestry Academy"
      steps={tapestryAcademyWalkthroughPlaceholder}
    />
  );
}
