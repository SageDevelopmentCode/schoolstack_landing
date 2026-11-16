import type { GSegmentedItem } from '@/components/parent/garden/segmented';

export type TeacherHomeSubTabId = 'overview' | 'attendance' | 'help';

const OVERVIEW_TAB: GSegmentedItem<TeacherHomeSubTabId> = {
  id: 'overview',
  label: 'Overview',
  testID: 'teacher-home-tab-overview',
};

const ATTENDANCE_TAB: GSegmentedItem<TeacherHomeSubTabId> = {
  id: 'attendance',
  label: 'Attendance',
  testID: 'teacher-home-tab-attendance',
};

const HELP_TAB: GSegmentedItem<TeacherHomeSubTabId> = {
  id: 'help',
  label: 'Help',
  testID: 'teacher-home-tab-help',
};

/**
 * Home sub-tabs: Attendance sits between Overview and Help when the feature is on.
 * Text only: three equal tabs on a phone can't fit an icon + "Attendance" + a badge.
 */
export function resolveTeacherHomeSubTabs(
  attendanceEnabled: boolean,
  attendanceBadge?: number,
): GSegmentedItem<TeacherHomeSubTabId>[] {
  if (attendanceEnabled) {
    return [
      OVERVIEW_TAB,
      { ...ATTENDANCE_TAB, badge: attendanceBadge && attendanceBadge > 0 ? attendanceBadge : undefined },
      HELP_TAB,
    ];
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
