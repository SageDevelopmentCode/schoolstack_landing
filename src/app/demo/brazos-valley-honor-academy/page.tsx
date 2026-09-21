"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { brazosValleyHonorAcademyConfig } from "@/data/school-demos/brazos-valley-honor-academy";
import { brazosValleyHonorAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function BrazosValleyHonorAcademyDemoPage() {
  return (
    <SchoolDemoShell
      config={brazosValleyHonorAcademyConfig}
      schoolName="Brazos Valley Honor Academy"
      steps={brazosValleyHonorAcademyWalkthroughPlaceholder}
    />
  );
}
