"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { wildcatMicroschoolConfig } from "@/data/school-demos/wildcat-microschool";
import { wildcatMicroschoolWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function WildcatMicroschoolDemoPage() {
  return (
    <SchoolDemoShell
      config={wildcatMicroschoolConfig}
      schoolName="Wildcat Microschool"
      steps={wildcatMicroschoolWalkthroughPlaceholder}
    />
  );
}
