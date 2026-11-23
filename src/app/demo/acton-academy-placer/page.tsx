"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { actonAcademyPlacerConfig } from "@/data/school-demos/acton-academy-placer";
import { actonAcademyPlacerWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/acton-academy-placer";

export default function ActonAcademyPlacerDemoPage() {
  return (
    <SchoolDemoShell
      config={actonAcademyPlacerConfig}
      schoolName="Acton Academy Placer"
      steps={actonAcademyPlacerWalkthroughPlaceholder}
    />
  );
}
