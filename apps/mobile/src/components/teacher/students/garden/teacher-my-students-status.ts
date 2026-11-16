import type { TeacherRosterScope } from '@/lib/teacher/teacher-students-utils';

/** Roster filter id for "students with health notes" (never a program name). */
export const HEALTH_NOTES_FILTER = '__health_notes__';

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

/**
 * My Students status line, built only from data:
 * "14 students · 2 with health notes · 3 classrooms" or, for the whole school,
 * "120 enrolled at your school · 4 need a teacher".
 */
export function myStudentsStatusLine({
  scope,
  total,
  healthCount,
  classroomCount,
  unassignedCount,
}: {
  scope: TeacherRosterScope;
  /** `null` while the school list hasn't loaded. */
  total: number | null;
  healthCount: number;
  classroomCount: number;
  unassignedCount: number;
}): string {
  if (total === null) return 'Loading every enrolled student…';
  if (scope === 'school') {
    if (total === 0) return 'No enrolled students at your school yet';
    const parts = [`${total} enrolled at your school`];
    if (unassignedCount > 0) {
      parts.push(`${unassignedCount} need${unassignedCount === 1 ? 's' : ''} a teacher`);
    }
    if (healthCount > 0) parts.push(`${healthCount} with health notes`);
    return parts.join(' · ');
  }
  if (total === 0) return 'No students assigned to you yet';
  const parts = [plural(total, 'student', 'students')];
  if (healthCount > 0) parts.push(`${healthCount} with health notes`);
  if (classroomCount > 0) parts.push(plural(classroomCount, 'classroom', 'classrooms'));
  return parts.join(' · ');
}

/** Toast after a number tile filters the list: "Showing 3 students with health notes". */
export function tileFilterAnnouncement(filter: string, count: number): string {
  const who = plural(count, 'student', 'students');
  if (filter === HEALTH_NOTES_FILTER) return `Showing ${who} with health notes`;
  if (filter === 'unassigned') return `Showing ${who} without a teacher`;
  if (filter === 'all') return `Showing all ${who}`;
  return `Showing ${who} in ${filter}`;
}
