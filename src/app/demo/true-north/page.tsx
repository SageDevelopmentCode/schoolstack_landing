"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { trueNorthConfig } from "@/data/school-demos/true-north";
import { trueNorthWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function TrueNorthDemoPage() {
  return (
    <SchoolDemoShell
      config={trueNorthConfig}
      schoolName="True North"
      steps={trueNorthWalkthroughPlaceholder}
    />
  );
}
