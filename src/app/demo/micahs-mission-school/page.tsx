"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { micahsMissionSchoolConfig } from "@/data/school-demos/micahs-mission-school";
import { micahMissionWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/micah-mission";

export default function MicahsMissionSchoolDemoPage() {
  return (
    <SchoolDemoShell
      config={micahsMissionSchoolConfig}
      schoolName="Micah's Mission School, Inc."
      steps={micahMissionWalkthroughPlaceholder}
    />
  );
}
