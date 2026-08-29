import {
  formatAssignedTeachersLabel,
  formatEnrolledStudentName,
  formatEnrolledStudentSubtitle,
  formatStaffMemberName,
  formatStudentGrade,
  normalizeEnrolledStudentSummary,
  studentStatusLabel,
} from '@/lib/school-admin/enrolled-students';

describe('formatEnrolledStudentName', () => {
  it('joins first and last name', () => {
    expect(formatEnrolledStudentName({ firstName: 'Alpha', lastName: 'Child' })).toBe(
      'Alpha Child',
    );
  });

  it('falls back when names are blank', () => {
    expect(formatEnrolledStudentName({ firstName: '', lastName: '' })).toBe('Student');
  });
});

describe('formatEnrolledStudentSubtitle', () => {
  it('joins multiple student names', () => {
    const alpha = formatEnrolledStudentName({ firstName: 'Alpha', lastName: 'Child' });
    const beta = formatEnrolledStudentName({ firstName: 'Beta', lastName: 'Child' });

    expect(formatEnrolledStudentSubtitle([
      {
        id: '1',
        firstName: 'Alpha',
        lastName: 'Child',
        grade: null,
        dateOfBirth: null,
        status: 'active',
        familyId: 'family-1',
        familyName: null,
        primaryContactName: null,
        primaryContactEmail: null,
        programNames: [],
        enrolledAt: '',
        assignedTeachers: [],
        assignedTeacherNames: '',
        profilePhotoUrl: null,
      },
      {
        id: '2',
        firstName: 'Beta',
        lastName: 'Child',
        grade: null,
        dateOfBirth: null,
        status: 'active',
        familyId: 'family-2',
        familyName: null,
        primaryContactName: null,
        primaryContactEmail: null,
        programNames: [],
        enrolledAt: '',
        assignedTeachers: [],
        assignedTeacherNames: '',
        profilePhotoUrl: null,
      },
    ])).toBe(`${alpha} · ${beta}`);
  });
});

describe('formatStudentGrade', () => {
  it('returns a friendly label for known grades', () => {
    expect(formatStudentGrade('k')).toBe('Kindergarten');
  });

  it('returns null for empty grades', () => {
    expect(formatStudentGrade(null)).toBeNull();
  });
});

describe('formatStaffMemberName', () => {
  it('joins staff names', () => {
    expect(formatStaffMemberName({ firstName: 'E2E', lastName: 'Staff' })).toBe('E2E Staff');
  });
});

describe('studentStatusLabel', () => {
  it('maps known statuses', () => {
    expect(studentStatusLabel('active')).toBe('Active');
    expect(studentStatusLabel('alumni')).toBe('Alumni');
  });
});

describe('formatAssignedTeachersLabel', () => {
  it('returns Unassigned when teachers is undefined', () => {
    expect(formatAssignedTeachersLabel(undefined)).toBe('Unassigned');
  });
});

describe('normalizeEnrolledStudentSummary', () => {
  it('maps legacy single-teacher fields to assignedTeachers', () => {
    const normalized = normalizeEnrolledStudentSummary({
      id: 'student-1',
      firstName: 'Alpha',
      lastName: 'Child',
      assignedTeacherId: 'staff-1',
      assignedTeacherName: 'E2E Staff',
    });

    expect(normalized.assignedTeachers).toEqual([{ id: 'staff-1', name: 'E2E Staff' }]);
    expect(normalized.assignedTeacherNames).toBe('E2E Staff');
  });

  it('defaults assignedTeachers to an empty array when teacher fields are missing', () => {
    const normalized = normalizeEnrolledStudentSummary({
      id: 'student-2',
      firstName: 'Beta',
      lastName: 'Child',
    });

    expect(normalized.assignedTeachers).toEqual([]);
    expect(normalized.assignedTeacherNames).toBe('');
  });
});
