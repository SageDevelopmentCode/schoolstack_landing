"use client";

import SchoolTeacherDemoShell, {
  type TeacherDemoNavTab,
} from "@/components/demo/shared/SchoolTeacherDemoShell";
import { sagefieldTeacherDemoConfig } from "@/data/school-demos/sagefield-teacher-demo";

export type NavTab = TeacherDemoNavTab;

export default function SagefieldTeacherDashboardDemo({
  initialTab = "dashboard",
  disableTour = false,
  hideNav = false,
}: {
  initialTab?: NavTab;
  disableTour?: boolean;
  hideNav?: boolean;
}) {
  return (
    <SchoolTeacherDemoShell
      config={sagefieldTeacherDemoConfig}
      initialTab={initialTab}
      disableTour={disableTour}
      hideNav={hideNav}
    />
  );
}
