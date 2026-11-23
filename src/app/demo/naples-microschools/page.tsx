"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { naplesMicroschoolsConfig } from "@/data/school-demos/naples-microschools";
import { naplesMicroschoolsWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/naples-microschools";

export default function NaplesMicroschoolsDemoPage() {
  return (
    <SchoolDemoShell
      config={naplesMicroschoolsConfig}
      schoolName="Naples MicroSchools"
      steps={naplesMicroschoolsWalkthroughPlaceholder}
    />
  );
}
