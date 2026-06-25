"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { wildHeartsAdventureConfig } from "@/data/school-demos/wild-hearts-adventure";
import { wildHeartsWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function WildHeartsAdventureDemoPage() {
  return (
    <SchoolDemoShell
      config={wildHeartsAdventureConfig}
      schoolName="Wild Hearts Adventure Co."
      steps={wildHeartsWalkthroughPlaceholder}
    />
  );
}
