import type { AttendanceHistoryEntry } from '@/lib/attendance/attendance-types';
import {
  attendanceDayTimeline,
  attendanceMetaLine,
  attendanceNeighbours,
  attendanceRelativeDayLabel,
  attendanceStaffRecorder,
  attendanceWeekDayA11yLabel,
  buildAttendanceRecentWeeks,
  countAttendanceByStatus,
  filterAttendanceEntries,
  groupAttendanceEntriesByMonth,
} from '@/lib/parent/parent-attendance-garden';

function entry(
  date: string,
  status: AttendanceHistoryEntry['status'],
  overrides: Partial<AttendanceHistoryEntry> = {},
): AttendanceHistoryEntry {
  return {
    date,
    status,
    presentAt: null,
    absentAt: null,
    pickedUpAt: null,
    pickedUpByName: null,
    recordedByUserId: null,
    recordedByName: null,
    recordedByPhotoUrl: null,
    ...overrides,
  };
}

describe('parent-attendance-garden', () => {
  it('counts and filters by status', () => {
    const entries = [
      entry('2026-11-13', 'picked_up'),
      entry('2026-11-12', 'present'),
      entry('2026-11-11', 'absent'),
      entry('2026-11-10', 'present'),
    ];
    expect(countAttendanceByStatus(entries)).toEqual({ present: 2, absent: 1, picked_up: 1 });
    expect(filterAttendanceEntries(entries, 'all')).toHaveLength(4);
    expect(filterAttendanceEntries(entries, 'present').map((e) => e.date)).toEqual([
      '2026-11-12',
      '2026-11-10',
    ]);
  });

  it('groups consecutive entries by month in order', () => {
    const groups = groupAttendanceEntriesByMonth([
      entry('2026-11-03', 'present'),
      entry('2026-11-02', 'present'),
      entry('2026-10-31', 'absent'),
    ]);
    expect(groups.map((g) => [g.key, g.label, g.entries.length])).toEqual([
      ['2026-11', 'November 2026', 2],
      ['2026-10', 'October 2026', 1],
    ]);
  });

  it("builds a Mon–Fri grid ending with the latest record's week", () => {
    const weeks = buildAttendanceRecentWeeks(
      [entry('2026-11-13', 'present'), entry('2026-11-03', 'absent')],
      2,
    );
    expect(weeks).not.toBeNull();
    if (!weeks) return;
    expect(weeks.weekdays).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    expect(weeks.rows).toHaveLength(2);
    expect(weeks.rows[0].weekStartKey).toBe('2026-11-02');
    expect(weeks.rows[1].days[4].dateKey).toBe('2026-11-13');
    expect(weeks.rows[1].days[4].entry?.status).toBe('present');
    expect(weeks.rows[0].days[1].entry?.status).toBe('absent');
    expect(weeks.recordedDays).toBe(2);
    expect(weeks.rangeLabel).toBe('Nov 2 – Nov 13');
  });

  it('adds weekend columns only when a weekend day has a record', () => {
    const weeks = buildAttendanceRecentWeeks([entry('2026-11-14', 'present')], 1);
    expect(weeks?.weekdays).toHaveLength(7);
    expect(weeks?.rows[0].days[5].entry?.date).toBe('2026-11-14');
    expect(buildAttendanceRecentWeeks([], 4)).toBeNull();
  });

  it('describes the day as ordered steps', () => {
    const pickup = entry('2026-11-13', 'picked_up', {
      presentAt: '2026-11-13T08:02:00',
      pickedUpAt: '2026-11-13T15:15:00',
      pickedUpByName: 'Dana Lee',
    });
    expect(attendanceDayTimeline(pickup).map((s) => [s.key, s.time, s.detail])).toEqual([
      ['checked_in', '8:02 AM', null],
      ['picked_up', '3:15 PM', 'by Dana Lee'],
    ]);
    expect(attendanceDayTimeline(entry('2026-11-12', 'absent')).map((s) => s.key)).toEqual([
      'absent',
    ]);
    expect(attendanceDayTimeline(entry('2026-11-11', 'picked_up')).map((s) => s.key)).toEqual([
      'picked_up',
    ]);
  });

  it('formats meta lines, recorders and relative day labels', () => {
    const present = entry('2026-11-12', 'present', {
      presentAt: '2026-11-12T08:30:00',
      recordedByName: 'Ms. Rivera',
    });
    expect(attendanceMetaLine(present)).toBe('8:30 AM · Present');
    expect(attendanceMetaLine(entry('2026-11-12', 'absent'))).toBe('Absent');
    expect(attendanceStaffRecorder(present)?.name).toBe('Ms. Rivera');
    expect(attendanceStaffRecorder(entry('2026-11-12', 'absent'))?.name).toBe('School staff');
    expect(
      attendanceStaffRecorder(entry('2026-11-12', 'picked_up', { pickedUpByName: 'Dana' })),
    ).toBeNull();
    const now = new Date(2026, 10, 14, 10);
    expect(attendanceRelativeDayLabel('2026-11-14', now)).toBe('Today');
    expect(attendanceRelativeDayLabel('2026-11-13', now)).toBe('Yesterday');
    expect(attendanceRelativeDayLabel('2026-11-10', now)).toBe('Tue, Nov 10');
  });

  it('labels week cells and finds newer/older neighbours', () => {
    expect(
      attendanceWeekDayA11yLabel({
        dateKey: '2026-11-12',
        weekday: 'Thu',
        dayOfMonth: 12,
        entry: entry('2026-11-12', 'absent'),
      }),
    ).toBe('Thu, Nov 12, Absent. Open');
    expect(
      attendanceWeekDayA11yLabel({ dateKey: '2026-11-11', weekday: 'Wed', dayOfMonth: 11, entry: null }),
    ).toBe('Wed, Nov 11, no record');

    const entries = [
      entry('2026-11-13', 'present'),
      entry('2026-11-12', 'absent'),
      entry('2026-11-11', 'present'),
    ];
    expect(attendanceNeighbours(entries, '2026-11-12').newer?.date).toBe('2026-11-13');
    expect(attendanceNeighbours(entries, '2026-11-12').older?.date).toBe('2026-11-11');
    expect(attendanceNeighbours(entries, '2026-11-13').newer).toBeNull();
    expect(attendanceNeighbours(entries, 'nope')).toEqual({ newer: null, older: null });
  });
});
