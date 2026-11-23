"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { beaconOfHopeAcademyConfig } from "@/data/school-demos/beacon-of-hope-academy";
import { beaconOfHopeAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/beacon-of-hope-academy";

export default function BeaconOfHopeAcademyDemoPage() {
  return (
    <SchoolDemoShell
      config={beaconOfHopeAcademyConfig}
      schoolName="Beacon of Hope Academy"
      steps={beaconOfHopeAcademyWalkthroughPlaceholder}
    />
  );
}
