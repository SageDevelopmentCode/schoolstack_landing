"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { invictusLeanderConfig } from "@/data/school-demos/invictus-leander";
import { invictusLeanderWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/invictus-leander";

export default function InvictusLeanderDemoPage() {
  return (
    <SchoolDemoShell
      config={invictusLeanderConfig}
      schoolName="Invictus: An Acton Academy"
      steps={invictusLeanderWalkthroughPlaceholder}
    />
  );
}
