import {
  countMyTeachingWeeks,
  findNextTeachingWeek,
  formatTeachingAssignedParents,
  formatTeachingScheduleDateRange,
} from './teaching-schedule-helpers';

describe('teaching-schedule-helpers', () => {
  it('formatTeachingAssignedParents shows Open when unassigned', () => {
    expect(formatTeachingAssignedParents([])).toBe('Open');
  });

  it('formatTeachingAssignedParents joins family labels', () => {
    expect(formatTeachingAssignedParents(['fam-1', 'fam-2'], {
        'fam-1': 'Bramwell',
        'fam-2': 'Collins',
      })).toBe('Bramwell, Collins');
  });

  it('formatTeachingScheduleDateRange formats same-month ranges', () => {
    expect(formatTeachingScheduleDateRange('2026-09-14', '2026-09-18')).toBe('Sep 14 – 18, 2026');
  });
});

describe('findNextTeachingWeek', () => {
  const week = (id: string, startDate: string, endDate: string, assistant: string[] = []) => ({
    id,
    startDate,
    endDate,
    instructorFamilyIds: [],
    assistantFamilyIds: assistant,
    weekName: id,
    seasonalTheme: '',
    characterLesson: '',
    celebrationEvent: null,
  });

  it('returns the first week that has not ended', () => {
    const weeks = [week('c', '2026-12-07', '2026-12-11'), week('a', '2026-11-02', '2026-11-06'), week('b', '2026-11-30', '2026-12-04')];
    expect(findNextTeachingWeek(weeks, new Date('2026-11-27T12:00:00'))?.id).toBe('b');
    expect(findNextTeachingWeek(weeks, new Date('2027-01-01T12:00:00'))).toBe(null);
  });

  it('counts the family\'s weeks', () => {
    expect(countMyTeachingWeeks([week('a', '2026-11-02', '2026-11-06', ['me']), week('b', '2026-11-09', '2026-11-13')], 'me')).toBe(1);
  });
});
