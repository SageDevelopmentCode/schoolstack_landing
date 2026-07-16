"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { oneAcreFarmConfig } from "@/data/school-demos/one-acre-farm";
import { oneAcreFarmWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function OneAcreFarmDemoPage() {
  return (
    <SchoolDemoShell
      config={oneAcreFarmConfig}
      schoolName="One Acre Farm"
      steps={oneAcreFarmWalkthroughPlaceholder}
    />
  );
}
