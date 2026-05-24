"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { athenaMicroacademyConfig } from "@/data/school-demos/athena-microacademy";
import { athenaWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function AthenaMicroacademyDemoPage() {
  return (
    <SchoolDemoShell
      config={athenaMicroacademyConfig}
      schoolName="Athena Micro-academy of Austin"
      steps={athenaWalkthroughPlaceholder}
    />
  );
}
