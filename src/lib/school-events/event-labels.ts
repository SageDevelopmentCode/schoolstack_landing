import type { SchoolEventType } from "./types";

export const SCHOOL_EVENT_TYPE_LABELS: Record<SchoolEventType, string> = {
  field_trip: "Field trip",
  no_school: "No school",
  community: "Community",
  academic: "Academic",
  other: "Other",
};

export const SCHOOL_EVENT_TYPE_CHIP_STYLE: Record<
  SchoolEventType,
  { bg: string; text: string }
> = {
  field_trip: { bg: "rgba(16, 185, 129, 0.15)", text: "#047857" },
  no_school: { bg: "rgba(239, 68, 68, 0.12)", text: "#b91c1c" },
  community: { bg: "rgba(179, 180, 98, 0.25)", text: "#5C5A30" },
  academic: { bg: "rgba(130, 112, 150, 0.15)", text: "#827096" },
  other: { bg: "rgba(107, 114, 128, 0.12)", text: "#4b5563" },
};
