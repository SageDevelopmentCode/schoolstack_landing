import type { CommitteeEvent, CommitteeEventType } from '@/lib/parent/parent-committees-types';
import type { OrganizationEvent, SchoolEventColorKey, SchoolEventType } from '@/lib/school-events/types';

const COMMITTEE_EVENT_TYPE_MAP: Record<CommitteeEventType, SchoolEventType> = {
  meeting: 'community',
  deadline: 'academic',
  service: 'community',
  event: 'other',
};

const COMMITTEE_EVENT_COLOR_MAP: Record<CommitteeEventType, SchoolEventColorKey> = {
  meeting: 'purple',
  deadline: 'amber',
  service: 'emerald',
  event: 'olive',
};

export function committeeEventToOrganizationEvent(
  event: CommitteeEvent,
  organizationId: string,
): OrganizationEvent {
  return {
    id: event.id,
    organizationId,
    title: event.title,
    date: event.date,
    time: event.time,
    isAllDay: !event.time,
    type: COMMITTEE_EVENT_TYPE_MAP[event.type],
    colorKey: COMMITTEE_EVENT_COLOR_MAP[event.type],
    location: event.location,
    sortOrder: 0,
  };
}

export function committeeEventsToOrganizationEvents(
  events: CommitteeEvent[],
  organizationId: string,
): OrganizationEvent[] {
  return events.map((event) => committeeEventToOrganizationEvent(event, organizationId));
}

export function findCommitteeEventById(
  events: CommitteeEvent[],
  eventId: string | null | undefined,
): CommitteeEvent | null {
  if (!eventId) return null;
  return events.find((event) => event.id === eventId) ?? null;
}
