"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { choiceActonAcademyConfig } from "@/data/school-demos/choice-acton-academy";
import { choiceActonAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/choice-acton-academy";

export default function ChoiceActonAcademyDemoPage() {
  return (
    <SchoolDemoShell
      config={choiceActonAcademyConfig}
      schoolName="CHOICE: An Acton Academy"
      steps={choiceActonAcademyWalkthroughPlaceholder}
    />
  );
}
