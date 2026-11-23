"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { brightMindsFutureLeadersConfig } from "@/data/school-demos/bright-minds-future-leaders";
import { brightMindsFutureLeadersWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/bright-minds-future-leaders";

export default function BrightMindsFutureLeadersDemoPage() {
  return (
    <SchoolDemoShell
      config={brightMindsFutureLeadersConfig}
      schoolName="Bright Minds Future Leaders"
      steps={brightMindsFutureLeadersWalkthroughPlaceholder}
    />
  );
}
