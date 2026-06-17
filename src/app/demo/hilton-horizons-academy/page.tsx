"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { hiltonHorizonsAcademyConfig } from "@/data/school-demos/hilton-horizons-academy";
import { hiltonHorizonsAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function HiltonHorizonsAcademyDemoPage() {
  return (
    <SchoolDemoShell
      config={hiltonHorizonsAcademyConfig}
      schoolName="Hilton Horizons Academy"
      steps={hiltonHorizonsAcademyWalkthroughPlaceholder}
    />
  );
}
