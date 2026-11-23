"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { innovationAcademyLasVegasConfig } from "@/data/school-demos/innovation-academy-las-vegas";
import { innovationAcademyLasVegasWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/innovation-academy-las-vegas";

export default function InnovationAcademyLasVegasDemoPage() {
  return (
    <SchoolDemoShell
      config={innovationAcademyLasVegasConfig}
      schoolName="Innovation Academy"
      steps={innovationAcademyLasVegasWalkthroughPlaceholder}
    />
  );
}
