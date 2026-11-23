"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { desertDragonSchoolConfig } from "@/data/school-demos/desert-dragon-school";
import { desertDragonSchoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/desert-dragon-school";

export default function DesertDragonSchoolDemoPage() {
  return (
    <SchoolDemoShell
      config={desertDragonSchoolConfig}
      schoolName="Desert Dragon Learning Community"
      steps={desertDragonSchoolWalkthroughPlaceholder}
    />
  );
}
