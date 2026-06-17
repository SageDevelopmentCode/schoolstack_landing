"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { wonderhereLakelandConfig } from "@/data/school-demos/wonderhere-lakeland";
import { wonderhereWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function WonderHereLakelandDemoPage() {
  return (
    <SchoolDemoShell
      config={wonderhereLakelandConfig}
      schoolName="WonderHere Lakeland"
      steps={wonderhereWalkthroughPlaceholder}
    />
  );
}
