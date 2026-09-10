import type { CSSProperties } from "react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { AdminChipTone } from "@/components/school-admin/ui/story/AdminChip";
import { newAdmissionsId } from "./application-form-schema";

export type CoopTeachingScheduleWeek = {
  id: string;
  startDate: string;
  endDate: string;
  parentInstructor: string;
  parentAssistant: string | null;
  weekName: string;
  seasonalTheme: string;
  characterLesson: string;
  celebrationEvent: string | null;
};

export const DEMO_COOP_TEACHING_SCHEDULE: CoopTeachingScheduleWeek[] = [
  {
    id: "week-late-summer",
    startDate: "2026-08-17",
    endDate: "2026-08-21",
    parentInstructor: "Michelle",
    parentAssistant: "Tom",
    weekName: "Late Summer Week",
    seasonalTheme: "Garden exploration and end-of-summer rhythms",
    characterLesson: "Curiosity & Care: Observing living things with gentle hands",
    celebrationEvent: null,
  },
  {
    id: "week-orientation",
    startDate: "2026-08-24",
    endDate: "2026-08-28",
    parentInstructor: "Karen",
    parentAssistant: "Steve",
    weekName: "Orientation Week",
    seasonalTheme: "Welcome routines, co-op expectations, and community building",
    characterLesson: "Respect & Courtesy: Greeting others and learning together",
    celebrationEvent: null,
  },
  {
    id: "week-sunflower",
    startDate: "2026-08-31",
    endDate: "2026-09-04",
    parentInstructor: "Laura",
    parentAssistant: "Mark",
    weekName: "Sunflower Week",
    seasonalTheme: "Following the sun: seeds, growth, and late-summer blooms",
    characterLesson: "Joy & Sharing: Celebrating new friendships",
    celebrationEvent: "Welcome picnic — Sept 3, at 5:00, Rooted Meadows campus",
  },
  {
    id: "week-apple",
    startDate: "2026-09-14",
    endDate: "2026-09-18",
    parentInstructor: "Jessica and Jared",
    parentAssistant: null,
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
    parentInstructor: "Emily",
    parentAssistant: "Bailey",
    weekName: "Corn Week",
    seasonalTheme: "Respecting growth cycles and farm stewardship",
    characterLesson: "Diligence & Order: Helping Others, Expressing Gratitude",
    celebrationEvent: null,
  },
  {
    id: "week-pumpkin",
    startDate: "2026-09-28",
    endDate: "2026-10-02",
    parentInstructor: "Sarah",
    parentAssistant: "Michael",
    weekName: "Pumpkin Week",
    seasonalTheme: "Seed to harvest: observing change over time",
    characterLesson: "Patience & Wonder: Waiting for things to grow",
    celebrationEvent: "Pumpkin carving afternoon — Oct 1, at 3:00",
  },
  {
    id: "week-harvest",
    startDate: "2026-10-05",
    endDate: "2026-10-09",
    parentInstructor: "Rachel",
    parentAssistant: "David",
    weekName: "Harvest Week",
    seasonalTheme: "Gathering the garden and preparing for winter",
    characterLesson: "Gratitude & Stewardship: Caring for what we have",
    celebrationEvent: null,
  },
  {
    id: "week-leaves",
    startDate: "2026-10-12",
    endDate: "2026-10-16",
    parentInstructor: "Amanda",
    parentAssistant: "Chris",
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

export function newCoopTeachingScheduleWeek(): CoopTeachingScheduleWeek {
  const start = new Date();
  start.setDate(start.getDate() + 14);
  const end = new Date(start);
  end.setDate(end.getDate() + 4);

  return {
    id: newAdmissionsId(),
    startDate: formatIsoDate(start),
    endDate: formatIsoDate(end),
    parentInstructor: "",
    parentAssistant: null,
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
    a.parentInstructor === b.parentInstructor &&
    a.parentAssistant === b.parentAssistant &&
    a.weekName === b.weekName &&
    a.seasonalTheme === b.seasonalTheme &&
    a.characterLesson === b.characterLesson &&
    a.celebrationEvent === b.celebrationEvent
  );
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
