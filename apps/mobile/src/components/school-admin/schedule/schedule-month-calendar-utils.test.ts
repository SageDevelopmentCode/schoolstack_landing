import { buildMonthCalendarWeeks } from '@/components/school-admin/schedule/schedule-month-calendar-utils';

describe('buildMonthCalendarWeeks', () => {
  it('aligns August 1 2026 with Saturday (column index 6)', () => {
    const weeks = buildMonthCalendarWeeks(2026, 7);

    expect(weeks).toHaveLength(6);
    expect(weeks.every((week) => week.length === 7)).toBe(true);

    const firstWeek = weeks[0]!;
    expect(firstWeek.filter((day) => day == null)).toHaveLength(6);
    expect(firstWeek[6]).toBe(1);

    const saturdayDates = weeks.map((week) => week[6]).filter((day): day is number => day != null);
    expect(saturdayDates).toEqual([1, 8, 15, 22, 29]);
  });

  it('pads trailing cells so each week has 7 entries', () => {
    const weeks = buildMonthCalendarWeeks(2026, 1);

    const flat = weeks.flat();
    expect(flat.length % 7).toBe(0);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
  });
});
