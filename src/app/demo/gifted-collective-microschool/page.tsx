"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { giftedCollectiveMicroschoolConfig } from "@/data/school-demos/gifted-collective-microschool";
import { giftedCollectiveMicroschoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/gifted-collective-microschool";

export default function GiftedCollectiveMicroschoolDemoPage() {
  return (
    <SchoolDemoShell
      config={giftedCollectiveMicroschoolConfig}
      schoolName="Gifted Microschool at The Gifted Collective"
      steps={giftedCollectiveMicroschoolWalkthroughPlaceholder}
    />
  );
}
