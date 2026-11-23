"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { honeycombCottageSchoolConfig } from "@/data/school-demos/honeycomb-cottage-school";
import { honeycombCottageSchoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/honeycomb-cottage-school";

export default function HoneycombCottageSchoolDemoPage() {
  return (
    <SchoolDemoShell
      config={honeycombCottageSchoolConfig}
      schoolName="Honeycomb Cottage School"
      steps={honeycombCottageSchoolWalkthroughPlaceholder}
    />
  );
}
