"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { renewedRootsForestSchoolConfig } from "@/data/school-demos/renewed-roots-forest-school";
import { renewedRootsForestSchoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/renewed-roots-forest-school";

export default function RenewedRootsForestSchoolDemoPage() {
  return (
    <SchoolDemoShell
      config={renewedRootsForestSchoolConfig}
      schoolName="Renewed Roots Forest School"
      steps={renewedRootsForestSchoolWalkthroughPlaceholder}
    />
  );
}
