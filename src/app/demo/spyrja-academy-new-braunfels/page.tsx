"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { spyrjaAcademyNewBraunfelsConfig } from "@/data/school-demos/spyrja-academy-new-braunfels";
import { spyrjaAcademyNewBraunfelsWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/spyrja-academy-new-braunfels";

export default function SpyrjaAcademyNewBraunfelsDemoPage() {
  return (
    <SchoolDemoShell
      config={spyrjaAcademyNewBraunfelsConfig}
      schoolName="Spyrja Academy of New Braunfels"
      steps={spyrjaAcademyNewBraunfelsWalkthroughPlaceholder}
    />
  );
}
