"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { actonAcademyPittsburghConfig } from "@/data/school-demos/acton-academy-pittsburgh";
import { actonAcademyPittsburghWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/acton-academy-pittsburgh";

export default function ActonAcademyPittsburghDemoPage() {
  return (
    <SchoolDemoShell
      config={actonAcademyPittsburghConfig}
      schoolName="Acton Academy Pittsburgh"
      steps={actonAcademyPittsburghWalkthroughPlaceholder}
    />
  );
}
