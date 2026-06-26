"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { lighthouseHomeschoolConfig } from "@/data/school-demos/lighthouse-homeschool";
import { lighthouseHomeschoolWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function LighthouseHomeschoolDemoPage() {
  return (
    <SchoolDemoShell
      config={lighthouseHomeschoolConfig}
      schoolName="Lighthouse Homeschool Academy"
      steps={lighthouseHomeschoolWalkthroughPlaceholder}
    />
  );
}
