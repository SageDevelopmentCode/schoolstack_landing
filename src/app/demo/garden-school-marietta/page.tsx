"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { gardenSchoolMariettaConfig } from "@/data/school-demos/garden-school-marietta";
import { gardenSchoolMariettaWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/garden-school-marietta";

export default function GardenSchoolMariettaDemoPage() {
  return (
    <SchoolDemoShell
      config={gardenSchoolMariettaConfig}
      schoolName="The Garden School of Marietta"
      steps={gardenSchoolMariettaWalkthroughPlaceholder}
    />
  );
}
