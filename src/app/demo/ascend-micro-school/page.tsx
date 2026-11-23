"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { ascendMicroSchoolConfig } from "@/data/school-demos/ascend-micro-school";
import { ascendMicroSchoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/ascend-micro-school";

export default function AscendMicroSchoolDemoPage() {
  return (
    <SchoolDemoShell
      config={ascendMicroSchoolConfig}
      schoolName="Ascend Micro School"
      steps={ascendMicroSchoolWalkthroughPlaceholder}
    />
  );
}
