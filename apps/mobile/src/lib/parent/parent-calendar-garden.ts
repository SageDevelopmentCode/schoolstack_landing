import type { GChipTone } from '@/components/parent/garden/tokens';
import { dateKey, parseEventDate } from '@/lib/school-events/calendar-utils';
import { getEventDisplayStyle, SCHOOL_EVENT_TYPE_LABELS } from '@/lib/school-events/event-labels';
import type { OrganizationEvent, SchoolEventType } from '@/lib/school-events/types';

/*
 * Pure helpers for the Garden parent Calendar (mobile). Copy matches the web
 * Garden calendar (`src/components/school-parent/calendar/ParentCalendarPage.tsx`).
 */

export type CalendarViewMode = 'day' | 'week' | 'month';

/** What a tap on a day in Week / Month view opens. */
export type DayTapOutcome = 'empty' | 'event' | 'list';

/**
 * 0 events → empty-day sheet, 1 → that event's sheet (both unchanged from the
 * Story screen), 2+ → a day sheet listing them so none are hidden.
 */
export function dayTapOutcome(events: readonly OrganizationEvent[]): DayTapOutcome {
  if (events.length === 0) return 'empty';
  if (events.length === 1) return 'event';
  return 'list';
}

export function pluralEvents(count: number): string {
  return count === 1 ? '1 event' : `${count} events`;
}

/** "Tuesday, Nov 18" */
export function formatDayHeading(date: string): string {
  return parseEventDate(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

/** Screen-reader name for a day cell: "Tuesday, November 18, 2 events, today". */
export function dayA11yLabel(day: Date, count: number, todayKey: string): string {
  const label = day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const events = count === 0 ? 'no events' : pluralEvents(count);
  return `${label}, ${events}${dateKey(day) === todayKey ? ', today' : ''}`;
}

/** Events in the visible period (day, week or month). */
export function periodEventCount(
  events: readonly OrganizationEvent[],
  view: CalendarViewMode,
  period: { selectedDate: string | null; weekDates: Date[]; year: number; month: number },
): number {
  if (view === 'day') {
    return period.selectedDate ? events.filter((e) => e.date === period.selectedDate).length : 0;
  }
  if (view === 'week') {
    const keys = new Set(period.weekDates.map(dateKey));
    return events.filter((e) => keys.has(e.date)).length;
  }
  const prefix = `${period.year}-${String(period.month + 1).padStart(2, '0')}-`;
  return events.filter((e) => e.date.startsWith(prefix)).length;
}

/** Whether the visible period contains today. */
export function isCurrentPeriod(
  view: CalendarViewMode,
  todayKey: string,
  period: { selectedDate: string | null; weekDates: Date[]; year: number; month: number },
): boolean {
  if (view === 'day') return period.selectedDate === todayKey;
  if (view === 'week') return period.weekDates.some((d) => dateKey(d) === todayKey);
  const today = parseEventDate(todayKey);
  return today.getFullYear() === period.year && today.getMonth() === period.month;
}

const UNIT: Record<CalendarViewMode, string> = { day: 'day', week: 'week', month: 'month' };

export function periodUnit(view: CalendarViewMode): string {
  return UNIT[view];
}

/** Kicker above the period label: "Today" / "This week" / "Week of" … */
export function periodKicker(view: CalendarViewMode, current: boolean): string {
  if (view === 'day') return current ? 'Today' : 'Selected day';
  if (view === 'week') return current ? 'This week' : 'Week of';
  return current ? 'This month' : 'Month';
}

/** Live one-liner under the header. */
export function calendarSummary({
  view,
  count,
  current,
  periodLabel,
}: {
  view: CalendarViewMode;
  count: number;
  current: boolean;
  periodLabel: string;
}): string {
  const where =
    view === 'day'
      ? current
        ? 'today'
        : `on ${periodLabel}`
      : current
        ? `this ${UNIT[view]}`
        : `in ${periodLabel}`;
  if (count === 0) {
    return view === 'day'
      ? `Nothing on the calendar ${where} — try Week or Month to look ahead.`
      : `Nothing on the calendar ${where} — tap any day to see its details.`;
  }
  return `${pluralEvents(count)} ${where} · tap ${view === 'day' ? 'an event' : 'a day or event'} for details.`;
}

/**
 * The one event worth surfacing above the calendar: today's first event, or
 * else the next upcoming one. `upcoming` is already sorted (agenda order).
 */
export function pickSpotlight(
  upcoming: readonly OrganizationEvent[],
  todayKey: string,
): { event: OrganizationEvent; isToday: boolean } | null {
  const first = upcoming[0];
  if (!first) return null;
  const todays = upcoming.find((e) => e.date === todayKey);
  if (todays) return { event: todays, isToday: true };
  return { event: first, isToday: false };
}

/** Story chip tones → Garden chip tones (same names; kept explicit for type safety). */
export function eventTypeGardenTone(type: SchoolEventType): GChipTone {
  switch (type) {
    case 'field_trip':
      return 'success';
    case 'no_school':
      return 'alert';
    case 'community':
      return 'warning';
    case 'academic':
    case 'other':
    default:
      return 'info';
  }
}

export type CalendarLegendItem = { type: SchoolEventType; label: string; colors: string[] };

/**
 * One legend entry per event type, with every colour the school uses for it
 * (schools can colour events individually), sorted by label. Web parity:
 * `GardenCalendarLegend`.
 */
export function calendarLegend(events: readonly OrganizationEvent[]): CalendarLegendItem[] {
  const byType = new Map<SchoolEventType, CalendarLegendItem>();
  for (const event of events) {
    const color = getEventDisplayStyle(event).text;
    const entry = byType.get(event.type);
    if (!entry) {
      byType.set(event.type, { type: event.type, label: SCHOOL_EVENT_TYPE_LABELS[event.type], colors: [color] });
    } else if (!entry.colors.includes(color)) {
      entry.colors.push(color);
    }
  }
  return Array.from(byType.values()).sort((a, b) => a.label.localeCompare(b.label));
}

/** Up to `max` distinct dot colours for a day cell. */
export function dayDotColors(events: readonly OrganizationEvent[] | undefined, max = 3): string[] {
  if (!events?.length) return [];
  const colors: string[] = [];
  for (const event of events) {
    const color = getEventDisplayStyle(event).text;
    if (!colors.includes(color)) colors.push(color);
    if (colors.length >= max) break;
  }
  return colors;
}

/** 6×7 (or 5×7) month grid of dates starting on Sunday, padded with adjacent-month days. */
export function monthGridDates(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Math.ceil((first.getDay() + daysInMonth) / 7) * 7;
  return Array.from({ length: cells }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}
