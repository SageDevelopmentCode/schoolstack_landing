"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { prestigeWisdomAcademyConfig } from "@/data/school-demos/prestige-wisdom-academy";
import { prestigeWisdomAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/prestige-wisdom-academy";

export default function PrestigeWisdomAcademyDemoPage() {
  return (
    <SchoolDemoShell
      config={prestigeWisdomAcademyConfig}
      schoolName="Prestige Wisdom Academy"
      steps={prestigeWisdomAcademyWalkthroughPlaceholder}
    />
  );
}
