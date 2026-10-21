import type { DetailTab } from '@/components/school-admin/detail-tab-bar';

export type TeacherHomeSubTabId = 'overview' | 'attendance' | 'help';

const OVERVIEW_TAB: DetailTab = { id: 'overview', label: 'Overview' };

const ATTENDANCE_TAB: DetailTab = {
  id: 'attendance',
  label: 'Attendance',
  icon: 'clipboard-outline',
  iconActive: 'clipboard',
};

const HELP_TAB: DetailTab = {
  id: 'help',
  label: 'Help',
  icon: 'help-circle-outline',
  iconActive: 'help-circle',
};

export function resolveTeacherHomeSubTabs(attendanceEnabled: boolean): DetailTab[] {
  if (attendanceEnabled) {
    return [OVERVIEW_TAB, ATTENDANCE_TAB, HELP_TAB];
  }
  return [OVERVIEW_TAB, HELP_TAB];
}

export function isTeacherHomeSubTabId(
  value: string,
  attendanceEnabled: boolean,
): value is TeacherHomeSubTabId {
  const tabs = resolveTeacherHomeSubTabs(attendanceEnabled);
  return tabs.some((tab) => tab.id === value);
}
