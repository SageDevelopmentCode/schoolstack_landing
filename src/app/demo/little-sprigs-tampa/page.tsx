"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { littleSprigsTampaConfig } from "@/data/school-demos/little-sprigs-tampa";
import { littleSprigsTampaWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/little-sprigs-tampa";

export default function LittleSprigsTampaDemoPage() {
  return (
    <SchoolDemoShell
      config={littleSprigsTampaConfig}
      schoolName="Little Sprigs of Tampa"
      steps={littleSprigsTampaWalkthroughPlaceholder}
    />
  );
}
