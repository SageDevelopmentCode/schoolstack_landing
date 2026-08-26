"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { katsCommunityMicroschoolConfig } from "@/data/school-demos/kats-community-microschool";
import { katsCommunityMicroschoolWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function KatsCommunityMicroschoolDemoPage() {
  return (
    <SchoolDemoShell
      config={katsCommunityMicroschoolConfig}
      schoolName="Kat's Community Microschool"
      steps={katsCommunityMicroschoolWalkthroughPlaceholder}
    />
  );
}
