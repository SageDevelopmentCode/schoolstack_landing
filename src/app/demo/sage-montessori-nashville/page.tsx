"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { sageMontessoriNashvilleConfig } from "@/data/school-demos/sage-montessori-nashville";
import { sageMontessoriNashvilleWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/sage-montessori-nashville";

export default function SageMontessoriNashvilleDemoPage() {
  return (
    <SchoolDemoShell
      config={sageMontessoriNashvilleConfig}
      schoolName="Sage Montessori School of Nashville"
      steps={sageMontessoriNashvilleWalkthroughPlaceholder}
    />
  );
}
