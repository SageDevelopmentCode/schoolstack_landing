import type { CSSProperties } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { AdminChipTone } from "@/components/school-admin/ui/story/AdminChip";
import { newAdmissionsId } from "./application-form-schema";

export type CoopTeachingScheduleWeek = {
  id: string;
  startDate: string;
  endDate: string;
  parentInstructors: string[];
  parentAssistants: string[];
  weekName: string;
  seasonalTheme: string;
  characterLesson: string;
  celebrationEvent: string | null;
};

export type TeachingScheduleParentRole = "instructor" | "assistant";

export const DEMO_COOP_TEACHING_SCHEDULE: CoopTeachingScheduleWeek[] = [
  {
    id: "week-late-summer",
    startDate: "2026-08-17",
    endDate: "2026-08-21",
    parentInstructors: ["Michelle"],
    parentAssistants: ["Tom"],
    weekName: "Late Summer Week",
    seasonalTheme: "Garden exploration and end-of-summer rhythms",
    characterLesson: "Curiosity & Care: Observing living things with gentle hands",
    celebrationEvent: null,
  },
  {
    id: "week-orientation",
    startDate: "2026-08-24",
    endDate: "2026-08-28",
    parentInstructors: ["Karen"],
    parentAssistants: ["Steve"],
    weekName: "Orientation Week",
    seasonalTheme: "Welcome routines, co-op expectations, and community building",
    characterLesson: "Respect & Courtesy: Greeting others and learning together",
    celebrationEvent: null,
  },
  {
    id: "week-sunflower",
    startDate: "2026-08-31",
    endDate: "2026-09-04",
    parentInstructors: ["Laura"],
    parentAssistants: ["Mark"],
    weekName: "Sunflower Week",
    seasonalTheme: "Following the sun: seeds, growth, and late-summer blooms",
    characterLesson: "Joy & Sharing: Celebrating new friendships",
    celebrationEvent: "Welcome picnic — Sept 3, at 5:00, Rooted Meadows campus",
  },
  {
    id: "week-apple",
    startDate: "2026-09-14",
    endDate: "2026-09-18",
    parentInstructors: ["Jessica and Jared"],
    parentAssistants: [],
    weekName: "Apple Week",
    seasonalTheme: "Apple Picking & Grain Grinding",
    characterLesson:
      "Appreciation of Nature: Careful harvesting, generosity, meeting new people",
    celebrationEvent:
      "Family Gathering Potluck — Sept 11, at 5:30, 3833 E 200 N Rigby",
  },
  {
    id: "week-corn",
    startDate: "2026-09-21",
    endDate: "2026-09-25",
    parentInstructors: ["Emily"],
    parentAssistants: ["Bailey"],
    weekName: "Corn Week",
    seasonalTheme: "Respecting growth cycles and farm stewardship",
    characterLesson: "Diligence & Order: Helping Others, Expressing Gratitude",
    celebrationEvent: null,
  },
  {
    id: "week-pumpkin",
    startDate: "2026-09-28",
    endDate: "2026-10-02",
    parentInstructors: ["Sarah"],
    parentAssistants: ["Michael"],
    weekName: "Pumpkin Week",
    seasonalTheme: "Seed to harvest: observing change over time",
    characterLesson: "Patience & Wonder: Waiting for things to grow",
    celebrationEvent: "Pumpkin carving afternoon — Oct 1, at 3:00",
  },
  {
    id: "week-harvest",
    startDate: "2026-10-05",
    endDate: "2026-10-09",
    parentInstructors: ["Rachel"],
    parentAssistants: ["David"],
    weekName: "Harvest Week",
    seasonalTheme: "Gathering the garden and preparing for winter",
    characterLesson: "Gratitude & Stewardship: Caring for what we have",
    celebrationEvent: null,
  },
  {
    id: "week-leaves",
    startDate: "2026-10-12",
    endDate: "2026-10-16",
    parentInstructors: ["Amanda"],
    parentAssistants: ["Chris"],
    weekName: "Leaves Week",
    seasonalTheme: "Autumn colors, leaf pressing, and seasonal rhythms",
    characterLesson: "Observation & Beauty: Noticing small details in nature",
    celebrationEvent: "Fall nature walk — Oct 15, at 10:00, Community Park",
  },
];

