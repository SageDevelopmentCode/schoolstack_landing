import {
  availabilitySlotKey,
  classifyScheduledVisitTiming,
  parseAdmissionsTimeSlot,
  todayKeyInTimezone,
} from './admissions-availability';

describe('admissions-availability', () => {
  it('formats availability slot keys', () => {
    expect(availabilitySlotKey('2026-08-22', '9:00 AM')).toBe('2026-08-22|9:00 AM');
  });

  it('parses admissions time slots', () => {
    expect(parseAdmissionsTimeSlot('9:00 AM')).toBe(9 * 60);
    expect(parseAdmissionsTimeSlot('12:30 PM')).toBe(12 * 60 + 30);
    expect(parseAdmissionsTimeSlot('invalid')).toBeNull();
  });

  it('classifies visit timing in timezone', () => {
    const timezone = 'America/Denver';
    const today = todayKeyInTimezone(timezone);

    expect(
      classifyScheduledVisitTiming(
        {
          schedulingMode: 'time_slot',
          scheduledDate: today,
          startTimeSlot: '11:59 PM',
          durationMinutes: 30,
        },
        timezone,
        new Date(`${today}T12:00:00`),
      ),
    ).toBe('upcoming');

    expect(
      classifyScheduledVisitTiming(
        {
          schedulingMode: 'whole_day',
          scheduledDate: today,
          startTimeSlot: 'ALL_DAY',
          durationMinutes: 1440,
        },
        timezone,
      ),
    ).toBe('happening');
  });
});
