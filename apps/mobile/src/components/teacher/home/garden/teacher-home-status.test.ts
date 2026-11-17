import { teacherStatusLine } from '@/components/teacher/home/garden/teacher-home-status';

const roster = { totalStudents: 14, presentCount: 3, absentCount: 1, pickedUpCount: 1, notMarkedCount: 9 };

describe('teacherStatusLine', () => {
  it('counts focus items with singular and plural copy', () => {
    expect(teacherStatusLine({ focusCount: 1, attendance: null, clock: null })).toBe('1 thing needs you today');
    expect(teacherStatusLine({ focusCount: 3, attendance: null, clock: null })).toBe('3 things need you today');
    expect(teacherStatusLine({ focusCount: 0, attendance: null, clock: null })).toBe('Nothing urgent today');
  });

  it('adds attendance: not marked yet, then present once everyone is marked', () => {
    expect(teacherStatusLine({ focusCount: 0, attendance: roster, clock: null })).toBe(
      'Nothing urgent today · 9 of 14 not marked yet',
    );
    expect(
      teacherStatusLine({ focusCount: 0, attendance: { ...roster, notMarkedCount: 0, presentCount: 12 }, clock: null }),
    ).toBe('Nothing urgent today · 13 of 14 present');
  });

  it('skips attendance for an empty roster', () => {
    expect(
      teacherStatusLine({ focusCount: 0, attendance: { ...roster, totalStudents: 0 }, clock: null }),
    ).toBe('Nothing urgent today');
  });

  it('adds the clock state when My Hours is on', () => {
    expect(
      teacherStatusLine({ focusCount: 0, attendance: null, clock: { clockedIn: false, activeSessionStartedAt: null } }),
    ).toBe('Nothing urgent today · Not clocked in');
    const line = teacherStatusLine({
      focusCount: 0,
      attendance: null,
      clock: { clockedIn: true, activeSessionStartedAt: new Date(2026, 10, 16, 8, 2) },
    });
    expect(line).toMatch(/^Nothing urgent today · On the clock since 8:02/);
  });
});
