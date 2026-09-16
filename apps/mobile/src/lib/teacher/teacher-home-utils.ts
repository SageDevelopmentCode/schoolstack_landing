import type {
  StaffPortalRole,
  TeacherDashboardFocusIcon,
} from '@/lib/teacher/teacher-portal-api';
import { greetingParts, todayLabel } from '@/lib/parent/parent-home-utils';

export { greetingParts, todayLabel };

export function firstName(displayName: string): string {
  const part = displayName.trim().split(/\s+/).filter(Boolean)[0];
  return part ?? displayName;
}

export function staffKickerLabel(schoolName: string): string {
  return `${schoolName} staff`;
}

export function portalRoleLabel(role: StaffPortalRole | null): string {
  if (role === 'teacher') return 'Teacher';
  if (role === 'staff') return 'Staff';
  return 'Staff member';
}

export function focusItemIconBg(icon: TeacherDashboardFocusIcon): string {
  switch (icon) {
    case 'message':
      return '#E8F0F5';
    case 'calendar':
      return '#EEF7EF';
    case 'students':
      return '#FFF4D9';
    case 'signups':
      return '#E9F2EA';
    default:
      return '#E8F0F5';
  }
}

export function focusItemIconName(
  icon: TeacherDashboardFocusIcon,
): 'chatbubble-outline' | 'calendar-outline' | 'people-outline' | 'clipboard-outline' | 'ellipse-outline' {
  switch (icon) {
    case 'message':
      return 'chatbubble-outline';
    case 'calendar':
      return 'calendar-outline';
    case 'students':
      return 'people-outline';
    case 'signups':
      return 'clipboard-outline';
    default:
      return 'ellipse-outline';
  }
}

export function formatStudentGrade(grade: string | null): string | null {
  if (!grade?.trim()) return null;
  const trimmed = grade.trim();
  if (/^grade\s/i.test(trimmed)) return trimmed;
  return `Grade ${trimmed}`;
}

export function formatEnrolledStudentName(student: {
  firstName: string;
  lastName: string;
}): string {
  return [student.firstName, student.lastName].filter(Boolean).join(' ').trim() || 'Student';
}

export function studentSubtitleLine(student: {
  grade: string | null;
  programNames: string[];
}): string {
  const gradePart = formatStudentGrade(student.grade) ?? 'Grade not listed';
  const programPart = student.programNames.length > 0 ? student.programNames.join(', ') : null;
  return programPart ? `${gradePart} · ${programPart}` : gradePart;
}

export function childAccentBg(index: number): string {
  const palette = ['#E8F0F5', '#EEF7EF', '#FFF4D9', '#F3E8F5', '#E9F2EA', '#FCE8E8'];
  return palette[index % palette.length];
}

export function filterStudentsByClassroomName<T extends { classroomNames: string[] }>(
  students: T[],
  classroomName: string,
): T[] {
  const normalized = classroomName.trim().toLowerCase();
  return students.filter((student) =>
    student.classroomNames.some((name) => name.trim().toLowerCase() === normalized),
  );
}
