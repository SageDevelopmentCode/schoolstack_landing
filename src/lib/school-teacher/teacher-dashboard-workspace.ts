export type TeacherDashboardWorkspaceTab = "attendance" | "classrooms" | "students";

export type TeacherDashboardWorkspaceTabConfig = {
  key: TeacherDashboardWorkspaceTab;
  label: string;
};

const WORKSPACE_TAB_CONFIG: TeacherDashboardWorkspaceTabConfig[] = [
  { key: "attendance", label: "Attendance" },
  { key: "classrooms", label: "Classrooms" },
  { key: "students", label: "Your students" },
];

export function resolveTeacherDashboardWorkspaceTabs({
  showAttendanceSection,
  myStudentsEnabled,
  classroomCount,
}: {
  showAttendanceSection: boolean;
  myStudentsEnabled: boolean;
  classroomCount: number;
}): {
  tabs: TeacherDashboardWorkspaceTabConfig[];
  defaultTab: TeacherDashboardWorkspaceTab | null;
} {
  const visibleKeys = new Set<TeacherDashboardWorkspaceTab>();

  if (showAttendanceSection) {
    visibleKeys.add("attendance");
  }
  if (myStudentsEnabled && classroomCount > 0) {
    visibleKeys.add("classrooms");
  }
  if (myStudentsEnabled) {
    visibleKeys.add("students");
  }

  const tabs = WORKSPACE_TAB_CONFIG.filter((tab) => visibleKeys.has(tab.key));
  const defaultTab = tabs[0]?.key ?? null;

  return { tabs, defaultTab };
}
