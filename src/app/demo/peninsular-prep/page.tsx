"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { peninsularPrepConfig } from "@/data/school-demos/peninsular-prep";
import { peninsularPrepWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/peninsular-prep";

export default function PeninsularPrepDemoPage() {
  return (
    <SchoolDemoShell
      config={peninsularPrepConfig}
      schoolName="Peninsular Prep"
      steps={peninsularPrepWalkthroughPlaceholder}
    />
  );
}
