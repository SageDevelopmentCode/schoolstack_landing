"use client";

import type { SchoolTeacherDemoConfig } from "@/data/school-demos/demo-dashboard-types";
import SchoolTeacherDemoShell, {
  type SchoolTeacherDemoShellProps,
  type TeacherDemoNavTab,
} from "@/components/demo/shared/SchoolTeacherDemoShell";

export type { TeacherDemoNavTab as NavTab };

type SchoolTeacherDashboardDemoProps = Omit<SchoolTeacherDemoShellProps, "config"> & {
  config: SchoolTeacherDemoConfig;
};

export default function SchoolTeacherDashboardDemo(props: SchoolTeacherDashboardDemoProps) {
  return <SchoolTeacherDemoShell {...props} />;
}
