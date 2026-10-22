import type { ParentCoopTeachingScheduleWeek } from '@/lib/parent/parent-portal-api';

export const COOP_TEACHING_SCHEDULE_MAX_ASSIGNED_FAMILIES_PER_ROLE = 5;

export type TeachingScheduleParentRole = 'instructor' | 'assistant';

function toDateOnly(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function parseScheduleDate(value: string): Date {
  return toDateOnly(new Date(`${value}T12:00:00`));
}

export function formatTeachingAssignedParents(
  familyIds: readonly string[],
  nameMap: Record<string, string> = {},
): string {
  if (familyIds.length === 0) return 'Open';
  return familyIds.map((id) => nameMap[id] ?? 'Family').join(', ');
}

export function isTeachingWeekPast(
  week: Pick<ParentCoopTeachingScheduleWeek, 'endDate'>,
  referenceDate: Date = new Date(),
): boolean {
  const today = toDateOnly(referenceDate);
  const endDate = parseScheduleDate(week.endDate);
  return endDate < today;
}

export function sortTeachingScheduleWeeks(
  weeks: ParentCoopTeachingScheduleWeek[],
): ParentCoopTeachingScheduleWeek[] {
  return [...weeks].sort(
    (a, b) => parseScheduleDate(a.startDate).getTime() - parseScheduleDate(b.startDate).getTime(),
  );
}

export function formatTeachingScheduleDateRange(startDate: string, endDate: string): string {
  const start = parseScheduleDate(startDate);
  const end = parseScheduleDate(endDate);

  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const year = end.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} – ${endDay}, ${year}`;
  }

  return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
}

export type TeachingScheduleSummary = {
  weekCount: number;
  eventCount: number;
  completedCount: number;
  nextWeekName: string;
};

export function computeTeachingScheduleSummary(
  weeks: ParentCoopTeachingScheduleWeek[],
  referenceDate: Date = new Date(),
): TeachingScheduleSummary {
  const sorted = sortTeachingScheduleWeeks(weeks);
  const nextUpcoming = sorted.find((week) => !isTeachingWeekPast(week, referenceDate));

  return {
    weekCount: weeks.length,
    eventCount: weeks.filter((week) => week.celebrationEvent?.trim()).length,
    completedCount: weeks.filter((week) => isTeachingWeekPast(week, referenceDate)).length,
    nextWeekName: nextUpcoming?.weekName?.trim() || '—',
  };
}

export function getTeachingScheduleFamilyIdsForRole(
  week: ParentCoopTeachingScheduleWeek,
  role: TeachingScheduleParentRole,
): string[] {
  return role === 'instructor' ? week.instructorFamilyIds : week.assistantFamilyIds;
}

export function isTeachingParentAssigned(familyIds: readonly string[], familyId: string): boolean {
  return familyId.length > 0 && familyIds.includes(familyId);
}

export function canParentSignUpForTeachingRole(familyIds: readonly string[]): boolean {
  return familyIds.length === 0;
}

export function teachingScheduleWeekDisplayName(week: ParentCoopTeachingScheduleWeek): string {
  const trimmed = week.weekName.trim();
  return trimmed || 'Teaching week';
}

export function teachingScheduleMonthLabel(startDate: string): string {
  const date = parseScheduleDate(startDate);
  return date.toLocaleDateString('en-US', { month: 'short' });
}

export type MobileTeachingScheduleFilterKey = 'all' | 'upcoming' | 'mine' | 'open_spots';

export function filterMobileTeachingScheduleWeeks(
  weeks: ParentCoopTeachingScheduleWeek[],
  filterKey: MobileTeachingScheduleFilterKey,
  currentFamilyId: string,
): ParentCoopTeachingScheduleWeek[] {
  return weeks.filter((week) => {
    switch (filterKey) {
      case 'upcoming':
        return !isTeachingWeekPast(week);
      case 'mine':
        return (
          isTeachingParentAssigned(week.instructorFamilyIds, currentFamilyId) ||
          isTeachingParentAssigned(week.assistantFamilyIds, currentFamilyId)
        );
      case 'open_spots':
        return week.instructorFamilyIds.length === 0 || week.assistantFamilyIds.length === 0;
      default:
        return true;
    }
  });
}

export const MOBILE_TEACHING_SCHEDULE_FILTER_PILLS: ReadonlyArray<{
  key: MobileTeachingScheduleFilterKey;
  label: string;
}> = [
  { key: 'all', label: 'All weeks' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'mine', label: 'My weeks' },
  { key: 'open_spots', label: 'Open slots' },
];
