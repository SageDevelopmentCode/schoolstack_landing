import {
  buildAssignableClassroomGroups,
  buildAssignableClassroomPickerGroups,
  classroomAppliesToEnrollment,
  classroomAppliesToStudent,
  getAssignableClassrooms,
} from '@/lib/school-admin/assignable-classrooms';
import type { ClassroomSummary } from '@/lib/school-admin/classrooms';

function classroom(
  overrides: Partial<ClassroomSummary> & Pick<ClassroomSummary, 'id' | 'name'>,
): ClassroomSummary {
  return {
    programId: null,
    programName: null,
    status: 'open',
    studentCount: 0,
    staffCount: 0,
    leadTeacherNames: [],
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    ...overrides,
  };
}

describe('classroomAppliesToEnrollment', () => {
  it('allows org-wide classrooms for any enrollment program', () => {
    expect(classroomAppliesToEnrollment(null, 'program-1')).toBe(true);
    expect(classroomAppliesToEnrollment(null, null)).toBe(true);
  });

  it('requires program-specific classrooms to match enrollment program', () => {
    expect(classroomAppliesToEnrollment('program-1', 'program-1')).toBe(true);
    expect(classroomAppliesToEnrollment('program-1', 'program-2')).toBe(false);
  });
});

describe('getAssignableClassrooms', () => {
  const classrooms = [
    classroom({ id: 'classroom-a', name: 'Room A', programId: 'program-1', programName: 'Kindergarten' }),
    classroom({ id: 'classroom-b', name: 'Room B', programId: 'program-2', programName: 'First Grade' }),
    classroom({ id: 'classroom-org', name: 'Org Wide' }),
  ];

  it('returns program-specific and org-wide classrooms for matching enrollment', () => {
    const result = getAssignableClassrooms(classrooms, ['program-1']);
    expect(result.map((entry) => entry.id)).toEqual(['classroom-org', 'classroom-a']);
  });

  it('falls back to program names when ids are unavailable', () => {
    const result = getAssignableClassrooms(classrooms, [], ['Kindergarten']);
    expect(result.map((entry) => entry.id)).toEqual(['classroom-org', 'classroom-a']);
  });

  it('returns only org-wide classrooms when enrollment program has no specific match', () => {
    const result = getAssignableClassrooms(classrooms, ['program-3']);
    expect(result.map((entry) => entry.id)).toEqual(['classroom-org']);
  });
});

describe('buildAssignableClassroomPickerGroups', () => {
  const classrooms = [
    classroom({ id: 'classroom-a', name: 'Room A', programId: 'program-1', programName: 'Kindergarten' }),
    classroom({ id: 'classroom-b', name: 'Room B', programId: 'program-2', programName: 'Co-op' }),
    classroom({ id: 'classroom-org', name: 'Org Wide' }),
  ];

  it('groups assignable classrooms per enrolled program', () => {
    const groups = buildAssignableClassroomPickerGroups(
      classrooms,
      ['program-1', 'program-2'],
      ['Kindergarten', 'Co-op'],
    );

    expect(groups).toHaveLength(2);
    expect(groups[0]?.classrooms.map((entry) => entry.id)).toEqual(['classroom-org', 'classroom-a']);
    expect(groups[1]?.classrooms.map((entry) => entry.id)).toEqual(['classroom-org', 'classroom-b']);
  });

  it('includes org-wide classrooms in each program group', () => {
    const groups = buildAssignableClassroomGroups(
      [
        { id: 'program-1', name: 'Kindergarten' },
        { id: 'program-2', name: 'Co-op' },
      ],
      classrooms,
    );

    expect(groups[0]?.classrooms.some((entry) => entry.id === 'classroom-org')).toBe(true);
    expect(groups[1]?.classrooms.some((entry) => entry.id === 'classroom-org')).toBe(true);
  });
});

describe('classroomAppliesToStudent', () => {
  it('matches by program id when available', () => {
    const entry = classroom({
      id: 'classroom-a',
      name: 'Room A',
      programId: 'program-1',
      programName: 'Kindergarten',
    });

    expect(classroomAppliesToStudent(entry, ['program-1'])).toBe(true);
    expect(classroomAppliesToStudent(entry, ['program-2'])).toBe(false);
  });
});
