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

export function parseScheduleTab(value: string | null): ScheduleTabId {
  if (
    value === "events" ||
    value === "permissions" ||
    value === "tours" ||
    value === "shadow" ||
    value === "visits"
  ) {
    return value;
  }
  return "overview";
}
