export type ScheduleTabId = 'overview' | 'tours' | 'shadow' | 'visits' | 'events';

export const SCHEDULE_TABS: ReadonlyArray<{
  id: ScheduleTabId;
  label: string;
  panelLabel: string;
}> = [
  { id: 'overview', label: 'Overview', panelLabel: 'Schedule overview' },
  { id: 'events', label: 'Events', panelLabel: 'School calendar and events' },
  { id: 'tours', label: 'Tours', panelLabel: 'Tours and interviews availability' },
  { id: 'shadow', label: 'Shadow', panelLabel: 'Shadow and observation day availability' },
  { id: 'visits', label: 'Visits', panelLabel: 'All scheduled visits' },
];

export function parseScheduleTab(value: string | null | undefined): ScheduleTabId {
  if (value === 'events' || value === 'tours' || value === 'shadow' || value === 'visits') {
    return value;
  }
  return 'overview';
}

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
