"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { springRiverSchoolConfig } from "@/data/school-demos/spring-river-school";
import { springRiverSchoolWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function SpringRiverSchoolDemoPage() {
  return (
    <SchoolDemoShell
      config={springRiverSchoolConfig}
      schoolName="Spring River School"
      steps={springRiverSchoolWalkthroughPlaceholder}
    />
  );
}
