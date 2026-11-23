"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { theWildSchoolConfig } from "@/data/school-demos/the-wild-school";
import { theWildSchoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/the-wild-school";

export default function TheWildSchoolDemoPage() {
  return (
    <SchoolDemoShell
      config={theWildSchoolConfig}
      schoolName="The Wild School"
      steps={theWildSchoolWalkthroughPlaceholder}
    />
  );
}
