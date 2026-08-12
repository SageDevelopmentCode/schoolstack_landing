import type { OrganizationEvent, SchoolEventType } from "./types";

export type OrganizationEventRow = {
  id: string;
  organization_id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  is_all_day: boolean;
  event_type: SchoolEventType;
  location: string | null;
  description: string | null;
  sort_order: number;
};

export function mapOrganizationEventRow(row: OrganizationEventRow): OrganizationEvent {
  return {
    id: row.id,
    organizationId: row.organization_id,
    title: row.title,
    date: row.event_date,
    time: row.event_time ?? undefined,
    isAllDay: row.is_all_day,
    type: row.event_type,
    location: row.location ?? undefined,
    description: row.description ?? undefined,
    sortOrder: row.sort_order,
  };
}
