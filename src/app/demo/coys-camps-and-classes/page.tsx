"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { coysCampsAndClassesConfig } from "@/data/school-demos/coys-camps-and-classes";
import { coysCampsAndClassesWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/coys-camps-and-classes";

export default function CoysCampsAndClassesDemoPage() {
  return (
    <SchoolDemoShell
      config={coysCampsAndClassesConfig}
      schoolName="Coy's Camps And Classes"
      steps={coysCampsAndClassesWalkthroughPlaceholder}
    />
  );
}
