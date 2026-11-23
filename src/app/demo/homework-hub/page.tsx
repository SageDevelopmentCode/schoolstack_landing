"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { homeworkHubConfig } from "@/data/school-demos/homework-hub";
import { homeworkHubWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/homework-hub";

export default function HomeworkHubDemoPage() {
  return (
    <SchoolDemoShell
      config={homeworkHubConfig}
      schoolName="Homework Hub"
      steps={homeworkHubWalkthroughPlaceholder}
    />
  );
}
