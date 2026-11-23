"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { downToEarthHomeschoolConfig } from "@/data/school-demos/down-to-earth-homeschool";
import { downToEarthHomeschoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/down-to-earth-homeschool";

export default function DownToEarthHomeschoolDemoPage() {
  return (
    <SchoolDemoShell
      config={downToEarthHomeschoolConfig}
      schoolName="Down to Earth Co-op"
      steps={downToEarthHomeschoolWalkthroughPlaceholder}
    />
  );
}
