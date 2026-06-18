"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { arizonaGiftedAcademyConfig } from "@/data/school-demos/arizona-gifted-academy";
import { arizonaGiftedAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function ArizonaGiftedAcademyDemoPage() {
  return (
    <SchoolDemoShell
      config={arizonaGiftedAcademyConfig}
      schoolName="Arizona Gifted Academy"
      steps={arizonaGiftedAcademyWalkthroughPlaceholder}
    />
  );
}
