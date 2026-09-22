"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { freedomPrepAcademyConfig } from "@/data/school-demos/freedom-prep-academy";
import { freedomPrepAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function FreedomPrepAcademyDemoPage() {
  return (
    <SchoolDemoShell
      config={freedomPrepAcademyConfig}
      schoolName="Freedom Prep"
      steps={freedomPrepAcademyWalkthroughPlaceholder}
    />
  );
}
