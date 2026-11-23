"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { heartsongCottageSchoolConfig } from "@/data/school-demos/heartsong-cottage-school";
import { heartsongCottageSchoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/heartsong-cottage-school";

export default function HeartsongCottageSchoolDemoPage() {
  return (
    <SchoolDemoShell
      config={heartsongCottageSchoolConfig}
      schoolName="Heartsong Cottage School"
      steps={heartsongCottageSchoolWalkthroughPlaceholder}
    />
  );
}
