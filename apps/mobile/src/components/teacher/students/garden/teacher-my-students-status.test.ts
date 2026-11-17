import {
  HEALTH_NOTES_FILTER,
  myStudentsStatusLine,
  tileFilterAnnouncement,
} from '@/components/teacher/students/garden/teacher-my-students-status';

describe('myStudentsStatusLine', () => {
  it('describes the assigned roster from data only', () => {
    expect(
      myStudentsStatusLine({ scope: 'assigned', total: 14, healthCount: 2, classroomCount: 3, unassignedCount: 0 }),
    ).toBe('14 students · 2 with health notes · 3 classrooms');
    expect(
      myStudentsStatusLine({ scope: 'assigned', total: 1, healthCount: 0, classroomCount: 1, unassignedCount: 0 }),
    ).toBe('1 student · 1 classroom');
    expect(
      myStudentsStatusLine({ scope: 'assigned', total: 0, healthCount: 0, classroomCount: 0, unassignedCount: 0 }),
    ).toBe('No students assigned to you yet');
  });

  it('describes the whole school, including students without a teacher', () => {
    expect(
      myStudentsStatusLine({ scope: 'school', total: 120, healthCount: 5, classroomCount: 0, unassignedCount: 4 }),
    ).toBe('120 enrolled at your school · 4 need a teacher · 5 with health notes');
    expect(
      myStudentsStatusLine({ scope: 'school', total: 9, healthCount: 0, classroomCount: 0, unassignedCount: 1 }),
    ).toBe('9 enrolled at your school · 1 needs a teacher');
    expect(
      myStudentsStatusLine({ scope: 'school', total: null, healthCount: 0, classroomCount: 0, unassignedCount: 0 }),
    ).toBe('Loading every enrolled student…');
  });
});

describe('tileFilterAnnouncement', () => {
  it('names what the list now shows', () => {
    expect(tileFilterAnnouncement(HEALTH_NOTES_FILTER, 3)).toBe('Showing 3 students with health notes');
    expect(tileFilterAnnouncement('unassigned', 1)).toBe('Showing 1 student without a teacher');
    expect(tileFilterAnnouncement('all', 14)).toBe('Showing all 14 students');
    expect(tileFilterAnnouncement('Primary', 6)).toBe('Showing 6 students in Primary');
  });
});
