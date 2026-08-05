"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { austinMicroSchoolConfig } from "@/data/school-demos/austin-micro-school";
import { austinMicroSchoolWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function AustinMicroSchoolDemoPage() {
  return (
    <SchoolDemoShell
      config={austinMicroSchoolConfig}
      schoolName="Austin Micro School"
      steps={austinMicroSchoolWalkthroughPlaceholder}
    />
  );
}
