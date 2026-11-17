export type ScheduleTabId =
  | "overview"
  | "tours"
  | "shadow"
  | "visits"
  | "events"
  | "permissions";

export const SCHEDULE_TABS: ReadonlyArray<{
  id: ScheduleTabId;
  label: string;
  panelLabel: string;
}> = [
  { id: "overview", label: "Overview", panelLabel: "Schedule overview" },
  { id: "events", label: "Events", panelLabel: "School calendar and events" },
  {
    id: "permissions",
    label: "Permissions",
    panelLabel: "Calendar event permissions",
  },
  { id: "tours", label: "Tours & interviews", panelLabel: "Tours and interviews availability" },
  { id: "shadow", label: "Shadow days", panelLabel: "Shadow and observation day availability" },
  { id: "visits", label: "All visits", panelLabel: "All scheduled visits" },
];

/** Tabs a free school sees with a lock: they open the unlock popup instead. */
export const FREE_PLAN_LOCKED_SCHEDULE_TABS: readonly ScheduleTabId[] = [
  "overview",
  "events",
  "permissions",
  "shadow",
];

/** Tab from `?tab=`; a locked tab (free plan) falls back to Tours & interviews. */
export function parseScheduleTab(
  value: string | null,
  lockedTabs: readonly ScheduleTabId[] = [],
): ScheduleTabId {
  let tab: ScheduleTabId = "overview";
  if (
    value === "events" ||
    value === "permissions" ||
    value === "tours" ||
    value === "shadow" ||
    value === "visits"
  ) {
    tab = value;
  }
  return lockedTabs.includes(tab) ? "tours" : tab;
}

export type ToursSubtabId = "availability" | "submissions" | "public-tour";

export function parseToursSubtab(value: string | null): ToursSubtabId {
  if (value === "public-tour") return "public-tour";
  if (value === "submissions") return "submissions";
  return "availability";
}
