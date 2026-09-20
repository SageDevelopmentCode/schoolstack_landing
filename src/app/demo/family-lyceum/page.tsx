"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { familyLyceumConfig } from "@/data/school-demos/family-lyceum";
import { familyLyceumWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function FamilyLyceumDemoPage() {
  return (
    <SchoolDemoShell
      config={familyLyceumConfig}
      schoolName="Family Lyceum"
      steps={familyLyceumWalkthroughPlaceholder}
    />
  );
}
