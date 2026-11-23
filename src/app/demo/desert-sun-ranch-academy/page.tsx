"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { desertSunRanchAcademyConfig } from "@/data/school-demos/desert-sun-ranch-academy";
import { desertSunRanchAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/desert-sun-ranch-academy";

export default function DesertSunRanchAcademyDemoPage() {
  return (
    <SchoolDemoShell
      config={desertSunRanchAcademyConfig}
      schoolName="Desert Sun Ranch Academy"
      steps={desertSunRanchAcademyWalkthroughPlaceholder}
    />
  );
}
