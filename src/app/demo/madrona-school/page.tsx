"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { madronaSchoolConfig } from "@/data/school-demos/madrona-school";
import { madronaSchoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/madrona-school";

export default function MadronaSchoolDemoPage() {
  return (
    <SchoolDemoShell
      config={madronaSchoolConfig}
      schoolName="Madrona School"
      steps={madronaSchoolWalkthroughPlaceholder}
    />
  );
}
