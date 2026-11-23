"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { adelphiaClassicalChristianAcademyConfig } from "@/data/school-demos/adelphia-classical-christian-academy";
import { adelphiaClassicalChristianAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/adelphia-classical-christian-academy";

export default function AdelphiaClassicalChristianAcademyDemoPage() {
  return (
    <SchoolDemoShell
      config={adelphiaClassicalChristianAcademyConfig}
      schoolName="Adelphia Classical Christian Academy"
      steps={adelphiaClassicalChristianAcademyWalkthroughPlaceholder}
    />
  );
}
