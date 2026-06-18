"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { rootedMeadowsConfig } from "@/data/school-demos/rooted-meadows";
import { rootedMeadowsWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function RootedMeadowsDemoPage() {
  return (
    <SchoolDemoShell
      config={rootedMeadowsConfig}
      schoolName="Rooted Meadows Waldorf School"
      steps={rootedMeadowsWalkthroughPlaceholder}
    />
  );
}
