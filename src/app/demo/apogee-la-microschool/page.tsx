"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { apogeeLaMicroschoolConfig } from "@/data/school-demos/apogee-la-microschool";
import { apogeeLaMicroschoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/apogee-la-microschool";

export default function ApogeeLaMicroschoolDemoPage() {
  return (
    <SchoolDemoShell
      config={apogeeLaMicroschoolConfig}
      schoolName="Apogee LA"
      steps={apogeeLaMicroschoolWalkthroughPlaceholder}
    />
  );
}
