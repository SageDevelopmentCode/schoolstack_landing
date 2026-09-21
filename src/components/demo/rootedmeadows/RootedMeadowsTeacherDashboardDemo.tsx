"use client";

import DemoTeacherAttendancePage from "@/components/demo/shared/DemoTeacherAttendancePage";
import DemoTeacherMyStudentsPage from "@/components/demo/shared/DemoTeacherMyStudentsPage";
import SchoolTeacherDemoShell, {
  type TeacherDemoNavTab,
} from "@/components/demo/shared/SchoolTeacherDemoShell";
import { rootedMeadowsTeacherDemoConfig } from "@/data/school-demos/rootedmeadows-teacher-demo";
import { applyTeacherDemoRuntime } from "@/components/demo/shared/teacher-demo-runtime";

export type NavTab = TeacherDemoNavTab;

export function RootedMeadowsTeacherStudentsMobilePreview() {
  applyTeacherDemoRuntime(rootedMeadowsTeacherDemoConfig);
  return (
    <DemoTeacherMyStudentsPage
      initialSelectedStudentId="student-emma"
    />
  );
}

export function RootedMeadowsTeacherAttendanceMobilePreview() {
  applyTeacherDemoRuntime(rootedMeadowsTeacherDemoConfig);
  return <DemoTeacherAttendancePage />;
}

export default function RootedMeadowsTeacherDashboardDemo({
  initialTab = "dashboard",
  disableTour = false,
  hideNav = false,
  initialSelectedStudentId,
  openInitialStudentDetailDelayMs,
}: {
  initialTab?: NavTab;
  disableTour?: boolean;
  hideNav?: boolean;
  initialSelectedStudentId?: string;
  openInitialStudentDetailDelayMs?: number;
}) {
  return (
    <SchoolTeacherDemoShell
      config={rootedMeadowsTeacherDemoConfig}
      initialTab={initialTab}
      disableTour={disableTour}
      hideNav={hideNav}
      initialSelectedStudentId={initialSelectedStudentId}
      openInitialStudentDetailDelayMs={openInitialStudentDetailDelayMs}
    />
  );
}
