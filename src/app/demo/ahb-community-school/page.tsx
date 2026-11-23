"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { ahbCommunitySchoolConfig } from "@/data/school-demos/ahb-community-school";
import { ahbCommunitySchoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/ahb-community-school";

export default function AhbCommunitySchoolDemoPage() {
  return (
    <SchoolDemoShell
      config={ahbCommunitySchoolConfig}
      schoolName="AHB Community School"
      steps={ahbCommunitySchoolWalkthroughPlaceholder}
    />
  );
}
