"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { esteamAcademyRoundRockConfig } from "@/data/school-demos/esteam-academy-round-rock";
import { esteamAcademyRoundRockWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/esteam-academy-round-rock";

export default function EsteamAcademyRoundRockDemoPage() {
  return (
    <SchoolDemoShell
      config={esteamAcademyRoundRockConfig}
      schoolName="ESTEAM Academy"
      steps={esteamAcademyRoundRockWalkthroughPlaceholder}
    />
  );
}
