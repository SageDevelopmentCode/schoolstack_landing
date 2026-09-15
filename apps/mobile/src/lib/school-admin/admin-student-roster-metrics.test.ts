import {
  deriveStudentRosterMetrics,
  filterStudentsByRosterFilter,
  isRecentEnrollment,
  isStudentUnassigned,
  matchesStudentSearch,
} from '@/lib/school-admin/admin-student-roster-metrics';
import type { AdminEnrolledStudentSummary } from '@/lib/school-admin/enrolled-students';

function student(
  overrides: Partial<AdminEnrolledStudentSummary> = {},
): AdminEnrolledStudentSummary {
  return {
    id: 'student-1',
    firstName: 'Arrow',
    lastName: 'Calvert',
    grade: '1',
    dateOfBirth: '2019-10-23',
    status: 'active',
    familyId: 'family-1',
    familyName: 'Calvert Family',
    primaryContactName: 'Hayley Calvert',
    primaryContactEmail: 'parent@example.com',
    programNames: ['School Year 2026–27'],
    programIds: ['program-1'],
    classroomNames: ['Meadow Room'],
    classroomIds: ['classroom-1'],
    enrolledAt: '2026-08-01T00:00:00.000Z',
    assignedTeachers: [],
    assignedTeacherNames: '',
    profilePhotoUrl: null,
    hasStandingHealthItems: false,
    ...overrides,
  };
}

describe('admin-student-roster-metrics', () => {
  it('derives roster metrics', () => {
    const nowMs = Date.parse('2026-08-15T00:00:00.000Z');
    const metrics = deriveStudentRosterMetrics(
      [
        student(),
        student({
          id: 'student-2',
          assignedTeachers: [{ id: 'staff-1', name: 'Teacher One' }],
          assignedTeacherNames: 'Teacher One',
          programNames: ['Summer Program'],
        }),
      ],
      nowMs,
    );

    expect(metrics.totalCount).toBe(2);
    expect(metrics.unassignedCount).toBe(1);
    expect(metrics.programCount).toBe(2);
    expect(metrics.newEnrollmentCount).toBe(2);
    expect(metrics.programOptions).toEqual([
      ['School Year 2026–27', 'School Year 2026–27'],
      ['Summer Program', 'Summer Program'],
    ]);
  });

  it('filters unassigned and program rows', () => {
    const rows = [
      student(),
      student({
        id: 'student-2',
        assignedTeachers: [{ id: 'staff-1', name: 'Teacher One' }],
        programNames: ['Summer Program'],
      }),
    ];

    expect(filterStudentsByRosterFilter(rows, 'unassigned').length).toBe(1);
    expect(filterStudentsByRosterFilter(rows, 'Summer Program').length).toBe(1);
  });

  it('detects recent enrollments within 30 days', () => {
    const nowMs = Date.parse('2026-08-15T00:00:00.000Z');
    expect(isRecentEnrollment('2026-08-01T00:00:00.000Z', nowMs)).toBe(true);
    expect(isRecentEnrollment('2026-06-01T00:00:00.000Z', nowMs)).toBe(false);
  });

  it('matches search across family and classroom fields', () => {
    const row = student();
    expect(matchesStudentSearch(row, 'meadow room')).toBe(true);
    expect(matchesStudentSearch(row, 'missing')).toBe(false);
  });

  it('identifies unassigned students', () => {
    expect(isStudentUnassigned(student())).toBe(true);
    expect(
      isStudentUnassigned(
        student({ assignedTeachers: [{ id: 'staff-1', name: 'Teacher One' }] }),
      ),
    ).toBe(false);
    expect(
      isStudentUnassigned(
        student({
          classroomNames: ['Meadow Room'],
          classroomIds: ['classroom-1'],
          assignedTeachers: [{ id: 'staff-1', name: 'Teacher One' }],
        }),
      ),
    ).toBe(false);
    expect(
      isStudentUnassigned(
        student({
          classroomNames: ['Meadow Room'],
          classroomIds: ['classroom-1'],
          assignedTeachers: [],
        }),
      ),
    ).toBe(true);
  });
});
