"use client";

import { luffLearningTeacherDemoConfig } from "@/data/school-demos/luff-learning-teacher-demo";
import SchoolTeacherDemoShell, {
  type TeacherDemoNavTab,
} from "@/components/demo/shared/SchoolTeacherDemoShell";

export type NavTab = TeacherDemoNavTab;

export default function TeacherDashboardDemo({
  initialTab = "dashboard",
  disableTour = false,
  hideNav = false,
  onMount,
}: {
  initialTab?: NavTab;
  disableTour?: boolean;
  hideNav?: boolean;
  onMount?: () => void;
}) {
  return (
    <SchoolTeacherDemoShell
      config={luffLearningTeacherDemoConfig}
      initialTab={initialTab}
      disableTour={disableTour}
      hideNav={hideNav}
      onMount={onMount}
    />
  );
}
