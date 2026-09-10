import {
  formatTeachingAssignedParents,
  isTeachingParentAssigned,
  isTeachingWeekPast,
  teachingScheduleMonthLabel,
  type CoopTeachingScheduleWeek,
} from "./program-coop-teaching-schedule-mock";

export const COOP_TEACHING_SCHEDULE_MONTH_OPTIONS = [
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
] as const;

export type CoopTeachingScheduleMonth = (typeof COOP_TEACHING_SCHEDULE_MONTH_OPTIONS)[number];

export type CoopTeachingScheduleWhenFilter = "all" | "upcoming" | "past";

export type CoopTeachingScheduleVolunteerFilterParent =
  | "all"
  | "open_spots"
  | "mine"
  | "needs_instructor"
  | "needs_assistant";

export type CoopTeachingScheduleVolunteerFilterAdmin =
  | "all"
  | "needs_instructor"
  | "needs_assistant"
  | "fully_staffed"
  | "has_event";

export type CoopTeachingScheduleFilters = {
  search: string;
  when: CoopTeachingScheduleWhenFilter;
  month: CoopTeachingScheduleMonth | "all";
  volunteer:
    | CoopTeachingScheduleVolunteerFilterParent
    | CoopTeachingScheduleVolunteerFilterAdmin;
};

export const DEFAULT_COOP_TEACHING_SCHEDULE_FILTERS: CoopTeachingScheduleFilters = {
  search: "",
  when: "all",
  month: "all",
  volunteer: "all",
};

export type CoopTeachingScheduleFilterContext =
  | { variant: "parent"; currentParentName: string }
  | { variant: "admin" };

function matchesSearch(week: CoopTeachingScheduleWeek, search: string): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  const haystack = [
    week.weekName,
    week.seasonalTheme,
    week.characterLesson,
    week.celebrationEvent ?? "",
    formatTeachingAssignedParents(week.parentInstructors),
    formatTeachingAssignedParents(week.parentAssistants),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function matchesWhen(week: CoopTeachingScheduleWeek, when: CoopTeachingScheduleWhenFilter): boolean {
  if (when === "all") return true;
  const isPast = isTeachingWeekPast(week);
  return when === "past" ? isPast : !isPast;
}

function matchesMonth(
  week: CoopTeachingScheduleWeek,
  month: CoopTeachingScheduleFilters["month"],
): boolean {
  if (month === "all") return true;
  return teachingScheduleMonthLabel(week.startDate) === month;
}

function weekHasOpenVolunteerSpot(week: CoopTeachingScheduleWeek): boolean {
  return week.parentInstructors.length === 0 || week.parentAssistants.length === 0;
}

function weekIsFullyStaffed(week: CoopTeachingScheduleWeek): boolean {
  return week.parentInstructors.length > 0 && week.parentAssistants.length > 0;
}

function matchesVolunteer(
  week: CoopTeachingScheduleWeek,
  volunteer: CoopTeachingScheduleFilters["volunteer"],
  context: CoopTeachingScheduleFilterContext,
): boolean {
  if (context.variant === "parent") {
    const isMine =
      isTeachingParentAssigned(week.parentInstructors, context.currentParentName) ||
      isTeachingParentAssigned(week.parentAssistants, context.currentParentName);

    switch (volunteer as CoopTeachingScheduleVolunteerFilterParent) {
      case "all":
        return true;
      case "open_spots":
        return weekHasOpenVolunteerSpot(week);
      case "mine":
        return isMine;
      case "needs_instructor":
        return week.parentInstructors.length === 0;
      case "needs_assistant":
        return week.parentAssistants.length === 0;
      default:
        return true;
    }
  }

  switch (volunteer as CoopTeachingScheduleVolunteerFilterAdmin) {
    case "all":
      return true;
    case "needs_instructor":
      return week.parentInstructors.length === 0;
    case "needs_assistant":
      return week.parentAssistants.length === 0;
    case "fully_staffed":
      return weekIsFullyStaffed(week);
    case "has_event":
      return Boolean(week.celebrationEvent?.trim());
    default:
      return true;
  }
}

export function filterCoopTeachingScheduleWeeks(
  weeks: CoopTeachingScheduleWeek[],
  filters: CoopTeachingScheduleFilters,
  context: CoopTeachingScheduleFilterContext,
): CoopTeachingScheduleWeek[] {
  return weeks.filter((week) => {
    if (!matchesSearch(week, filters.search)) return false;
    if (!matchesWhen(week, filters.when)) return false;
    if (!matchesMonth(week, filters.month)) return false;
    if (!matchesVolunteer(week, filters.volunteer, context)) return false;
    return true;
  });
}

export function countActiveCoopTeachingScheduleFilters(
  filters: CoopTeachingScheduleFilters,
): number {
  let count = 0;
  if (filters.search.trim()) count += 1;
  if (filters.when !== "all") count += 1;
  if (filters.month !== "all") count += 1;
  if (filters.volunteer !== "all") count += 1;
  return count;
}

export function parentTeachingScheduleVolunteerFilterOptions(): ReadonlyArray<{
  value: CoopTeachingScheduleVolunteerFilterParent;
  label: string;
}> {
  return [
    { value: "all", label: "All volunteer status" },
    { value: "open_spots", label: "Open volunteer spots" },
    { value: "mine", label: "My sign-ups" },
    { value: "needs_instructor", label: "Needs instructor" },
    { value: "needs_assistant", label: "Needs assistant" },
  ];
}

export function adminTeachingScheduleVolunteerFilterOptions(): ReadonlyArray<{
  value: CoopTeachingScheduleVolunteerFilterAdmin;
  label: string;
}> {
  return [
    { value: "all", label: "All volunteer status" },
    { value: "needs_instructor", label: "Needs instructor" },
    { value: "needs_assistant", label: "Needs assistant" },
    { value: "fully_staffed", label: "Fully staffed" },
    { value: "has_event", label: "Has celebration/event" },
  ];
}

export function coopTeachingScheduleWhenFilterOptions() {
  return [
    { value: "all", label: "All weeks" },
    { value: "upcoming", label: "Upcoming" },
    { value: "past", label: "Past" },
  ];
}

export function coopTeachingScheduleMonthFilterOptions() {
  return [
    { value: "all", label: "All months" },
    ...COOP_TEACHING_SCHEDULE_MONTH_OPTIONS.map((month) => ({
      value: month,
      label: month,
    })),
  ];
}
