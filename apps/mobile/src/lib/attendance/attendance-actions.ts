import type { Ionicons } from '@expo/vector-icons';

import type { AttendanceRosterStatus } from '@/lib/attendance/attendance-types';
import type { StoryChipTone } from '@/components/story/story-chip';

export type AttendanceActionType =
  | 'mark_present'
  | 'mark_present_again'
  | 'mark_absent'
  | 'record_pickup'
  | 'picked_up';

const ACTION_CONFIG: Record<
  AttendanceActionType,
  { label: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  mark_present: { label: 'Mark Present', icon: 'checkmark-circle-outline' },
  mark_present_again: { label: 'Mark Present again', icon: 'checkmark-circle-outline' },
  mark_absent: { label: 'Mark Absent', icon: 'close-circle-outline' },
  record_pickup: { label: 'Record Pickup', icon: 'log-out-outline' },
  picked_up: { label: 'Picked up', icon: 'checkmark-done-outline' },
};

export function attendancePrimaryActionType(
  status: AttendanceRosterStatus,
): AttendanceActionType {
  if (status === 'present') return 'record_pickup';
  if (status === 'picked_up') return 'picked_up';
  return 'mark_present';
}

export function attendanceActionLabel(action: AttendanceActionType): string {
  return ACTION_CONFIG[action].label;
}

export function attendanceActionIcon(
  action: AttendanceActionType,
): keyof typeof Ionicons.glyphMap {
  return ACTION_CONFIG[action].icon;
}

export function attendanceStatusLabel(status: AttendanceRosterStatus): string {
  switch (status) {
    case 'present':
      return 'Present';
    case 'absent':
      return 'Absent';
    case 'picked_up':
      return 'Picked up';
    case 'not_marked':
      return 'Not marked';
  }
}

export function attendanceStatusTone(status: AttendanceRosterStatus): StoryChipTone {
  switch (status) {
    case 'present':
      return 'success';
    case 'absent':
      return 'alert';
    case 'picked_up':
      return 'info';
    case 'not_marked':
      return 'warning';
  }
}

export function formatDashboardAttendanceSubcopy(
  summary: {
    totalStudents: number;
    presentCount: number;
    pickedUpCount: number;
  },
): string {
  const presentOrPickedUp = summary.presentCount + summary.pickedUpCount;
  const learnerLabel = summary.totalStudents === 1 ? 'student' : 'students';

  if (summary.totalStudents === 0) {
    return "No attendance-enabled students on today's roster.";
  }

  return `${presentOrPickedUp} of ${summary.totalStudents} ${learnerLabel} present`;
}
