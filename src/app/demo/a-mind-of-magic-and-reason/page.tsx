"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { aMindOfMagicAndReasonConfig } from "@/data/school-demos/a-mind-of-magic-and-reason";
import { aMindOfMagicAndReasonWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/a-mind-of-magic-and-reason";

export default function AMindOfMagicAndReasonDemoPage() {
  return (
    <SchoolDemoShell
      config={aMindOfMagicAndReasonConfig}
      schoolName="A Mind of Magic and Reason"
      steps={aMindOfMagicAndReasonWalkthroughPlaceholder}
    />
  );
}
