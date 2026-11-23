"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { kineoSchoolConfig } from "@/data/school-demos/kineo-school";
import { kineoSchoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/kineo-school";

export default function KineoSchoolDemoPage() {
  return (
    <SchoolDemoShell
      config={kineoSchoolConfig}
      schoolName="The Kineo School"
      steps={kineoSchoolWalkthroughPlaceholder}
    />
  );
}
