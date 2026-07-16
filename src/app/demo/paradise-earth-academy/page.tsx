"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { paradiseEarthAcademyConfig } from "@/data/school-demos/paradise-earth-academy";
import { paradiseEarthAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function ParadiseEarthAcademyDemoPage() {
  return (
    <SchoolDemoShell
      config={paradiseEarthAcademyConfig}
      schoolName="Paradise Earth Academy"
      steps={paradiseEarthAcademyWalkthroughPlaceholder}
    />
  );
}
