import type { OrganizationEvent, SchoolEventColorKey, SchoolEventType } from "./types";

export const SCHOOL_EVENT_TYPE_LABELS: Record<SchoolEventType, string> = {
  field_trip: "Field trip",
  no_school: "No school",
  community: "Community",
  academic: "Academic",
  other: "Other",
};

export type EventDisplayStyle = {
  bg: string;
  text: string;
};

export const SCHOOL_EVENT_COLOR_PALETTE: Record<SchoolEventColorKey, EventDisplayStyle> = {
  emerald: { bg: "rgba(16, 185, 129, 0.15)", text: "#047857" },
  red: { bg: "rgba(239, 68, 68, 0.12)", text: "#b91c1c" },
  olive: { bg: "rgba(179, 180, 98, 0.25)", text: "#5C5A30" },
  purple: { bg: "rgba(130, 112, 150, 0.15)", text: "#827096" },
  slate: { bg: "rgba(107, 114, 128, 0.12)", text: "#4b5563" },
  blue: { bg: "rgba(59, 130, 246, 0.12)", text: "#1d4ed8" },
  amber: { bg: "rgba(245, 158, 11, 0.15)", text: "#b45309" },
  rose: { bg: "rgba(244, 63, 94, 0.12)", text: "#be123c" },
  teal: { bg: "rgba(20, 184, 166, 0.12)", text: "#0f766e" },
  indigo: { bg: "rgba(99, 102, 241, 0.12)", text: "#4338ca" },
};

/** Default color per event category — matches original type chip colors. */
export const SCHOOL_EVENT_TYPE_DEFAULT_COLOR: Record<SchoolEventType, SchoolEventColorKey> = {
  field_trip: "emerald",
  no_school: "red",
  community: "olive",
  academic: "purple",
  other: "slate",
};

/** @deprecated Use getEventDisplayStyle instead */
export const SCHOOL_EVENT_TYPE_CHIP_STYLE: Record<SchoolEventType, EventDisplayStyle> = {
  field_trip: SCHOOL_EVENT_COLOR_PALETTE.emerald,
  no_school: SCHOOL_EVENT_COLOR_PALETTE.red,
  community: SCHOOL_EVENT_COLOR_PALETTE.olive,
  academic: SCHOOL_EVENT_COLOR_PALETTE.purple,
  other: SCHOOL_EVENT_COLOR_PALETTE.slate,
};

export const SCHOOL_EVENT_COLOR_KEYS = Object.keys(
  SCHOOL_EVENT_COLOR_PALETTE,
) as SchoolEventColorKey[];

export function getDefaultColorKeyForType(type: SchoolEventType): SchoolEventColorKey {
  return SCHOOL_EVENT_TYPE_DEFAULT_COLOR[type];
}

export function getColorStyle(colorKey: SchoolEventColorKey): EventDisplayStyle {
  return SCHOOL_EVENT_COLOR_PALETTE[colorKey];
}

export function getEventDisplayStyle(event: Pick<OrganizationEvent, "type" | "colorKey">): EventDisplayStyle {
  if (event.colorKey && event.colorKey in SCHOOL_EVENT_COLOR_PALETTE) {
    return SCHOOL_EVENT_COLOR_PALETTE[event.colorKey];
  }
  return SCHOOL_EVENT_COLOR_PALETTE[SCHOOL_EVENT_TYPE_DEFAULT_COLOR[event.type]];
}
