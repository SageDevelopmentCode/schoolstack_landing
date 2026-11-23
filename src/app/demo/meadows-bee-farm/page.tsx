"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { meadowsBeeFarmConfig } from "@/data/school-demos/meadows-bee-farm";
import { meadowsBeeFarmWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/meadows-bee-farm";

export default function MeadowsBeeFarmDemoPage() {
  return (
    <SchoolDemoShell
      config={meadowsBeeFarmConfig}
      schoolName="Meadows Bee Farm"
      steps={meadowsBeeFarmWalkthroughPlaceholder}
    />
  );
}
