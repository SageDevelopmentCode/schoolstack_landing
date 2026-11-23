"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { prestigeHomeschoolAcademyConfig } from "@/data/school-demos/prestige-homeschool-academy";
import { prestigeHomeschoolAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/prestige-homeschool-academy";

export default function PrestigeHomeschoolAcademyDemoPage() {
  return (
    <SchoolDemoShell
      config={prestigeHomeschoolAcademyConfig}
      schoolName="Prestige Homeschool Academy"
      steps={prestigeHomeschoolAcademyWalkthroughPlaceholder}
    />
  );
}
