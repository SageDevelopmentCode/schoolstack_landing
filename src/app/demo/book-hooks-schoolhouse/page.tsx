"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { bookHooksSchoolhouseConfig } from "@/data/school-demos/book-hooks-schoolhouse";
import { bookHooksSchoolhouseWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/book-hooks-schoolhouse";

export default function BookHooksSchoolhouseDemoPage() {
  return (
    <SchoolDemoShell
      config={bookHooksSchoolhouseConfig}
      schoolName="The Book Hooks Schoolhouse"
      steps={bookHooksSchoolhouseWalkthroughPlaceholder}
    />
  );
}
