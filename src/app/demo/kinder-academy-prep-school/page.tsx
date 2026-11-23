"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { kinderAcademyPrepSchoolConfig } from "@/data/school-demos/kinder-academy-prep-school";
import { kinderAcademyPrepSchoolWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/kinder-academy-prep-school";

export default function KinderAcademyPrepSchoolDemoPage() {
  return (
    <SchoolDemoShell
      config={kinderAcademyPrepSchoolConfig}
      schoolName="Kinder Academy Prep School"
      steps={kinderAcademyPrepSchoolWalkthroughPlaceholder}
    />
  );
}
