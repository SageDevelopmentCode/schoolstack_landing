"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { creationAcresConfig } from "@/data/school-demos/creation-acres";
import { creationAcresWalkthroughPlaceholder } from "@/data/school-demos/walkthrough-placeholder";

export default function CreationAcresDemoPage() {
  return (
    <SchoolDemoShell
      config={creationAcresConfig}
      schoolName="Creation Acres Montessori"
      steps={creationAcresWalkthroughPlaceholder}
    />
  );
}
