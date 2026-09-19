"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { asheboroHybridAcademyConfig } from "@/data/school-demos/asheboro-hybrid-academy";
import { asheboroHybridAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function AsheboroHybridAcademyDemoPage() {
  return (
    <SchoolDemoShell
      config={asheboroHybridAcademyConfig}
      schoolName="Asheboro Hybrid Academy"
      steps={asheboroHybridAcademyWalkthroughPlaceholder}
    />
  );
}