function toDateOnly(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function parseScheduleDate(value: string): Date {
  return toDateOnly(new Date(`${value}T12:00:00`));
}

function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function teachingParentArraysEqual(a: ReadonlyArray<string>, b: ReadonlyArray<string>): boolean {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

export function normalizeTeachingParentName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function formatTeachingAssignedParents(people: ReadonlyArray<string>): string {
  if (people.length === 0) return "—";
  return people.join(", ");
}

export function isTeachingParentAssigned(
  people: ReadonlyArray<string>,
  name: string,
): boolean {
  const normalized = normalizeTeachingParentName(name);
  if (!normalized) return false;
  const lower = normalized.toLowerCase();
  return people.some((person) => person.toLowerCase() === lower);
}

export function canParentSignUpForTeachingRole(people: ReadonlyArray<string>): boolean {
  return people.length === 0;
}

export function canAddTeachingAssignedParent(
  people: ReadonlyArray<string>,
  name: string,
): boolean {
  const normalized = normalizeTeachingParentName(name);
  if (!normalized) return false;
  const lower = normalized.toLowerCase();
  return !people.some((person) => person.toLowerCase() === lower);
}

export function getTeachingScheduleParentsForRole(
  week: CoopTeachingScheduleWeek,
  role: TeachingScheduleParentRole,
): string[] {
  return role === "instructor" ? week.parentInstructors : week.parentAssistants;
}

export function newCoopTeachingScheduleWeek(): CoopTeachingScheduleWeek {
  const start = new Date();
  start.setDate(start.getDate() + 14);
  const end = new Date(start);
  end.setDate(end.getDate() + 4);

  return {
    id: newAdmissionsId(),
    startDate: formatIsoDate(start),
    endDate: formatIsoDate(end),
    parentInstructors: [],
    parentAssistants: [],
    weekName: "",
    seasonalTheme: "",
    characterLesson: "",
    celebrationEvent: null,
  };
}

export function areCoopTeachingScheduleWeeksEqual(
  a: CoopTeachingScheduleWeek,
  b: CoopTeachingScheduleWeek,
): boolean {
  return (
    a.id === b.id &&
    a.startDate === b.startDate &&
    a.endDate === b.endDate &&
    teachingParentArraysEqual(a.parentInstructors, b.parentInstructors) &&
    teachingParentArraysEqual(a.parentAssistants, b.parentAssistants) &&
    a.weekName === b.weekName &&
    a.seasonalTheme === b.seasonalTheme &&
    a.characterLesson === b.characterLesson &&
    a.celebrationEvent === b.celebrationEvent
  );
}

export function isCoopTeachingScheduleWeekComplete(week: CoopTeachingScheduleWeek): boolean {
  if (!week.startDate.trim() || !week.endDate.trim()) return false;
  if (!week.weekName.trim()) return false;
  if (!week.seasonalTheme.trim()) return false;
  if (!week.characterLesson.trim()) return false;
  if (parseScheduleDate(week.endDate) < parseScheduleDate(week.startDate)) return false;
  return true;
}

export function isTeachingWeekPast(
  week: CoopTeachingScheduleWeek,
  referenceDate: Date = new Date(),
): boolean {
  const today = toDateOnly(referenceDate);
  const endDate = parseScheduleDate(week.endDate);
  return endDate < today;
}

export function teachingScheduleStatusLabel(
  week: CoopTeachingScheduleWeek,
  referenceDate?: Date,
): "Completed" | "Upcoming" {
  return isTeachingWeekPast(week, referenceDate) ? "Completed" : "Upcoming";
}

export function teachingScheduleWeekChipTone(
  week: CoopTeachingScheduleWeek,
  referenceDate?: Date,
): AdminChipTone {
  return isTeachingWeekPast(week, referenceDate) ? "purple" : "info";
}

export function teachingScheduleStatusChipTone(
  week: CoopTeachingScheduleWeek,
  referenceDate?: Date,
): AdminChipTone {
  return isTeachingWeekPast(week, referenceDate) ? "purple" : "success";
}

export function teachingScheduleMonthLabel(startDate: string): string {
  const date = parseScheduleDate(startDate);
  return date.toLocaleDateString("en-US", { month: "short" });
}

export function teachingScheduleRowSurfaceStyle({
  variant,
  parentTheme,
  C,
  isPast,
  isSelected = false,
  isHovered = false,
}: {
  variant: "parent" | "admin";
  parentTheme?: ParentThemeTokens;
  C?: AdminThemeTokens;
  isPast: boolean;
  isSelected?: boolean;
  isHovered?: boolean;
}): CSSProperties {
  if (variant === "parent" && parentTheme) {
    let backgroundColor = parentTheme.white;
    if (isHovered) {
      backgroundColor = isPast ? "#F3F5F3" : "#F7F9F7";
    } else if (isPast) {
      backgroundColor = "#FAFBFA";
    }

    return {
      backgroundColor,
      border: "1px solid rgba(74, 97, 82, 0.1)",
      borderRadius: parentTheme.radiusCard,
      boxShadow: parentTheme.shadowCard,
    };
  }

  let backgroundColor = "#FFFFFF";
  if (isSelected && C) {
    backgroundColor = C.accentLight;
  } else if (isPast) {
    backgroundColor = isHovered ? "#F3F5F3" : "#FAFBFA";
  } else if (isHovered) {
    backgroundColor = "#F7F9F7";
  }

  const borderColor = C?.border ?? "#EDF1ED";
  const defaultBorder = `1px solid ${borderColor}`;

  return {
    backgroundColor,
    borderTop: defaultBorder,
    borderRight: defaultBorder,
    borderBottom: defaultBorder,
    borderLeft: isSelected && C ? `3px solid ${C.accent}` : defaultBorder,
    borderRadius: C?.r?.md ?? "8px",
    boxShadow: "0 1px 3px rgba(26, 47, 37, 0.06)",
  };
}

export function teachingScheduleRowStyle(
  C: AdminThemeTokens,
  {
    isPast,
    isSelected,
    isHovered,
  }: {
    isPast: boolean;
    isSelected: boolean;
    isHovered: boolean;
  },
): Pick<CSSProperties, "backgroundColor" | "borderLeft"> {
  if (isSelected) {
    return {
      backgroundColor: C.accentLight,
      borderLeft: `3px solid ${C.accent}`,
    };
  }

  if (isPast) {
    return {
      backgroundColor: isHovered ? "#F3F5F3" : "#F8FAF8",
      borderLeft: "3px solid transparent",
    };
  }

  if (isHovered) {
    return {
      backgroundColor: "#F7F9F7",
      borderLeft: "3px solid transparent",
    };
  }

  return {
    backgroundColor: "transparent",
    borderLeft: "3px solid transparent",
  };
}

export function sortTeachingScheduleWeeks(
  weeks: CoopTeachingScheduleWeek[],
): CoopTeachingScheduleWeek[] {
  return [...weeks].sort(
    (a, b) => parseScheduleDate(a.startDate).getTime() - parseScheduleDate(b.startDate).getTime(),
  );
}

export function formatTeachingScheduleDateRange(startDate: string, endDate: string): string {
  const start = parseScheduleDate(startDate);
  const end = parseScheduleDate(endDate);

  const startMonth = start.toLocaleDateString("en-US", { month: "short" });
  const endMonth = end.toLocaleDateString("en-US", { month: "short" });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const year = end.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} – ${endDay}, ${year}`;
  }

  return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
}

export function teachingScheduleEmptyCell(value: string | null | undefined): string {
  return value?.trim() ? value.trim() : "—";
}

export function teachingScheduleWeekDisplayName(week: CoopTeachingScheduleWeek): string {
  const trimmed = week.weekName.trim();
  return trimmed || "New teaching week";
}

export type TeachingScheduleSummary = {
  weekCount: number;
  eventCount: number;
  completedCount: number;
  nextWeekName: string;
};

export function computeTeachingScheduleSummary(
  weeks: CoopTeachingScheduleWeek[],
  referenceDate: Date = new Date(),
): TeachingScheduleSummary {
  const sorted = sortTeachingScheduleWeeks(weeks);
  const nextUpcoming = sorted.find((week) => !isTeachingWeekPast(week, referenceDate));

  return {
    weekCount: weeks.length,
    eventCount: weeks.filter((week) => week.celebrationEvent?.trim()).length,
    completedCount: weeks.filter((week) => isTeachingWeekPast(week, referenceDate)).length,
    nextWeekName: nextUpcoming?.weekName ?? "—",
  };
}
