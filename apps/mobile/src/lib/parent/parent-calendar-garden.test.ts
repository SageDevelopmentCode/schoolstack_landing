import {
  calendarLegend,
  calendarSummary,
  dayA11yLabel,
  dayDotColors,
  dayTapOutcome,
  formatDayHeading,
  isCurrentPeriod,
  monthGridDates,
  periodEventCount,
  periodKicker,
  pickSpotlight,
  pluralEvents,
} from '@/lib/parent/parent-calendar-garden';
import { dateKey, getWeekDates, parseEventDate } from '@/lib/school-events/calendar-utils';
import type { OrganizationEvent } from '@/lib/school-events/types';

function event(partial: Partial<OrganizationEvent> & { id: string; date: string }): OrganizationEvent {
  return {
    organizationId: 'org',
    title: `Event ${partial.id}`,
    isAllDay: false,
    type: 'academic',
    sortOrder: 0,
    ...partial,
  };
}

const TODAY = '2026-11-18'; // Wednesday
const week = getWeekDates(parseEventDate(TODAY));
const period = { selectedDate: TODAY, weekDates: week, year: 2026, month: 10 };

describe('dayTapOutcome', () => {
  it('keeps the existing empty and single-event behaviour, lists 2+', () => {
    expect(dayTapOutcome([])).toBe('empty');
    expect(dayTapOutcome([event({ id: 'a', date: TODAY })])).toBe('event');
    expect(dayTapOutcome([event({ id: 'a', date: TODAY }), event({ id: 'b', date: TODAY })])).toBe('list');
  });
});

describe('labels', () => {
  it('pluralises events', () => {
    expect(pluralEvents(1)).toBe('1 event');
    expect(pluralEvents(3)).toBe('3 events');
  });

  it('formats a day heading', () => {
    expect(formatDayHeading(TODAY)).toBe('Wednesday, Nov 18');
  });

  it('names a day cell for screen readers', () => {
    expect(dayA11yLabel(parseEventDate(TODAY), 2, TODAY)).toBe('Wednesday, November 18, 2 events, today');
    expect(dayA11yLabel(parseEventDate('2026-11-19'), 0, TODAY)).toBe('Thursday, November 19, no events');
  });

  it('picks a period kicker', () => {
    expect(periodKicker('day', true)).toBe('Today');
    expect(periodKicker('week', false)).toBe('Week of');
    expect(periodKicker('month', true)).toBe('This month');
  });
});

describe('periodEventCount / isCurrentPeriod', () => {
  const events = [
    event({ id: 'a', date: TODAY }),
    event({ id: 'b', date: '2026-11-21' }), // same week (Sat)
    event({ id: 'c', date: '2026-11-28' }), // same month, next week
    event({ id: 'd', date: '2026-12-02' }), // next month
  ];

  it('counts per view', () => {
    expect(periodEventCount(events, 'day', period)).toBe(1);
    expect(periodEventCount(events, 'week', period)).toBe(2);
    expect(periodEventCount(events, 'month', period)).toBe(3);
  });

  it('knows when today is in view', () => {
    expect(isCurrentPeriod('day', TODAY, period)).toBe(true);
    expect(isCurrentPeriod('day', TODAY, { ...period, selectedDate: '2026-11-19' })).toBe(false);
    expect(isCurrentPeriod('week', TODAY, period)).toBe(true);
    expect(isCurrentPeriod('month', TODAY, { ...period, month: 11 })).toBe(false);
  });
});

describe('calendarSummary', () => {
  it('describes a busy current week', () => {
    expect(calendarSummary({ view: 'week', count: 2, current: true, periodLabel: 'Nov 15 – 21' })).toBe(
      '2 events this week · tap a day or event for details.',
    );
  });

  it('describes an empty other month', () => {
    expect(calendarSummary({ view: 'month', count: 0, current: false, periodLabel: 'December 2026' })).toBe(
      'Nothing on the calendar in December 2026 — tap any day to see its details.',
    );
  });

  it('points an empty day toward Week / Month', () => {
    expect(calendarSummary({ view: 'day', count: 0, current: true, periodLabel: 'x' })).toMatch(/Week or Month/);
  });
});

describe('pickSpotlight', () => {
  it('prefers an event today', () => {
    const upcoming = [event({ id: 'a', date: TODAY }), event({ id: 'b', date: '2026-11-20' })];
    expect(pickSpotlight(upcoming, TODAY)).toEqual({ event: upcoming[0], isToday: true });
  });

  it('falls back to the next one', () => {
    const upcoming = [event({ id: 'b', date: '2026-11-20' })];
    expect(pickSpotlight(upcoming, TODAY)).toEqual({ event: upcoming[0], isToday: false });
    expect(pickSpotlight([], TODAY)).toBeNull();
  });
});

describe('legend + dots', () => {
  it('lists each type once, sorted by label', () => {
    const legend = calendarLegend([
      event({ id: 'c', date: TODAY, type: 'no_school' }),
      event({ id: 'a', date: TODAY, type: 'field_trip' }),
      event({ id: 'b', date: TODAY, type: 'field_trip' }),
    ]);
    expect(legend.map((item) => item.label)).toEqual(['Field trip', 'No school']);
    expect(legend[0].colors).toHaveLength(1);
  });

  it('shows every colour a school uses for one type', () => {
    const legend = calendarLegend([
      event({ id: 'a', date: TODAY, type: 'community', colorKey: 'teal' }),
      event({ id: 'b', date: TODAY, type: 'community', colorKey: 'olive' }),
      event({ id: 'c', date: TODAY, type: 'community', colorKey: 'teal' }),
    ]);
    expect(legend).toHaveLength(1);
    expect(legend[0].colors).toHaveLength(2);
  });

  it('caps distinct dot colours', () => {
    const many = (['field_trip', 'no_school', 'community', 'academic'] as const).map((type, i) =>
      event({ id: String(i), date: TODAY, type }),
    );
    expect(dayDotColors(many)).toHaveLength(3);
    expect(dayDotColors(undefined)).toEqual([]);
  });
});

describe('monthGridDates', () => {
  it('starts on a Sunday and covers the whole month', () => {
    const cells = monthGridDates(2026, 10); // November 2026 starts on a Sunday
    expect(cells[0].getDay()).toBe(0);
    expect(cells.length % 7).toBe(0);
    expect(cells.map(dateKey)).toContain('2026-11-30');
    expect(dateKey(cells[0])).toBe('2026-11-01');
  });

  it('pads with the previous month', () => {
    const cells = monthGridDates(2026, 11); // December 2026 starts on a Tuesday
    expect(dateKey(cells[0])).toBe('2026-11-29');
  });
});
