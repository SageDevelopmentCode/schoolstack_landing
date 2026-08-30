import { dateKey } from "@/lib/committees/calendar-utils";
import { SCHOOL_EVENT_TYPE_LABELS } from "@/lib/school-events/event-labels";
import type { OrganizationEvent, SchoolEventType } from "@/lib/school-events/types";
import type { ParentChipTone } from "@/components/school-parent/ui/ParentChip";

const UPCOMING_EVENT_LIMIT = 8;

function sortEvents(events: OrganizationEvent[]): OrganizationEvent[] {
  return [...events].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.sortOrder - b.sortOrder;
  });
}

export function listUpcomingCalendarEvents(
  events: OrganizationEvent[],
  limit = UPCOMING_EVENT_LIMIT,
): OrganizationEvent[] {
  const todayKey = dateKey(new Date());
  return sortEvents(events.filter((event) => event.date >= todayKey)).slice(0, limit);
}

export function eventTypeChipTone(type: SchoolEventType): ParentChipTone {
  switch (type) {
    case "field_trip":
      return "success";
    case "no_school":
      return "alert";
    case "community":
      return "warning";
    case "academic":
      return "info";
    case "other":
    default:
      return "info";
  }
}

export function formatAgendaEventDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(year, (month ?? 1) - 1, day ?? 1);
  return parsed.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function formatAgendaEventMeta(event: OrganizationEvent, timeRange: string): string {
  const dateLabel = formatAgendaEventDate(event.date);
  if (event.isAllDay) return dateLabel;
  return `${dateLabel} · ${timeRange}`;
}

export { SCHOOL_EVENT_TYPE_LABELS };
