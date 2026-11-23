"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { southOcHybridHomeschoolConfig } from "@/data/school-demos/south-oc-hybrid-homeschool";
import { southOcHybridHomeschoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/south-oc-hybrid-homeschool";

export default function SouthOcHybridHomeschoolDemoPage() {
  return (
    <SchoolDemoShell
      config={southOcHybridHomeschoolConfig}
      schoolName="South OC Hybrid Homeschool"
      steps={southOcHybridHomeschoolWalkthroughPlaceholder}
    />
  );
}
