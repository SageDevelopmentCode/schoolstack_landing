import { adjustmentSessionsOverlap } from '@/lib/teacher/my-hours/adjustment-sessions';

import {
  draftSummary,
  minutesFromTime,
  sessionMinutes,
  validateAdjustmentSessions,
} from './adjust-validation';

const s = (key: string, clockIn: string, clockOut: string) => ({ key, clockIn, clockOut });

describe('validateAdjustmentSessions', () => {
  it('accepts a single valid session and totals it', () => {
    const result = validateAdjustmentSessions([s('a', '08:00', '15:00')]);
    expect(result.valid).toBe(true);
    expect(result.errors.a).toBeNull();
    expect(result.totalMinutes).toBe(420);
  });

  it('flags a clock-out before or equal to clock-in', () => {
    const result = validateAdjustmentSessions([s('a', '15:00', '08:00'), s('b', '09:00', '09:00')]);
    expect(result.valid).toBe(false);
    expect(result.errors.a).toBe('Clock out must be after clock in.');
    expect(result.errors.b).toBe('Clock out must be after clock in.');
  });

  it('names the session each overlapping session collides with', () => {
    const result = validateAdjustmentSessions([
      s('a', '08:00', '12:00'),
      s('b', '13:00', '15:00'),
      s('c', '11:00', '13:30'),
    ]);
    expect(result.valid).toBe(false);
    expect(result.errors.a).toBe('Overlaps session 3.');
    expect(result.errors.b).toBe('Overlaps session 3.');
    expect(result.errors.c).toBe('Overlaps session 1.');
  });

  it('allows back-to-back sessions', () => {
    const result = validateAdjustmentSessions([s('a', '08:00', '12:00'), s('b', '12:00', '15:00')]);
    expect(result.valid).toBe(true);
    expect(result.totalMinutes).toBe(420);
  });

  it('matches the old save rule (no invalid session, no overlap)', () => {
    const cases = [
      [s('a', '08:00', '12:00'), s('b', '11:59', '13:00')],
      [s('a', '08:00', '12:00'), s('b', '14:00', '13:00')],
      [s('a', '07:15', '09:45'), s('b', '10:00', '11:00'), s('c', '12:00', '15:30')],
      [s('a', '00:00', '23:59')],
    ];
    for (const sessions of cases) {
      const oldValid =
        !sessions.some((session) => sessionMinutes(session.clockIn, session.clockOut) == null) &&
        !adjustmentSessionsOverlap(sessions);
      expect(validateAdjustmentSessions(sessions).valid).toBe(oldValid);
    }
  });
});

describe('time helpers', () => {
  it('parses HH:mm and rejects out-of-range values', () => {
    expect(minutesFromTime('8:05')).toBe(485);
    expect(minutesFromTime('24:00')).toBeNull();
    expect(minutesFromTime('nope')).toBeNull();
  });

  it('summarises multi-session drafts', () => {
    expect(
      draftSummary([
        { clockIn: '08:00', clockOut: '12:00' },
        { clockIn: '13:00', clockOut: '15:30' },
      ]),
    ).toBe('6h 30m · 2 sessions');
  });
});
