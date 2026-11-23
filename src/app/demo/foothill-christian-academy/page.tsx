"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { foothillChristianAcademyConfig } from "@/data/school-demos/foothill-christian-academy";
import { foothillChristianAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/foothill-christian-academy";

export default function FoothillChristianAcademyDemoPage() {
  return (
    <SchoolDemoShell
      config={foothillChristianAcademyConfig}
      schoolName="Foothill Christian Academy"
      steps={foothillChristianAcademyWalkthroughPlaceholder}
    />
  );
}
